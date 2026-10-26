import express from "express";
import userAuth from "../middlewares/auth.js";
import { validateProfileUpdateData } from "../utils/validation.js";
import User from "../models/user.js";

const router = express.Router();

router.get("/profile/view", userAuth, async (req, res) => {
  try {
    const users = req.user;

    res.send(users);
  } catch (error) {
    res.status(500).send("Error fetching users: " + error.message);
  }
});

router.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateProfileUpdateData(req)) {
      return res.status(400).send("Invalid update fields");
    }

    const loggedInUser = req.user;

    Object.keys(req.body).forEach((key) => {
      loggedInUser[key] = req.body[key];
    });

    console.log("Updated user:", loggedInUser);

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      loggedInUser,
      {
        new: false,
      },
    );

    if (!updatedUser) {
      return res.status(404).send("User not found");
    }
    res.json(updatedUser);
  } catch (error) {
    res.status(500).send("Error updating user: " + error.message);
  }
});

export default router;
