import { Request, Response } from 'express';
import { ChatbotService, ChatbotQueryRequest } from '../services/chatbot.service';
import { HttpStatus } from '../constants/httpStatus';
import { sendSuccess, sendError } from '../utils/response';
import { logger } from '../utils/logger';

export class ChatbotController {
  /**
   * Process a question from the user and return an intelligent, domain-specific response.
   */
  public static async ask(req: Request, res: Response): Promise<void> {
    try {
      const { query, conversationHistory, sessionId } = req.body as ChatbotQueryRequest;

      if (!query || typeof query !== 'string' || !query.trim()) {
        sendError(res, 'Query string is required and cannot be empty.', HttpStatus.BAD_REQUEST);
        return;
      }

      // Max query length check for DoS protection
      if (query.length > 1000) {
        sendError(res, 'Query exceeds maximum allowed length of 1000 characters.', HttpStatus.BAD_REQUEST);
        return;
      }

      const response = ChatbotService.processQuery({
        query,
        conversationHistory,
        sessionId,
      });

      sendSuccess(res, response, 'Chatbot response generated successfully', HttpStatus.OK);
    } catch (error: any) {
      logger.error(`❌ ChatbotController.ask error: ${error.message}`);
      sendError(res, 'Failed to process chatbot query. Please try again.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get default suggested questions for the chatbot.
   */
  public static async getSuggestions(req: Request, res: Response): Promise<void> {
    try {
      const suggestions = ChatbotService.getInitialSuggestions();
      sendSuccess(res, { suggestions }, 'Suggestions retrieved successfully', HttpStatus.OK);
    } catch (error: any) {
      logger.error(`❌ ChatbotController.getSuggestions error: ${error.message}`);
      sendError(res, 'Failed to retrieve suggestions', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get chatbot metadata & system status.
   */
  public static async getInfo(req: Request, res: Response): Promise<void> {
    try {
      sendSuccess(
        res,
        {
          name: 'ChatApp AI Assistant',
          version: '2.0.0',
          type: 'Domain-Specific SaaS Knowledge Assistant',
          supportedDomains: [
            'User Authentication & JWT',
            'Real-Time Messaging & Socket.IO',
            'WebRTC Audio/Video Calling',
            'Group Chats & Permissions',
            'Live Screen Monitoring & Consent',
            'Theme Customization & Settings',
            'Security & Tech Stack Architecture',
          ],
          online: true,
        },
        'Chatbot status active',
        HttpStatus.OK
      );
    } catch (error: any) {
      logger.error(`❌ ChatbotController.getInfo error: ${error.message}`);
      sendError(res, 'Failed to retrieve chatbot info', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
