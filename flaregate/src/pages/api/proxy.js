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
          const contentType = response.headers.get("content-type");
          let data;
          if (contentType && contentType.indexOf("application/json") !== -1) {
            data = await response.json();
          } else {
            const text = await response.text();
            data = JSON.parse(text);
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
      const data = await fetchWithRetry(url, Infinity, 5000); // Infinite retries with a 5-second delay
      res.status(200).json(data);
    } catch (error) {
      console.error("Proxy fetch error:", error);
      res.status(500).json({ error: "Failed to fetch data" });
    }
  }
  