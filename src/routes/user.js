import router from "express";
import { userAuth } from "../middleware/auth.js";
import Connection from "../models/connection.js";
import User from "../models/user.js";

const USER_SAFE_FIELDS = [
  "_id",
  "firstName",
  "lastName",
  "age",
  "gender",
  "photoUrl",
];

router.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const receivedRequests = await Connection.find(
      {
        toUserId: loggedInUserId,
        status: "interested",
      }.populate("fromUserId", USER_SAFE_FIELDS),
    ); // Populate the fromUserId field with user details

    res.status(200).json({ data: receivedRequests });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching received requests: " + error.message });
  }
});

router.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const connections = await Connection.find({
      $or: [
        { fromUserId: loggedInUserId, status: "accepted" },
        { toUserId: loggedInUserId, status: "accepted" },
      ],
    }).populate("fromUserId toUserId", USER_SAFE_FIELDS);

    const data = connections.map((connection) => {
      const otherUser = connection.fromUserId._id.equals(loggedInUserId)
        ? connection.toUserId
        : connection.fromUserId;

      return otherUser;
    });

    res.status(200).json({ data });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching connections: " + error.message });
  }
});

router.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 100 ? 100 : limit; // Limit the maximum number of users per page to 100
    const skip = (page - 1) * limit;

    // Fetch connections of the logged-in user
    const connections = await Connection.find({
      $or: [{ fromUserId: loggedInUserId }, { toUserId: loggedInUserId }],
    }).select("fromUserId toUserId");

    const hideUsersFromFeed = new Set();

    connections.forEach((req) => {
      hideUsersFromFeed.add(req.toUserId.toString());
      hideUsersFromFeed.add(req.fromUserId.toString());
    });

    // Fetch users excluding those in hideUsersFromFeed
    const users = await User.find({
      _id: { $nin: Array.from(hideUsersFromFeed) },
    })
      .select(USER_SAFE_FIELDS)
      .skip(skip)
      .limit(limit);

    res.status(200).json({ data: users });
  } catch (error) {
    res.status(500).json({ error: "Error fetching feed: " + error.message });
  }
});

export default router;
