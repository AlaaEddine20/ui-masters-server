const { Schema, model } = require("mongoose");
const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const PostSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  js: {
    type: String,
    required: true,
  },
  css: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now(),
  },

  likes: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        unique: true,
      },
    },
  ],
  comments: [
    {
      text: {
        type: String,
        required: true,
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      date: {
        type: Date,
        default: Date.now(),
      },
      likes: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        },
      ],
    },
  ],
});
PostSchema.plugin(uniqueValidator);
module.exports = model("Posts", PostSchema);
