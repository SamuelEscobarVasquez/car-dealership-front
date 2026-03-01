'use client';

import React, { useState, KeyboardEvent } from 'react';
import { Box, TextField, IconButton, Tooltip } from '@mui/material';
import { Send, Delete } from '@mui/icons-material';
import { useChatStore } from '../../store';
import styles from './MessageInput.module.scss';

export const MessageInput: React.FC = () => {
  const [input, setInput] = useState('');
  const { sendMessage, clearConversation, isLoading } = useChatStore();

  const handleSend = async () => {
    const message = input.trim();
    if (!message || isLoading) return;
    
    setInput('');
    await sendMessage(message);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box className={styles.inputContainer}>
      <Tooltip title="Nueva conversación">
        <IconButton
          onClick={clearConversation}
          color="default"
          className={styles.clearButton}
        >
          <Delete />
        </IconButton>
      </Tooltip>

      <TextField
        fullWidth
        multiline
        maxRows={4}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Escribe tu mensaje..."
        disabled={isLoading}
        className={styles.textField}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 3,
          },
        }}
      />

      <Tooltip title="Enviar (Enter)">
        <span>
          <IconButton
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            color="primary"
            className={styles.sendButton}
          >
            <Send />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
};

export default MessageInput;
