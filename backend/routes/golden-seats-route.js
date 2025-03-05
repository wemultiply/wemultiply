import express from 'express';
import { getAllGoldenSeaters } from '../controllers/golden-seats-controller.js';
const router = express.Router();



router.get('/golden-seats', getAllGoldenSeaters)

export default router