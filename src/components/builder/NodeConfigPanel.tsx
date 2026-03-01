'use client';

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Divider,
  IconButton,
} from '@mui/material';
import { Close, Delete } from '@mui/icons-material';
import { Node } from '@xyflow/react';
import styles from './NodeConfigPanel.module.scss';

interface NodeConfigPanelProps {
  node: Node | null;
  onClose: () => void;
  onRemoveNode: (nodeId: string) => void;
  onUpdateNode: (nodeId: string, data: Partial<Node['data']>) => void;
}

export const NodeConfigPanel: React.FC<NodeConfigPanelProps> = ({
  node,
  onClose,
  onRemoveNode,
  onUpdateNode,
}) => {
  if (!node) return null;

  const handleLabelChange = (value: string) => {
    onUpdateNode(node.id, { label: value });
  };

  const handleConfigChange = (key: string, value: any) => {
    const currentConfig = (node.data as any).config || {};
    onUpdateNode(node.id, {
      config: { ...currentConfig, [key]: value },
    });
  };

  const handleDelete = () => {
    onRemoveNode(node.id);
    onClose();
  };

  const nodeData = node.data as { label: string; config: Record<string, any>; nodeType?: string };

  return (
    <Paper className={styles.panel} elevation={0}>
      <Box className={styles.header}>
        <Typography variant="h6">Configuración</Typography>
        <IconButton size="small" onClick={onClose}>
          <Close />
        </IconButton>
      </Box>

      <Divider />

      <Box className={styles.content}>
        <Typography variant="overline" color="text.secondary">
          Nodo: {nodeData.nodeType || node.type}
        </Typography>

        <TextField
          label="Label"
          value={nodeData.label || ''}
          onChange={(e) => handleLabelChange(e.target.value)}
          fullWidth
          size="small"
          margin="normal"
        />

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>
          Configuración
        </Typography>

        {nodeData.nodeType === 'memory.load' && (
          <TextField
            label="Max Turns"
            type="number"
            value={nodeData.config?.maxTurns || 10}
            onChange={(e) => handleConfigChange('maxTurns', parseInt(e.target.value))}
            fullWidth
            size="small"
            margin="normal"
          />
        )}

        {nodeData.nodeType === 'faq.specialist.openai' && (
          <TextField
            label="Top K FAQs"
            type="number"
            value={nodeData.config?.topK || 5}
            onChange={(e) => handleConfigChange('topK', parseInt(e.target.value))}
            fullWidth
            size="small"
            margin="normal"
          />
        )}

        <Box className={styles.actions}>
          <IconButton color="error" onClick={handleDelete}>
            <Delete />
          </IconButton>
          <Typography variant="caption" color="error">
            Eliminar nodo
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default NodeConfigPanel;
