'use client';

import React, { useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { ChatMessage } from './ChatMessage';
import { useChatStore } from '../../store';
import styles from './MessageList.module.scss';

export const MessageList: React.FC = () => {
  const { messages } = useChatStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <Box className={styles.emptyState}>
        <Typography variant="h6" color="text.secondary">
          👋 ¡Hola!
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Soy tu asistente virtual de la agencia de autos.
          <br />
          ¿En qué puedo ayudarte hoy?
        </Typography>
      </Box>
    );
  }

  return (
    <Box className={styles.messageList}>
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
      <div ref={bottomRef} />
    </Box>
  );
};

export default MessageList;
