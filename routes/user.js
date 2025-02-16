const express = require("express");  // ✅ Correct import
const router = express.Router();     // ✅ Create router instance
const User = require("../models/user");
const Blogs = require("../models/blog");

// Home Route
router.get("/home", async (req, res) => {
  try {
    const blogs = await Blogs.find().lean(); // Fetch all blogs from DB
    res.render("home.ejs", { user: req.user, blogs }); // Pass blogs to EJS template
  } catch (error) {
    console.error(error);
    res.render("home.ejs", { user: req.user, blogs: [] }); // Ensure blogs is always defined
  }
});


// Signin Page
router.get("/signin", (req, res) => {
  return res.render("signin");
});

// Signup Page
router.get("/signup", (req, res) => {
  return res.render("signup");
});

// Signin Logic
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const token = await User.matchPasswordAndGenerateToken(email, password);
    return res.cookie("token", token, { httpOnly: true }).redirect("/");
  } catch (error) {
    return res.render("signin", {
      error: "Incorrect Email or Password",
    });
  }
});

// Signup Logic
router.post("/signup", async (req, res) => {
  const { fullName, email, password } = req.body;
  await User.create({ fullName, email, password });
  return res.render("signin");  // ✅ Redirect to signin instead of home
});

// Logout Route
router.get("/logout", (req, res) => {
  res.clearCookie("token").redirect("/");
});

module.exports = router;  // ✅ Export the router
