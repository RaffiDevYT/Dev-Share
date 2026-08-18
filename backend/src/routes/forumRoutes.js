import express from 'express';
import {
  getForumTopics,
  getForumTopicDetail,
  createForumTopic,
  replyForumTopic,
  deleteForumTopic,
  deleteForumReply
} from '../controllers/forumController.js';
import { requireAuth, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// List & Detail
router.get('/', getForumTopics);
router.get('/:id', getForumTopicDetail);

// Create Topic & Reply
router.post('/', requireAuth, createForumTopic);
router.post('/:id/reply', requireAuth, replyForumTopic);

// Delete Topic & Reply
router.delete('/:id', requireAuth, deleteForumTopic);
router.delete('/replies/:replyId', requireAuth, deleteForumReply);

export default router;
