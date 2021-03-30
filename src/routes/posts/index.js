const express = require("express");
const PostSchema = require("./schema");
const { authorize } = require("./../../middlewares/auth");
const UserSchema = require("./../users/schema");
const router = express.Router();

router.post("/", authorize, async (req, res, next) => {
  try {
    const { title, js, css } = req.body;

    const newPost = new PostSchema({
      title,
      js,
      css,
      user: req.user._id,
      username: req.user.name,
    });

    await newPost.save();

    setTimeout(() => {
      res.status(201).json({
        success: true,
        newPost,
      });
    }, 500);
  } catch (error) {
    next(error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

router.get("/", async (req, res, next) => {
  try {
    const posts = await PostSchema.find().populate("user", "-tokens");
    res.status(201).send(posts);
  } catch (error) {
    next(error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const post = await PostSchema.findById(req.params.id);
    res.status(201).send(post);
  } catch (error) {
    next(error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

router.delete("/:postId", authorize, async (req, res, next) => {
  try {
    const postToDelete = await PostSchema.findByIdAndDelete(req.params.postId);

    if (postToDelete) {
      setTimeout(function () {
        res.status(204).send();
      }, 500);
    } else {
      const error = new Error(`Product with ${req.params.postId} id not found`);
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    next(error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

router.get("/most_liked", async (req, res, next) => {
  try {
    const postLikes = await PostSchema.find().sort({
      likes: -1, // sort by most recent likes
    });
    res.status(201).send(postLikes);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/most_recent", async (req, res, next) => {
  try {
    const posts = await PostSchema.find().sort({ date: 1 });
    res.status(201).send(posts);
  } catch (error) {
    console.log("ERROR", error);
    next(error);
  }
});

router.get("/most_commented", async (req, res, next) => {
  try {
    const postLikes = await PostSchema.find().sort({
      comments: -1,
    });
    res.status(201).send(postLikes);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/user_posts/:userId", authorize, async (req, res, next) => {
  try {
    const userPosts = await PostSchema.find({ user: req.params.userId });
    res.status(201).send(userPosts);
  } catch (error) {
    next(error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

router.post("/like", authorize, async (req, res, next) => {
  try {
    const post = await PostSchema.findByIdAndUpdate(
      req.body.postId,
      {
        $addToSet: { likes: { _id: req.user._id } },
      },
      {
        new: true,
      }
    );

    res.status(200).json({ success: true, post });
    await post.save();
  } catch (error) {
    next(error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

router.delete("/like/:postId", authorize, async (req, res, next) => {
  try {
    const post = await PostSchema.findByIdAndUpdate(
      req.params.postId,
      {
        $unset: { likes: { _id: req.user._id } },
      },
      {
        new: true,
      }
    );

    res.status(200).json({ success: true, post });
    await post.save();
  } catch (error) {
    next(error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

router.put("/comment/:postId", authorize, async (req, res, next) => {
  try {
    const post = await PostSchema.findById(req.params.postId);
    const user = await UserSchema.findById(req.user._id);

    if (!user) return res.status(404).send("User not found");
    if (!post) return res.status(404).send("Post not found");

    const newComment = {
      text,
      name,
    };
  } catch (error) {
    next(error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
