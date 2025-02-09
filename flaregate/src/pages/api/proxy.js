// src/pages/api/proxy.js
export default async function handler(req, res) {
    const { url } = req.query;
    if (!url) {
      res.status(400).json({ error: "Missing url parameter" });
      return;
    }
  
    const fetchWithRetry = async (url, retries = 10, delay = 5000) => {
      for (let i = 0; i < retries; i++) {
        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          // Always get the text of the response.
          const text = await response.text();
          // Remove any Byte Order Mark (BOM) and trim whitespace.
          const cleanedText = text.replace(/^\uFEFF/, "").trim();
          let data;
          try {
            data = JSON.parse(cleanedText);
          } catch (e) {
            console.error(`Failed to parse JSON from response: ${cleanedText}`);
            throw new Error("Response is not valid JSON");
          }
          return data;
        } catch (error) {
          console.error(`Attempt ${i + 1} failed:`, error);
          if (i < retries - 1) {
            await new Promise((resolve) => setTimeout(resolve, delay));
          } else {
            throw error;
          }
        }
      }
    };
  
    try {
      const data = await fetchWithRetry(url, Infinity, 5000); // Retry indefinitely every 5 seconds
      res.status(200).json(data);
    } catch (error) {
      console.error("Proxy fetch error:", error);
      res.status(500).json({ error: "Failed to fetch data" });
    }
  }
  