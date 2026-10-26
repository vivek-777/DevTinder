import jwt from "jsonwebtoken";
import User from "../models/user.js";

const userAuth = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).send("Unauthorized: No token provided");
  }

  try {
    const decoded = jwt.verify(token, "vivek@1997");

    const { userId } = decoded;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).send("Unauthorized: User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).send("Unauthorized: Invalid token");
  }
};

export default userAuth;
