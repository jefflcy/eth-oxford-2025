"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useAccount, useReadContract } from "wagmi";

// ----- Contract details (replace with actual values) -----
const marketplaceAddress = "0x386d37629a915F0Bf74918b835E682d52Ea57E81"; // Replace with your deployed contract address
const contractAbi = [
  {
    inputs: [],
    name: "getAllOrders",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "id", type: "uint256" },
          { internalType: "uint8", name: "status", type: "uint8" },
          { internalType: "address", name: "onChainSeller", type: "address" },
          { internalType: "address", name: "offChainBuyer", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
          { internalType: "uint256", name: "price", type: "uint256" },
          { internalType: "string", name: "currency", type: "string" },
          { internalType: "uint256", name: "deadline", type: "uint256" },
        ],
        internalType: "struct Order[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

// ----- Navbar Component -----
function Navbar({ onCreateOrder, onConnectWallet }) {
  const { isConnected } = useAccount();

  return (
    <nav className="w-full flex items-center justify-between px-6 py-4 fixed top-0 z-20 bg-white shadow">
      {/* Logo */}
      <div className="text-2xl font-bold text-[#FF69B4]">FlareGate</div>
      {/* Action Buttons */}
      <div className="flex space-x-4">
        {isConnected && (
          <button
            onClick={onCreateOrder}
            className="bg-transparent border border-pink-500 text-pink-500 rounded-full px-4 py-2 transition hover:bg-pink-500 hover:text-white"
          >
            Create Order
          </button>
        )}
<appkit-button/>

      </div>
    </nav>
  );
}

// ----- CreateOrderModal Component -----
function CreateOrderModal({ onClose }) {
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [cflr2, setCflr2] = useState("");
  const [paymentDetails, setPaymentDetails] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Revolut");


  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Order created:", {
      price,
      currency,
      cflr2,
      paymentDetails,
      paymentMethod,
    });
    // Implement order creation logic here
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-50"
    >
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-white text-black rounded-lg p-6 z-50 w-96"
      >
        <h2 className="text-xl font-bold mb-4 text-[#FF69B4]">Create Order</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Price</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Enter price"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Number of CFLR2</label>
            <input
              type="number"
              value={cflr2}
              onChange={(e) => setCflr2(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Enter number of CFLR2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Payment Details</label>
            <input
              type="email"
              value={paymentDetails}
              onChange={(e) => setPaymentDetails(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Enter Revolut email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="Revolut">Revolut</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-transparent border border-[#FF69B4] text-[#FF69B4] rounded-full px-4 py-2 transition hover:bg-[#FF69B4] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#FF69B4] hover:bg-[#FF5BA0] text-white rounded-full px-4 py-2 transition"
            >
              Submit Order
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ----- OrderModal Component for accepting an order -----
function OrderModal({ order, onClose }) {
  // Order state: "idle" (waiting for action); "pending" (waiting for payment/attestation); "accepted" (payment complete)
  const [status, setStatus] = useState("idle");

  const handleAcceptOrder = () => {
    setStatus("pending");
    // Simulate pending state for 90 seconds
    setTimeout(() => {
      setStatus("accepted");
    }, 90000);
  };

  const handleClaimTokens = () => {
    // Simulate claiming tokens, then close the modal
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-50"
    >
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-white text-black rounded-lg p-6 z-50 w-80"
      >
        <h2 className="text-xl font-bold mb-4">{order.title}</h2>
        <p className="mb-2">You pay {order.price}</p>
        <p className="mb-4">You get {order.quantity}</p>
        {status === "idle" && (
          <button
            onClick={handleAcceptOrder}
            className="bg-[#FF69B4] hover:bg-[#FF5BA0] text-white rounded-full px-4 py-2 transition w-full"
          >
            Accept Order
          </button>
        )}
        {status === "pending" && (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-6 h-6 border-4 border-[#FF69B4] border-t-transparent rounded-full animate-spin"></div>
            <span>Waiting for payment and attestation...</span>
          </div>
        )}
        {status === "accepted" && (
          <div className="flex flex-col items-center space-y-4">
            <div className="text-[#FF69B4] text-4xl">✓</div>
            <button
              onClick={handleClaimTokens}
              className="bg-[#FF69B4] hover:bg-[#FF5BA0] text-white rounded-full px-4 py-2 transition w-full"
            >
              Claim Tokens
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ----- Main Page Component -----
export default function Home() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);

  // Use Wagmi's useReadContract to fetch orders from your contract
  const { data: ordersData, isLoading, isError } = useReadContract({
    address: marketplaceAddress,
    abi: contractAbi,
    functionName: "getAllOrders",
  });
  
  console.log("Orders Data:", ordersData);
  // Transform fetched orders (if any) into the shape expected by the UI.
  const fetchedOrders = ordersData
    ? ordersData.map((order) => ({
        id: order.id.toString(),
        title: `Order #${order.id.toString()}`,
        price: `${order.price.toString()} ${order.currency}`,
        quantity: `${order.amount.toString()} CFLR2`,
      }))
    : [];

  return (
    <div className="min-h-screen bg-white text-black relative">
      {/* Navbar */}
      <Navbar
        onCreateOrder={() => setShowCreateOrderModal(true)}
        onConnectWallet={() => console.log("Navbar: Connect Wallet clicked")}
      />
      <div className="pt-20 pb-8 px-6">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-[#FF69B4]"> </h1>
          <p className="text-xl md:text-2xl text-gray-600">
              All Orders
          </p>
        </motion.div>
        {/* Grid of Order Cards */}
        {isLoading ? (
          <p>Loading orders...</p>
        ) : isError ? (
          <p>Error fetching orders</p>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            {fetchedOrders.length === 0 ? (
              <p>No orders found.</p>
            ) : (
              fetchedOrders.map((order) => (
                <motion.div
                  key={order.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedOrder(order)}
                  className="group bg-white border border-[#FF69B4] rounded-lg p-4 cursor-pointer hover:bg-[#FF69B4] hover:text-white transition"
                >
                  <h2 className="text-lg font-semibold group-hover:text-white">{order.title}</h2>
                  <p className="text-sm text-black group-hover:text-white">{order.price}</p>
                  <p className="text-sm text-black group-hover:text-white">{order.quantity}</p>
                  <p className="text-xs text-gray-500 group-hover:text-white">Click for details</p>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </div>
      {/* Modals */}
      <AnimatePresence>
        {selectedOrder && (
          <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
        )}
        {showCreateOrderModal && (
          <CreateOrderModal onClose={() => setShowCreateOrderModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
