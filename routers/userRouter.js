const express = require("express");
const data = require("../data");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const auth = require("../auth/auth");

const userRouter = express.Router();

userRouter.get("/seed", async (req, res) => {
  try {
    // await User.remove({});
    const createdUsers = await User.insertMany(data.users);
    res.send({ createdUsers });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

userRouter.post("/signin", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).send({ message: "Invalid email" });
    }
    const validPassword = bcrypt.compareSync(req.body.password, user.password);
    if (!validPassword) {
      return res.status(401).send({ message: "Invalid password" });
    }
    const token = await user.generateToken();
    res.send({
      _id: user._id,
      name: user.name,
      isAdmin: user.isAdmin,
      token,
    });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

userRouter.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existEmail = await User.findOne({ email });
    if (existEmail) {
      return res.status(409).send({ message: "Email is already registered" });
    }
    const user = new User({
      name,
      email,
      password: bcrypt.hashSync(password, 8),
    });
    await user.save();
    const token = await user.generateToken();
    res.send({
      _id: user._id,
      name: user.name,
      isAdmin: user.isAdmin,
      token,
    });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

userRouter.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({ message: "User Not Found" });
    }
    const filteredUser = user.toObject();
    delete filteredUser.password;
    res.send(filteredUser);
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

userRouter.put("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).send({ message: "User Not Found" });
    }
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      user.password = bcrypt.hashSync(req.body.password, 8);
    }
    const updatedUser = await user.save();
    const token = await user.generateToken();
    res.send({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      token,
    });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

module.exports = userRouter;
