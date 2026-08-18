import express from 'express';
import {
  getUserProfile,
  updateMyProfile,
  getProfileMessages,
  createProfileMessage,
  deleteProfileMessage
} from '../controllers/userProfileController.js';
import { requireAuth, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Update Bio & Social Links
router.put('/profile/me', requireAuth, updateMyProfile);

// Forum Diskusi / Chat Profil
router.get('/:username/messages', getProfileMessages);
router.post('/:username/messages', requireAuth, createProfileMessage);
router.delete('/messages/:messageId', requireAuth, deleteProfileMessage);

// Profil Publik Developer (diletakkan paling bawah agar tidak bentrok dengan static prefix jika ada)
router.get('/:username', optionalAuth, getUserProfile);

export default router;
