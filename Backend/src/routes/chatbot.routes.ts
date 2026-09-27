import { Router } from 'express';
import { ChatbotController } from '../controllers/chatbot.controller';

const router = Router();

// Publicly accessible chatbot endpoints
router.post('/ask', ChatbotController.ask);
router.get('/suggestions', ChatbotController.getSuggestions);
router.get('/info', ChatbotController.getInfo);

export default router;
