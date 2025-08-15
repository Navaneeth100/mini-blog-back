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
const upload = require("../middleware/multer");

// Public

router.get("/", listPosts);
router.get("/:id", getPost);

// Private

router.post("/", authMiddleware, upload.single("image"), createPost);
router.put("/:id", authMiddleware, upload.single("image"), updatePost);
router.delete("/:id", authMiddleware, deletePost);

module.exports = router;
