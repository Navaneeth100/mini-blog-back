const Post = require("../models/Post.js");

const listPosts = async (req, res) => {
  try {
    const { page = 1, search = "" } = req.query;
    const limit = 10;
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

    // Add full URL for image

    const host = req.protocol + "://" + req.get("host");
    const postsWithFullUrl = results.map(post => ({
      ...post.toObject(),
      image: post.image ? host + post.image : null,
    }));

    res.json({
      results: postsWithFullUrl,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

//  Get User Wise Created Post

const getMyPosts = async (req, res) => {
  try {
    const { page = 1, search = "" } = req.query;
    const limit = 10; 
    const skip = (Number(page) - 1) * limit;

    const filter = {
      author: req.userId,
      ...(search ? { title: { $regex: search, $options: "i" } } : {}),
    };

    const [results, total] = await Promise.all([
      Post.find(filter)
        .populate("author", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments(filter),
    ]);

    // Add full URL for images directly from post.image

    const host = req.protocol + "://" + req.get("host");
    const postsWithFullUrl = results.map(post => ({
      ...post.toObject(),
      image: post.image ? host + post.image : null,
    }));

    res.status(200).json({
      success: true,
      results: postsWithFullUrl,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error", details: err.message });
  }
};

// Get Single Post

const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "author",
      "name email"
    );
    if (!post) return res.status(404).json({ error: "Not found" });

    const host = req.protocol + "://" + req.get("host");
    const postWithFullUrl = {
      ...post.toObject(),
      image: post.image ? host + post.image : null,
    };

    res.json(postWithFullUrl);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content)
      return res.status(400).json({ error: "Title and content required" });

    const imagePath = req.file ? "/uploads/" + req.file.filename : null;

    const post = await Post.create({ title, content, author: req.userId, image: imagePath });
    res.status(201).json({ message: "Post Created Successfully", post });
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

    if (req.file) {
      post.image = req.file ? "/uploads/" + req.file.filename : null;
    }

    await post.save();
    res.status(201).json({ message: "Post Updated Successfully", post });
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
  getMyPosts,
  createPost,
  updatePost,
  deletePost,
};
