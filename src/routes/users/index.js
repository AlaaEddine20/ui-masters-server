const express = require("express");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserModel = require("./schema");
const { authorize } = require("../../middlewares/auth");
const router = express.Router();

router.post("/register", async (req, res, next) => {
  try {
    const { name, lastname, email, password } = req.body;

    const user = await UserModel.findOne({ email }).select("-password");

    if (user) return res.status(401).send("User already exists!");

    const newUser = new UserModel({
      name,
      lastname,
      email,
      password,
    });

    const salt = await bcryptjs.genSalt(10);

    const hashedPass = await bcryptjs.hash(password, salt);

    newUser.password = hashedPass;

    await newUser.save();

    res.send("Registered successfully!!");
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findByCredentials(email, password);

    if (!user) return res.status(401).send("You must register first!");

    const accessToken = await jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    user.tokens = user.tokens.concat({ token: accessToken });
    await user.save();

    res.send({ accessToken });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/me", authorize, async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user.id);
    res.send(user);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/all", authorize, async (req, res, next) => {
  try {
    const users = await UserModel.find().select("-password");
    res.send(users);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/:id", authorize, async (req, res, next) => {
  try {
    const userById = await UserModel.findById(req.params.id);
    res.send(userById);
  } catch (error) {
    console.log(error);
    next(error);
  }
});
module.exports = router;
