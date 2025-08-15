const express = require("express");
const router = express.Router();

const {
  listPosts,
  getPost,
  createPost,
  updatePost,
  deletePost
} = require("../controller/postController.js");

const { authMiddleware } = require("../middleware/auth.js");

// Public

router.get("/", listPosts);
router.get("/:id", getPost);

// Private

router.post("/", authMiddleware, createPost);
router.put("/:id", authMiddleware, updatePost);
router.delete("/:id", authMiddleware, deletePost);

module.exports = router;
