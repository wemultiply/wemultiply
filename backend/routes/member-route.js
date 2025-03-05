import express from 'express';
import { createMember, getMemberById, updateMember } from '../controllers/member-controller.js';
import { getReferralTree, referrals } from '../controllers/referrals.js';
const router = express.Router();

router.post('/create-member', createMember)
router.put('/update-member', updateMember)
router.get('/view-referrals', referrals)
router.get('/check-member/:id', getMemberById)
router.get('/referral-tree', getReferralTree); // Gets complete tree up to 7 levels

export default router;