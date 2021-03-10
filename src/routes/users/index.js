const express = require("express");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const UserModel = require("./schema");

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
    const payload = {
      user: {
        id: newUser._id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findByCredentials(email, password);

    const accessToken = await jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );
    const refreshToken = await jwt.sign(
      { _id: user._id },
      process.env.JWT_REFRESH,
      { expiresIn: "1 week" }
    );
    user.refreshTokens = user.refreshTokens.concat({ token: refreshToken });
    await user.save();

    res.send({ accessToken, refreshToken });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = router;
