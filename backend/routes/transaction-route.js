import express from "express"
import { GetAllTransaction, GoldenSeatsCommissions } from "../controllers/transaction-controller.js"
const router = express.Router()


router.get("/transaction", GetAllTransaction)
router.get("/commisions",GoldenSeatsCommissions)


export default router;