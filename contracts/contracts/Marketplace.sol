// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {ContractRegistry} from "@flarenetwork/flare-periphery-contracts/coston2/ContractRegistry.sol";

// Dummy import to get artifacts for IFDCHub
import {IFdcHub} from "@flarenetwork/flare-periphery-contracts/coston2/IFdcHub.sol";
import {IFdcRequestFeeConfigurations} from "@flarenetwork/flare-periphery-contracts/coston2/IFdcRequestFeeConfigurations.sol";

import {IJsonApi} from "@flarenetwork/flare-periphery-contracts/coston2/IJsonApi.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

enum OrderStatus {
    AVAILABLE,
    ACCEPTED,
    PAID,
    COMPLETED,
    CANCELLED
}

struct Order {
    uint256 id;
    OrderStatus status;
    address onChainSeller;
    address offChainBuyer;
    uint256 amount; // amount of crypto sold in wei
    uint256 price; // fiat price, multiplied by 100 (ie. 250.50 is 25050)
    string currency;
    uint256 deadline; // deadline for the order to be completed
}

struct DataTransportObject {
    uint256 onChainOrderId;
    address onChainSeller;
    uint256 paidAmt;
    string paidCurrency;
    uint256 paidTimestamp;
    string offChainReference;
}

contract Marketplace {

    event OrderCreated(uint256 indexed orderId, address indexed by);
    event OrderAccepted(
        uint256 indexed orderId,
        address indexed by,
        uint256 deadline
    );
    event OrderPaid(uint256 indexed orderId, address indexed by);
    event OrderCompleted(uint256 indexed orderId);

    string[] public acceptedCurrencies;
    Order[] public allOrders;

    constructor(string[] memory _acceptedCurrencies) {
        acceptedCurrencies = _acceptedCurrencies; // ["USD', "EUR", "GBP"]
    }

    // onChainSeller creates an order to sell crypto
    function createOrder(
        uint256 price,
        string calldata currency
    ) external payable {
        address seller = msg.sender;
        uint256 amount = msg.value; // for now only support native token

        require(price > 0, "Price must be greater than 0");
        require(amount > 0, "Amount must be greater than 0");
        require(isValidCurrency(currency), "Invalid currency");

        // Create a new order
        Order memory newOrder = Order({
            id: allOrders.length,
            status: OrderStatus.AVAILABLE,
            onChainSeller: seller,
            offChainBuyer: address(0),
            amount: amount,
            price: price, // amount in fiat multiplied by 100 (ie. 250.50 is 25050)
            currency: currency,
            deadline: 2 ** 256 - 1 // max uint256 value
        });

        allOrders.push(newOrder);

        emit OrderCreated(newOrder.id, seller);
    }

    // offChainBuyer accepts an order that he is willing to pay fiat for
    // TODO: ADD A SECURITY DEPOSIT OR BLACKLIST CHECKER SO THAT BUYERS WILL LOSE $$ IF ACCEPT MANY BUT DONT PAY FIAT
    function acceptOrder(uint256 id) external {
        Order storage order = allOrders[id];
        require(order.status == OrderStatus.AVAILABLE, "Order is not available"); // must not be accepted, paid, completed or cancelled

        // Update the order status
        order.status = OrderStatus.ACCEPTED;
        order.offChainBuyer = msg.sender;
        order.deadline = block.timestamp + 1 days; // 1 day deadline

        // Emit the event to log the order acceptance
        emit OrderAccepted(order.id, msg.sender, block.timestamp + 1 days);
    }

    // called by backend during submitProof to record attested fiat payment
    function recordFiatPayment(IJsonApi.Proof calldata _proof) public {
        require(ContractRegistry.auxiliaryGetIJsonApiVerification().verifyJsonApi(_proof), "Invalid proof");
        
        DataTransportObject memory dto = abi.decode(
            _proof.data.responseBody.abi_encoded_data,
            (DataTransportObject)
        );

        Order memory order = allOrders[dto.onChainOrderId];

        require(order.status == OrderStatus.ACCEPTED, "Order is not accepted"); // state must only be accepted
        require(dto.paidAmt == order.price, "Invalid amount paid"); // must match the order price
        require(keccak256(abi.encodePacked(dto.paidCurrency)) == keccak256(abi.encodePacked(order.currency)), "Invalid currency paid"); // must match the order currency
        require(dto.paidTimestamp <= order.deadline, "Order is expired"); // must not be expired, if expired gg to the off chain buyer 

        allOrders[dto.onChainOrderId].status = OrderStatus.PAID; // update the order status to paid
        allOrders[dto.onChainOrderId].deadline = block.timestamp; // update the order deadline to be now (so when block is built, order is "expired")
    }

    // offChainBuyer is able to claim his crypto tokens now
    function claimTokens(uint256 orderId) external {
        Order storage order = allOrders[orderId];
        require(order.status == OrderStatus.PAID, "Order is not paid");

        order.status = OrderStatus.COMPLETED; // update the order status to completed
        payable(order.offChainBuyer).transfer(order.amount); // pay the offChainBuyer

        emit OrderCompleted(orderId);
    }

    // function to purge state of accepted orders that have past deadline
    function purgeExpired() external {
        for (uint256 i = 0; i < allOrders.length; i++) {
            if (allOrders[i].status == OrderStatus.ACCEPTED && allOrders[i].deadline < block.timestamp) {
                allOrders[i].status = OrderStatus.AVAILABLE;
                allOrders[i].offChainBuyer = address(0);
                allOrders[i].deadline = 2 ** 256 - 1; // reset to max deadline
            }
        }
    }

    function cancelOrder(uint256 id) external {
        Order storage order = allOrders[id];
        require(order.onChainSeller == msg.sender, "Not your order to cancel");
        require(order.status == OrderStatus.AVAILABLE, "Order is not available"); // must not be accepted, paid, completed or cancelled

        // Update the order status
        order.status = OrderStatus.CANCELLED; // cancelled
        order.deadline = block.timestamp; // update the order deadline to be now (so when block is built, order is "expired")   
    }

    /* HELPER FUNCTIONS */

    // Helper function to get all orders
    function getAllOrders() public view returns (Order[] memory) {
        return allOrders;
    }

    // Helper function to determine if currency is accepted
    function isValidCurrency(string calldata curr) public view returns (bool) {
        for (uint256 i = 0; i < acceptedCurrencies.length; i++) {
            if (keccak256(abi.encodePacked(acceptedCurrencies[i])) == keccak256(abi.encodePacked(curr))) {
                return true;
            }
        }
        return false;
    }

    // Helper function to retrieve orders of a specific address
    function getOrdersByAddress(
        address seller
    ) public view returns (Order[] memory) {
        uint256 orderCount = 0;
        for (uint256 i = 0; i < allOrders.length; i++) {
            if (allOrders[i].onChainSeller == seller) {
                orderCount++;
            }
        }

        Order[] memory sellerOrders = new Order[](orderCount);
        uint256 index = 0;
        for (uint256 i = 0; i < allOrders.length; i++) {
            if (allOrders[i].onChainSeller == seller) {
                sellerOrders[index] = allOrders[i];
                index++;
            }
        }

        return sellerOrders;
    }

    // Helper function to retrieve order
    function getOrder(uint256 id) public view returns (Order memory) {
        return allOrders[id];
    }
}
