const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

const NEWS_API_KEY = "deb922003a6c4773a8a11953bd9db435";

app.post("/webhook", async (req, res) => {
  const parameters = req.body.queryResult.parameters || {};
  const topic = parameters.topic || "general";
  const country = parameters.country || "in";

  try {
    const newsRes = await axios.get(`https://newsapi.org/v2/top-headlines`, {
      params: {
        apiKey: NEWS_API_KEY,
        category: topic,
        country: country,
        pageSize: 3
      }
    });

    const articles = newsRes.data.articles;
    const reply = articles.length
      ? articles.map((a, i) => `${i + 1}. ${a.title}`).join("\n\n")
      : "No articles found. Try another topic or country.";

    return res.json({
      fulfillmentText: `📰 Here are the latest ${topic} news from ${country}:\n\n${reply}`
    });
  } catch (err) {
    console.error("Error fetching news:", err);
    return res.json({
      fulfillmentText: "Sorry, I couldn’t fetch the news right now."
    });
  }
});

app.listen(3000, () => console.log("✅ Webhook running on port 3000"));
