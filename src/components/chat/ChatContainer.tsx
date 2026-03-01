'use client';

import React, { useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Alert,
  Chip,
  Button,
  List,
  ListItemButton,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  CircularProgress,
} from '@mui/material';
import { Add, Delete, Chat } from '@mui/icons-material';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useChatStore, useFlowStore } from '../../store';
import styles from './ChatContainer.module.scss';

export const ChatContainer: React.FC = () => {
  const {
    conversationId,
    conversations,
    isLoadingConversations,
    initConversation,
    loadHistory,
    loadConversations,
    switchConversation,
    startNewConversation,
    deleteConversation,
    error,
    setError,
  } = useChatStore();
  const { activeFlow, loadActiveFlow } = useFlowStore();

  useEffect(() => {
    initConversation();
    loadHistory();
    loadActiveFlow();
    loadConversations();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return date.toLocaleDateString('es');
  };

  const handleNewChat = () => {
    startNewConversation();
  };

  const handleSwitchConversation = (id: string) => {
    if (id !== conversationId) {
      switchConversation(id);
    }
  };

  const handleDeleteConversation = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('¿Eliminar esta conversación?')) {
      deleteConversation(id);
    }
  };

  return (
    <Box className={styles.container}>
      {/* Conversations Sidebar */}
      <Paper className={styles.conversationsSidebar} elevation={0}>
        <Box className={styles.sidebarHeader}>
          <Typography variant="subtitle1" fontWeight={600}>
            Conversaciones
          </Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={<Add />}
            onClick={handleNewChat}
            sx={{ minWidth: 'auto', px: 1.5 }}
          >
            Nuevo
          </Button>
        </Box>
        <Divider />
        
        {isLoadingConversations ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : conversations.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
            <Chat sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
            <Typography variant="body2">
              No hay conversaciones
            </Typography>
          </Box>
        ) : (
          <List dense className={styles.conversationList}>
            {conversations.map((conv) => (
              <ListItemButton
                key={conv.id}
                selected={conv.id === conversationId}
                onClick={() => handleSwitchConversation(conv.id)}
                className={styles.conversationItem}
              >
                <ListItemText
                  primary={`Chat ${conv.id.substring(0, 8)}...`}
                  secondary={formatDate(conv.updatedAt)}
                  primaryTypographyProps={{ noWrap: true, fontSize: '0.875rem' }}
                  secondaryTypographyProps={{ fontSize: '0.75rem' }}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={(e) => handleDeleteConversation(e, conv.id)}
                    sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItemButton>
            ))}
          </List>
        )}
      </Paper>

      {/* Chat Area */}
      <Paper className={styles.chatPaper} elevation={0}>
        <Box className={styles.header}>
          <Typography variant="h5" fontWeight={600}>
            Chat Live
          </Typography>
          {activeFlow && (
            <Chip
              label={`Flow: ${activeFlow.name}`}
              color="primary"
              size="small"
              variant="outlined"
            />
          )}
        </Box>

        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mx: 2 }}>
            {error}
          </Alert>
        )}

        <MessageList />
        <MessageInput />
      </Paper>
    </Box>
  );
};

export default ChatContainer;
