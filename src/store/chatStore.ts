import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage, Conversation } from '../types';
import { chatService } from '../services';

interface ChatStore {
  conversationId: string;
  messages: ChatMessage[];
  conversations: Conversation[];
  isLoading: boolean;
  isLoadingConversations: boolean;
  error: string | null;
  
  // Actions
  initConversation: () => void;
  sendMessage: (content: string) => Promise<void>;
  loadHistory: () => Promise<void>;
  loadConversations: () => Promise<void>;
  switchConversation: (id: string) => Promise<void>;
  startNewConversation: () => void;
  deleteConversation: (id: string) => Promise<void>;
  clearConversation: () => void;
  setError: (error: string | null) => void;
}

const STORAGE_KEY = 'agent_builder_conversation_id';

const getOrCreateConversationId = (): string => {
  if (typeof window === 'undefined') return uuidv4();
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return stored;
  
  const newId = uuidv4();
  localStorage.setItem(STORAGE_KEY, newId);
  return newId;
};

export const useChatStore = create<ChatStore>()((set, get) => ({
  conversationId: '',
  messages: [],
  conversations: [],
  isLoading: false,
  isLoadingConversations: false,
  error: null,

  initConversation: () => {
    const id = getOrCreateConversationId();
    set({ conversationId: id });
  },

  loadConversations: async () => {
    set({ isLoadingConversations: true });
    try {
      const conversations = await chatService.getConversations();
      set({ conversations, isLoadingConversations: false });
    } catch {
      set({ isLoadingConversations: false });
    }
  },

  switchConversation: async (id: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, id);
    }
    set({ conversationId: id, messages: [], isLoading: true });
    
    try {
      const history = await chatService.getHistory(id);
      const messages: ChatMessage[] = history.map((turn) => ({
        id: turn.id,
        role: turn.role,
        content: turn.content,
        timestamp: new Date(turn.createdAt),
      }));
      set({ messages, isLoading: false });
    } catch {
      set({ messages: [], isLoading: false });
    }
  },

  startNewConversation: () => {
    const newId = uuidv4();
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newId);
    }
    set({ conversationId: newId, messages: [], error: null });
  },

  deleteConversation: async (id: string) => {
    try {
      await chatService.deleteConversation(id);
      const { conversations, conversationId } = get();
      set({ conversations: conversations.filter((c) => c.id !== id) });
      
      // If deleted the current conversation, start a new one
      if (id === conversationId) {
        get().startNewConversation();
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({ error: err.response?.data?.message || 'Error al eliminar conversación' });
    }
  },

  sendMessage: async (content: string) => {
    const { conversationId, messages } = get();
    
    // Add user message
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    
    // Add loading message
    const loadingMessage: ChatMessage = {
      id: uuidv4(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true,
    };
    
    set({
      messages: [...messages, userMessage, loadingMessage],
      isLoading: true,
      error: null,
    });

    try {
      const response = await chatService.sendMessage(conversationId, content);
      
      // Replace loading message with actual response
      set((state: ChatStore) => ({
        messages: state.messages.map((msg: ChatMessage) =>
          msg.isLoading
            ? {
                ...msg,
                content: response.message,
                timestamp: new Date(response.timestamp),
                isLoading: false,
              }
            : msg
        ),
        isLoading: false,
      }));
      
      // Refresh conversations list (new conversation may have been created)
      get().loadConversations();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error al enviar el mensaje';
      // Remove loading message and show error
      set((state: ChatStore) => ({
        messages: state.messages.filter((msg: ChatMessage) => !msg.isLoading),
        isLoading: false,
        error: errorMessage,
      }));
    }
  },

  loadHistory: async () => {
    const { conversationId } = get();
    if (!conversationId) return;

    set({ isLoading: true, error: null });

    try {
      const history = await chatService.getHistory(conversationId);
      const messages: ChatMessage[] = history.map((turn) => ({
        id: turn.id,
        role: turn.role,
        content: turn.content,
        timestamp: new Date(turn.createdAt),
      }));
      set({ messages, isLoading: false });
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: { message?: string } } };
      // If conversation doesn't exist, that's fine - start fresh
      if (err.response?.status === 404) {
        set({ messages: [], isLoading: false });
      } else {
        set({
          isLoading: false,
          error: err.response?.data?.message || 'Error al cargar el historial',
        });
      }
    }
  },

  clearConversation: () => {
    const newId = uuidv4();
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newId);
    }
    set({ conversationId: newId, messages: [], error: null });
  },

  setError: (error: string | null) => set({ error }),
}));
