import express from 'express';
import {
  explainCode,
  optimizeCode,
  translateCode,
  autoGenerateMetadata
} from '../controllers/aiController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/explain', optionalAuth, explainCode);
router.post('/optimize', optionalAuth, optimizeCode);
router.post('/translate', optionalAuth, translateCode);
router.post('/auto-metadata', optionalAuth, autoGenerateMetadata);

export default router;
