// src/pages/api/proxy.js
export default async function handler(req, res) {
    const { url } = req.query;
    if (!url) {
      res.status(400).json({ error: "Missing url parameter" });
      return;
    }
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
      res.status(200).json(data);
    } catch (error) {
      console.error("Proxy fetch error:", error);
      res.status(500).json({ error: "Failed to fetch data" });
    }
  }
  