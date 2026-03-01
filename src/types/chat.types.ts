// Chat types
export interface Conversation {
  id: string;
  flowId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Turn {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

export interface SendMessageDto {
  message: string;
}

export interface ChatResponse {
  conversationId: string;
  message: string;
  timestamp: string;
}
