const { Schema, model } = require("mongoose");
const bcryptjs = require("bcryptjs");

const UserModel = new Schema({
  name: {
    type: String,
    required: true,
    minLength: 4,
  },
  lastname: {
    type: String,
    required: true,
    minLength: 4,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minLength: 6,
  },
  profilePic: {
    type: String,
    required: false,
  },
  likedPosts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
  tokens: [
    {
      token: {
        type: String,
      },
    },
  ],
});

UserModel.statics.findByCredentials = async function (email, password) {
  const user = await this.findOne({ email });

  if (user) {
    const isMatch = await bcryptjs.compare(password, user.password);
    if (isMatch) return user;
    else return null;
  } else {
    return null;
  }
};

UserModel.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.__v;

  return userObject;
};

module.exports = model("User", UserModel);
