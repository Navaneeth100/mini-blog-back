const Post = require("../models/Post.js");

const listPosts = async (req, res) => {
  try {
    const { page = 1, search = "" } = req.query;
    const limit = 10; // Fixed limit value
    const filter = search ? { title: { $regex: search, $options: "i" } } : {};
    const skip = (Number(page) - 1) * limit;

    const [results, total] = await Promise.all([
      Post.find(filter)
        .populate("author", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments(filter),
    ]);

    res.json({
      results,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};


const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "author",
      "name email"
    );
    if (!post) return res.status(404).json({ error: "Not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content)
      return res.status(400).json({ error: "Title and content required" });
    const post = await Post.create({ title, content, author: req.userId });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Not found" });
    if (post.author.toString() !== req.userId)
      return res.status(403).json({ error: "Forbidden" });

    post.title = req.body.title ?? post.title;
    post.content = req.body.content ?? post.content;
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Not found" });
    if (post.author.toString() !== req.userId)
      return res.status(403).json({ error: "Forbidden" });

    await post.deleteOne();
    res.json({ success: true, message: "Post Deleted successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

module.exports = {
  listPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
};
