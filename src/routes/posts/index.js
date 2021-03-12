const express = require("express");
const PostModel = require("./schema");
const { authorize } = require("./../../middlewares/auth");
const UserModel = require("./../users/schema");
const { route } = require("../users");
const { findById } = require("./schema");

const router = express.Router();

router.post("/", authorize, async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user.id);

    if (!user) return res.status(404).send("User not found!");

    const newPost = new PostModel({
      title: req.body.title,
      description: req.body.description,
      user: req.user.id,
      name: req.user.name,
    });

    await newPost.save();

    res.send("Posted successfully");
  } catch (error) {
    console.log(error);
    next(error);
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

router.get("/userPosts", authorize, async (req, res, next) => {
  try {
    const posts = await PostModel.find();

    const userPosts = posts.filter(
      (post) => post.user.toString() === req.user._id.toString()
    );

    res.status(201).send(userPosts);
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
    const { commentContent } = req.body;

    const post = await PostModel.findById(req.params.postId);
    const user = await UserModel.findById(req.user._id);

    if (!user) return res.status(404).send("User not found");
    if (!post) return res.status(404).send("Post not found");
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = router;
