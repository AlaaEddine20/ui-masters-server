const express = require("express");
const PostModel = require("./schema");
const { authorize } = require("./../../middlewares/auth");
const UserModel = require("./../users/schema");
const { route } = require("../users");
const { findById } = require("./schema");

const router = express.Router();

router.post("/", authorize, async (req, res, next) => {
  try {
    const { title, description, js, css } = req.body;

    const newPost = new PostModel({
      title,
      description,
      js,
      css,
      user: req.user._id,
      username: req.user.name,
    });

    await newPost.save();

    res.status(201).json({
      success: true,
      newPost,
      user: req.user,
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
    const posts = await PostModel.find();
    res.status(201).send(posts);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const post = await PostModel.findById(req.params.id);
    res.status(201).send(post);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/most_liked", async (req, res, next) => {
  try {
    const postLikes = await PostModel.find().sort({
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
    const posts = await PostModel.find().sort({ date: 1 });
    res.status(201).send(posts);
  } catch (error) {
    console.log("ERROR", error);
    next(error);
  }
});

router.get("/most_commented", async (req, res, next) => {
  try {
    const postLikes = await PostModel.find().sort({
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
    const userPosts = await PostModel.find({ user: req.params.userId });

    res.status(201).send(userPosts);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/:userId", authorize, async (req, res, next) => {
  try {
    const posts = await PostModel.find({}).populate("User", "-password");
    console.log(posts);
    const userPosts = posts.filter(
      (post) => post.params.userId === req.user._id6050c37ab689703a2c99547c
    );

    res.status(201).send("OK", userPosts);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.put("/like/:postId/", authorize, async (req, res, next) => {
  try {
    const newLike = {
      user: req.user.id,
    };

    const post = await PostModel.findByIdAndUpdate(
      req.params.postId,
      {
        $addToSet: { likes: newLike },
      },
      {
        new: true,
      }
    );

    await post.save();

    res.send(post);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.put("/unlike/:postId/", authorize, async (req, res, next) => {
  try {
    const newLike = {
      user: req.user.id,
    };

    const post = await PostModel.findByIdAndUpdate(
      req.params.postId,
      {
        $pull: { likes: newLike },
      },
      {
        new: true,
      }
    );

    await post.save();

    res.send(post);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.put("/comment/:postId", authorize, async (req, res, next) => {
  try {
    const post = await PostModel.findById(req.params.postId);
    const user = await UserModel.findById(req.user._id);

    if (!user) return res.status(404).send("User not found");
    if (!post) return res.status(404).send("Post not found");

    const newComment = {
      text,
      name,
    };
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = router;
