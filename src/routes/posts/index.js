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

    res.status(201).json({
      success: true,
      newPost,
    });
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
      res.status(204).send();
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

router.put("/:postId", authorize, async (req, res, next) => {
  try {
    const updatedPost = await PostSchema.findByIdAndUpdate(
      req.params.postId,
      req.body,
      {
        runValidators: true,
        new: true,
      },
    );

    res.send(updatedPost);
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
      },
    );

    res.status(200).send({ success: true, post });
    await post.save();
  } catch (error) {
    next(error);
    res.status(400).send({
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
        $pull: { likes: { _id: req.user._id } },
      },
      {
        new: true,
      },
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

module.exports = router;
