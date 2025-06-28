const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

const NEWS_API_KEY = "deb922003a6c4773a8a11953bd9db435";

app.post("/webhook", async (req, res) => {
  const parameters = req.body.queryResult.parameters || {};

  // Smart fallback logic
  const category = parameters.category || "general";
  const country = parameters["geo-country"] || "in";
  const keyword = parameters.keyword || "";

  try {
    // Try by category first
    const byCategory = await axios.get("https://newsapi.org/v2/top-headlines", {
      params: {
        apiKey: NEWS_API_KEY,
        country,
        category,
        pageSize: 3,
      },
    });

    let articles = byCategory.data.articles;

    // If no results in category, try with keyword instead
    if (!articles.length && keyword) {
      const byKeyword = await axios.get("https://newsapi.org/v2/everything", {
        params: {
          apiKey: NEWS_API_KEY,
          q: keyword,
          pageSize: 3,
          sortBy: "relevancy",
        },
      });
      articles = byKeyword.data.articles;
    }

    const reply = articles.length
      ? articles.map((a, i) => `${i + 1}. ${a.title}`).join("\n\n")
      : "❌ No articles found. Try another topic or keyword.";

    return res.json({
      fulfillmentText: `📰 Latest "${category}" news for ${country}:\n\n${reply}`,
    });
  } catch (err) {
    console.error("Error fetching news:", err.message);
    return res.json({
      fulfillmentText: "⚠️ Sorry, I couldn’t fetch the news right now. Please try again later.",
    });
  }
});

app.listen(3000, () => console.log("✅ News Webhook running on port 3000"));
