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
  getUserTweets,
  getUserProfile,
  updateUserProfile,
  changePassword,
  searchUsers
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/upload.js";

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

// Rutas de perfil de usuario
router.get("/:id/profile", getUserProfile); // Obtener perfil (público)
router.put("/:id/profile", authMiddleware, upload.single('avatar'), updateUserProfile); // Actualizar perfil (con imagen)
router.put("/:id/change-password", authMiddleware, changePassword); // Cambiar contraseña

// Ruta de búsqueda de usuarios
router.get("/search", searchUsers); // Buscar usuarios por username o full_name

export default router;