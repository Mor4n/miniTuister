import { Router } from "express";
import { 
  getUser, 
  getUsers, 
  updateUser, 
  deleteUser,
  followUser,
  unfollowUser,
  isFollowing,
  getFollowersCount,
  getFollowingCount,
  getUserLikedTweets,
  getUserTweets
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

// 👀 Solo usuarios autenticados pueden ver y modificar perfiles
router.get("/", authMiddleware, getUsers);
router.get("/:id", authMiddleware, getUser);
router.put("/:id", authMiddleware, updateUser);
router.delete("/:id", authMiddleware, deleteUser);

// Rutas de seguimiento (migradas desde tweet-service)
router.post("/:user_id/follow", followUser);
router.delete("/:user_id/follow", unfollowUser);
router.get("/:user_id/is-following", isFollowing);
router.get("/:user_id/followers-count", getFollowersCount);
router.get("/:user_id/following-count", getFollowingCount);

// Rutas de tweets de usuario (migradas desde tweet-service)
router.get("/:user_id/liked-tweets", getUserLikedTweets);
router.get("/:user_id/tweets", getUserTweets);

export default router;