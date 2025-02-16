const { Router } = require("express");
const multer = require("multer");
const path = require("path");
const Blog = require("../models/blog");
const Comment = require("../models/comment");

const router = Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(`./public/uploads/`));
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });

// Add New Blog Form
router.get("/add-new", (req, res) => {
  return res.render("addBlog", {
    user: req.user,
  });
});

// View Individual Blog
router.get("/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate("createdBy");
  const comments = await Comment.find({ blogId: req.params.id }).populate("createdBy");

  return res.render("blog", {
    user: req.user,
    blog,
    comments,
  });
});

// Add Comment to Blog
router.post("/comment/:blogId", async (req, res) => {
  await Comment.create({
    content: req.body.content,
    blogId: req.params.blogId,
    createdBy: req.user._id,
  });
  return res.redirect(`/blog/${req.params.blogId}`);
});

// Create New Blog Post
router.post("/", upload.single("cover-Image"), async (req, res) => {
  const { title, body } = req.body;
  const blog = await Blog.create({
    body,
    title,
    createdBy: req.user._id,
    coverImageURL: `/uploads/${req.file.filename}`,
  });
  return res.redirect(`/blog/${blog._id}`);
});

// Edit Blog (GET)
router.get("/edit/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).send("Blog not found");
    }

    if (blog.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).send("You are not authorized to edit this blog");
    }

    return res.render("editBlog", { blog });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error fetching blog for editing");
  }
});

// Edit Blog (POST)
router.post("/edit/:id", upload.single("cover-Image"), async (req, res) => {
  try {
    const { title, body } = req.body;
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).send("Blog not found");
    }

    if (blog.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).send("You are not authorized to edit this blog");
    }

    blog.title = title;
    blog.body = body;

    if (req.file) {
      blog.coverImageURL = `/uploads/${req.file.filename}`;
    }

    await blog.save();
    return res.redirect(`/blog/${blog._id}`);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error updating blog");
  }
});

// Delete Blog
router.get("/delete/:id", async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).send("Blog not found");
    }
    if (blog.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).send("You are not authorized to delete this blog");
    }
    return res.render("home.ejs");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error deleting blog");
  }
});

module.exports = router;
