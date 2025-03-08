const express = require("express");
const router = express.Router();

// Home page route
router.get("/", (req, res) => {
  // Check if a message was passed as a query parameter
  const message = req.query.message || "";
  res.render("index", {
    title: "Movie Recommendation App",
    message: message,
  });
});

// About page route
router.get("/about", (req, res) => {
  res.render("about", { title: "About | Movie Recommendation App" });
});

module.exports = router;
