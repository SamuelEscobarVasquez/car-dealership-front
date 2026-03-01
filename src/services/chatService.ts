import api from './api';
import { Turn, SendMessageDto, ChatResponse, Conversation } from '../types';

export const chatService = {
  // Get all conversations
  getConversations: async (): Promise<Conversation[]> => {
    const response = await api.get<Conversation[]>('/chat');
    return response.data;
  },

  // Send message to chat
  sendMessage: async (
    conversationId: string,
    message: string
  ): Promise<ChatResponse> => {
    const dto: SendMessageDto = { message };
    const response = await api.post<ChatResponse>(
      `/chat/${conversationId}/message`,
      dto
    );
    return response.data;
  },

  // Get conversation history
  getHistory: async (conversationId: string): Promise<Turn[]> => {
    const response = await api.get<Turn[]>(`/chat/${conversationId}/history`);
    return response.data;
  },

  // Delete conversation
  deleteConversation: async (conversationId: string): Promise<void> => {
    await api.delete(`/chat/${conversationId}`);
  },
};

export default chatService;
