const UserModel = require("../routes/users/schema");
const jwt = require("jsonwebtoken");

const authorize = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded) {
      const user = await UserModel.findById(decoded._id);
      req.user = user;
      next();
    }
  } catch (e) {
    console.log(e);
    const err = new Error("Token is expired");
    next(err);
  }
};

module.exports = { authorize };
