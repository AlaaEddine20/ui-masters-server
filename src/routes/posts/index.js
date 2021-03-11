const express = require("express");
const PostModel = require("./schema");
const { authorize } = require("./../../middlewares/auth");
const UserModel = require("./../users/schema");

const router = express.Router();

router.post("/", authorize, async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user.id);

    if (!user) return res.status(404).send("User not found!");

    const newPost = new PostModel({
      title,
      code,
      desctription,
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

router.get("/recently_added", async (req, res, next) => {
  try {
    const mostRecentPosts = await PostModel.find().sort({
      date: -1, // same
    });
    res.status(201).send(mostRecentPosts);
  } catch (error) {
    console.log(error);
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

router.get("/user_posts/:userId", async (req, res, next) => {
  try {
    const userPosts = await PostModel.find({ user: req.params.userId });

    res.status(201).send(userPosts);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/user_posts", authorize, async (req, res, next) => {
  try {
    const posts = await PostModel.find();

    const userPosts = posts.filter(
      (post) => post.user.toString() === req.user.id.toString()
    );

    res.status(201).send(userPosts);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = router;
