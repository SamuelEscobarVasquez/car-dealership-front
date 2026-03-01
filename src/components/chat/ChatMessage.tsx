'use client';

import React from 'react';
import { Box, Typography, Avatar, CircularProgress } from '@mui/material';
import { SmartToy, Person } from '@mui/icons-material';
import { ChatMessage as ChatMessageType } from '../../types';
import styles from './ChatMessage.module.scss';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isLoading = message.isLoading;

  return (
    <Box
      className={`${styles.messageContainer} ${isUser ? styles.user : styles.assistant}`}
    >
      <Avatar
        className={styles.avatar}
        sx={{
          bgcolor: isUser ? 'primary.main' : 'secondary.main',
          width: 36,
          height: 36,
        }}
      >
        {isUser ? <Person fontSize="small" /> : <SmartToy fontSize="small" />}
      </Avatar>

      <Box className={styles.messageContent}>
        <Typography variant="caption" color="text.secondary" className={styles.role}>
          {isUser ? 'Tú' : 'Asistente'}
        </Typography>
        
        <Box
          className={`${styles.bubble} ${isUser ? styles.userBubble : styles.assistantBubble}`}
        >
          {isLoading ? (
            <Box className={styles.loading}>
              <CircularProgress size={16} />
              <Typography variant="body2" color="text.secondary">
                Escribiendo...
              </Typography>
            </Box>
          ) : (
            <Typography variant="body1" className={styles.text}>
              {message.content}
            </Typography>
          )}
        </Box>

        <Typography variant="caption" color="text.secondary" className={styles.timestamp}>
          {new Date(message.timestamp).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Typography>
      </Box>
    </Box>
  );
};

export default ChatMessage;
