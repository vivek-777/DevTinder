import express from "express";
import userAuth from "../middlewares/auth.js";
import Connection from "../models/connection.js";
import User from "../models/user.js";

const router = express.Router();

router.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {
  try {
    const fromUserId = req.user._id;
    const toUserId = req.params.toUserId;
    const status = req.params.status;

    const allowedStatuses = ["ignored", "interested"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" + status });
    }

    const toUserExists = await User.findById(toUserId);
    if (!toUserExists) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingConnection = await Connection.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    });

    if (existingConnection) {
      return res.status(400).json({ message: "Connection already exists" });
    }

    const newConnection = new Connection({
      fromUserId,
      toUserId,
      status,
    });

    await newConnection.save();
    res.status(201).json({ message: "Request sent successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching requests: " + error.message });
  }
});

// Route to review a connection request (accept or ignore), only if the request is in "interested" status
router.get("/request/review/:status/:requestId", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const { status, requestId } = req.params;

    const allowedStatuses = ["ignored", "interested"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const connectRequest = await Connection.findOne({
      _id: requestId,
      toUserId: loggedInUser._id,
      status: "interested",
    });
    if (!connectRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    connectRequest.status = status;
    await connectRequest.save();

    res
      .status(200)
      .json({ message: "Request reviewed successfully", data: connectRequest });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching requests: " + error.message });
  }
});

export default router;
