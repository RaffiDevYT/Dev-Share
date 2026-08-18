import express from 'express';
import {
  createSnippet,
  getSnippets,
  getSnippetById,
  getRawSnippet,
  updateSnippet,
  deleteSnippet,
  forkSnippet
} from '../controllers/snippetController.js';
import {
  toggleBookmark,
  getMyBookmarks
} from '../controllers/bookmarkController.js';
import {
  getComments,
  createComment,
  deleteComment
} from '../controllers/commentController.js';
import { requireAuth, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Bookmarks routes
router.get('/bookmarks/mine', requireAuth, getMyBookmarks);
router.post('/:id/bookmark', requireAuth, toggleBookmark);

// Comments routes
router.get('/:id/comments', optionalAuth, getComments);
router.post('/:id/comments', requireAuth, createComment);
router.delete('/comments/:commentId', requireAuth, deleteComment);

// Raw output
router.get('/:id/raw', optionalAuth, getRawSnippet);

// Standard snippet CRUD & Fork
router.post('/', requireAuth, createSnippet);
router.get('/', optionalAuth, getSnippets);
router.get('/:id', optionalAuth, getSnippetById);
router.put('/:id', requireAuth, updateSnippet);
router.delete('/:id', requireAuth, deleteSnippet);
router.post('/:id/fork', requireAuth, forkSnippet);

export default router;
