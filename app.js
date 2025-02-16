require("dotenv").config();
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const userRoute = require("./routes/user");
const Blog = require("./models/blog");
const blogRoute = require("./routes/blog");
const { checkForAuthenticationCookie } = require("./middlewares/authentication");
const app = express();
console.log("MONGO_URL:", process.env.MONGO_URL);
const PORT = process.env.PORT || 8000;
mongoose.connect(process.env.MONGO_URL).then((e) => console.log("MongoDB Connected"))
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
app.use(express.static('public')); // 'public' is the directory with images
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
// Serve static files from the 'public' folder
app.use(express.static('public'));
app.get("/", async(req, res) => {
    const allBlogs = await Blog.find({});
    res.render("home.ejs", {
        user: req.user,
        blogs: allBlogs,
    });
});

app.use("/user", userRoute);
app.use("/blog", blogRoute);

app.listen(PORT, () => console.log(`Server Started at PORT:${PORT}`));