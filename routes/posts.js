const express = require("express");
const router = express.Router();

const {
  listPosts,
  getMyPosts,
  getPost,
  createPost,
  updatePost,
  deletePost
} = require("../controller/postController.js");

const { authMiddleware , verifyToken } = require("../middleware/auth.js");
const upload = require("../middleware/multer");

// Special routes 

router.get("/my-posts", verifyToken, getMyPosts);


// Public

router.get("/", listPosts);
router.get("/:id", getPost);

// Private

router.post("/", authMiddleware, upload.single("image"), createPost);
router.put("/:id", authMiddleware, upload.single("image"), updatePost);
router.delete("/:id", authMiddleware, deletePost);

module.exports = router;
