import express from "express";
import bcrypt from "bcrypt";
import User from "../models/user.js";
import { validateSignupData } from "../utils/validation.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  const data = req.body;

  try {
    const isValid = validateSignupData(req);

    if (!isValid) {
      return res.status(400).send("Invalid signup data");
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = new User({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: passwordHash,
      age: data.age,
      gender: data.gender,
      photoUrl: data.photoUrl,
      about: data.about,
      skills: data.skills,
    });
    await user.save();
    res.status(201).send("User created successfully");
  } catch (error) {
    res.status(400).send("User creation failed: " + error.message);
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send("User not found");
    }

    const isPasswordValid = await user.verifyPassword(password);

    if (!isPasswordValid) {
      return res.status(401).send("Invalid password");
    }

    const token = user.getJWT();

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });

    res.send("Login successful");
  } catch (error) {
    res.status(500).send("Error during login: " + error.message);
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.send("Logout successful");
});

export default router;
