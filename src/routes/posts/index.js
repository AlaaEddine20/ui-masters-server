const express = require("express");

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    res.send("OK");
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = router;
