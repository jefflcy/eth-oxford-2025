"use client";

import { marketplaceABI, marketplaceAddress } from '@/lib/marketplaceContract';
import { formatEther, parseUnits } from "ethers";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { supabase } from '../../lib/supabaseClient';

let order_count = 0;

// ----- Navbar Component -----
function Navbar({ onCreateOrder, onConnectWallet }) {
  const { isConnected, address } = useAccount();

  return (
    <nav className="w-full flex items-center justify-between px-6 py-4 fixed top-0 z-20 bg-white shadow">
      {/* Logo */}
      <div className="text-2xl font-bold text-[#FF69B4] flaregate-font">FlareGate</div>
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
  const [loading, setLoading] = useState(false);
  const { writeContractAsync } = useWriteContract();


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    // Convert price to cents and validate
    let sanitizedPrice = parseFloat(price);
    if (isNaN(sanitizedPrice) || sanitizedPrice <= 0) {
      alert("Invalid price. Please enter a positive number.");
      setLoading(false);
      return;
    }
    sanitizedPrice = Math.round(sanitizedPrice * 100);
  
    // Validate currency (uppercase and allowed list)
    const allowedCurrencies = ["USD", "EUR", "GBP"];
    const sanitizedCurrency = currency.toUpperCase();
    if (!allowedCurrencies.includes(sanitizedCurrency)) {
      alert("Invalid currency. Allowed values: USD, EUR, GBP.");
      setLoading(false);
      return;
    }
  
    // Validate other required fields
    if (!cflr2 || isNaN(parseFloat(cflr2)) || parseFloat(cflr2) <= 0) {
      alert("Invalid number of C2FLR.");
      setLoading(false);
      return;
    }
    if (!paymentDetails.trim()) {
      alert("Payment details cannot be empty.");
      setLoading(false);
      return;
    }

    try {
      const tx = await writeContractAsync({
        value: parseUnits(cflr2, 18),
        address: marketplaceAddress,
        abi: marketplaceABI,
        functionName: "createOrder",
        args: [sanitizedPrice, sanitizedCurrency],
      });

      // wait for 5 secs
      setTimeout(() => {
        alert("Order accepted! Waiting for payment and attestation...");
      }, 5000);

      // write payment details to supabase
      console.log(`Order count which is row_id: ${order_count}`);
      const { error } = await supabase.from("orders").upsert([{ paymentDetails, row_id: order_count }]);
    
      if (error) {
        console.error("Error inserting order:", error.message);
      } else {
        console.log("Payment details stored in DB successfully!");
      }
    } catch (error) {
      console.error("Error creating order on blockchain:", error);
      alert("Failed to create order on blockchain!");
      setLoading(false);
      return;
    }
  
    setLoading(false);
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
            <label className="block text-sm font-medium mb-1">Amount of C2FLR</label>
            <input
              type="number"
              value={cflr2}
              onChange={(e) => setCflr2(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Enter amount of C2FLR"
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
  const [status, setStatus] = useState("available");
  const { address } = useAccount(); // Get the user's address
  const { writeContractAsync } = useWriteContract();
  const [nextOrder, setNextOrder] = useState(null);

  useEffect(() => {
    switch (order.status) {
      case "0":
        setStatus("available");
        break;
      case "1":
        setStatus("accepted");
        break;
      case "2":
        setStatus("claimable");
        break;
      case "3":
        setStatus("completed");
        break;
      case "4":
        setStatus("cancelled");
        break;
      default:
        setStatus("available");
    }
  }, [order.status]);

  const handleAcceptOrder = async () => {
    setStatus("accepted");

    try {
      // sign tx for accepting order
      const tx = await writeContractAsync({
        address: marketplaceAddress,
        abi: marketplaceABI,
        functionName: "acceptOrder",
        args: [parseInt(order.id)],
      });

      // Fetch orderId + 1 from Supabase
      const nextOrderId = parseInt(order.id) + 1;
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", nextOrderId)
        .single();

      if (error) {
        console.error("Error fetching next order:", error);
        alert("Failed to fetch the next order!");
      } else {
        console.log("Next Order:", data);
        setNextOrder(data);
      }

      // wait for 5 secs
      setTimeout(() => {
        alert("Order accepted! Waiting for payment and attestation...");
      }, 5000);

    } catch (error) {
      console.error("Error accepting order:", error);
      alert("Failed to accept order!");
      setStatus("available");
    }
  };

  const handleClaimTokens = async function () {
    setStatus("completed");

    try {
      const tx = await writeContractAsync({
        address: marketplaceAddress,
        abi: marketplaceABI,
        functionName: "claimTokens",
        args: [parseInt(order.id)],
      });

      // wait for 5 secs
      setTimeout(() => {
        alert("Tokens claimed successfully!");
      }, 5000);

    } catch (error) {
      console.error("Error claiming tokens:", error);
      alert("Failed to claim tokens!");
      setStatus("claimable");
    }
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
        {status === "available" && (
          <button
            onClick={handleAcceptOrder}
            className="bg-[#FF69B4] hover:bg-[#FF5BA0] text-white rounded-full px-4 py-2 transition w-full"
          >
            Accept Order
          </button>
        )}
        {status === "accepted" && (
          <div>
            <div className="mb-2 text-center text-sm text-gray-600">
                Payment Details: Paid via Revolut (test@gmail.com)
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-6 h-6 border-4 border-[#FF69B4] border-t-transparent rounded-full animate-spin"></div>
              <span>Waiting for payment and attestation...</span>
            </div>
          </div>
        )}
        {status === "claimable" && (
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
        {status === "completed" && (
          <div className="flex items-center justify-center space-x-2">
            <span>Order is complete.</span>
          </div>
        )}
        {status === "cancelled" && (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-6 h-6 border-4 border-[#FF69B4] border-t-transparent rounded-full animate-spin"></div>
            <span>Order is cancelled.</span>
          </div>
        )}
        {nextOrder && address === nextOrder.buyerAddress && (
          <div className="mt-4">
            <h3 className="text-lg font-bold">Next Order Details</h3>
            <p>Order ID: {nextOrder.id}</p>
            <p>Payment Details: {nextOrder.paymentDetails}</p>
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
    abi: marketplaceABI,
    functionName: "getAllOrders",
  });

  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    if (ordersData) {
      setOrderCount(ordersData.length);
    }
  }, [ordersData]);

  order_count = orderCount;
  
  console.log("Orders Data:", ordersData);
  // Transform fetched orders (if any) into the shape expected by the UI.
  const fetchedOrders = ordersData
    ? ordersData.map((order) => {
        console.log(`Order ID: ${order.id.toString()}, Price: ${order.price.toString()}`);
        return {
          id: order.id.toString(),
          title: `Order #${order.id.toString()}`,
          price: `${(parseFloat(order.price) / 100).toFixed(2)} ${order.currency}`,
          quantity: `${formatEther(order.amount)} C2FLR`,
          status: order.status.toString(),
        };
      })
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
