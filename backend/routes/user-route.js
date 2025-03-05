import express from "express"
import { allUsers } from "../controllers/users-controller.js";

const router = express.Router();

// Get all items
router.get('/all-users', allUsers);

export default router