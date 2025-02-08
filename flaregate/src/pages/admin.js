import { useRouter } from "next/router";
import useSWR from "swr";
import { NavBar } from "../components/ui/NavBar"; // Correctly import the Navbar component

// A simple fetcher function for SWR
const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Admin() {
  const router = useRouter();
  const { orderId } = router.query; // Always call hooks at the top

  // Construct the external URL based on orderId
  const externalUrl = orderId ? `https://pastes.io/download/sample-payment-webhook-response-${parseInt(orderId) + 1}` : null;

  // Use our API proxy—if externalUrl is not available, pass null to disable fetching.
  const proxyUrl = externalUrl ? `/api/proxy?url=${encodeURIComponent(externalUrl)}` : null;

  // Always call useSWR with the key (it will be null on first render)
  const { data, error } = useSWR(proxyUrl, fetcher);

  // Show a loading message if orderId isn't available yet.
  if (!orderId) {
    return <div>Loading...</div>;
  }

  // If no URL exists for the orderId, show an error message.
  if (!externalUrl) {
    return (
      <div className="min-h-screen bg-white text-black p-8">
        <NavBar />
        <h1 className="text-3xl font-bold mb-4 text-[#FF69B4]">Admin Panel</h1>
        <p>No sample data available for orderId = {orderId}</p>
      </div>
    );
  }

  if (error) return <div>Error loading response.</div>;
  if (!data) return <div>Loading webhook response...</div>;

  return (
    <div className="min-h-screen bg-white text-black">
      <NavBar />
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4 text-[#FF69B4]">Admin Order {orderId}</h1>
        <pre className="bg-white p-4 rounded shadow border border-[#FF69B4]">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}
