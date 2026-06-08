import { Router } from 'express';
import {
  getConversations,
  getMessages,
  createConversation,
} from '../controllers/message.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/conversations', getConversations);
router.post('/conversations', createConversation);
router.get('/conversations/:conversationId', getMessages);

export default router;