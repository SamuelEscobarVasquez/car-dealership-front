'use client';

import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Divider,
} from '@mui/material';
import {
  Memory,
  AccountTree,
  QuestionAnswer,
  Chat,
  Output,
  DragIndicator,
} from '@mui/icons-material';
import { NodeTypeDefinition } from '../../types';
import styles from './NodePalette.module.scss';

interface NodePaletteProps {
  nodeTypes: NodeTypeDefinition[];
}

const categoryIcons: Record<string, React.ReactNode> = {
  memory: <Memory />,
  ai: <AccountTree />,
  output: <Output />,
};

const nodeIcons: Record<string, React.ReactNode> = {
  'memory.load': <Memory />,
  'orchestrator.openai': <AccountTree />,
  'faq.specialist.openai': <QuestionAnswer />,
  'generic.response.openai': <Chat />,
  'response.compose': <Output />,
};

const nodeColors: Record<string, string> = {
  'memory.load': '#8e24aa',
  'orchestrator.openai': '#1565c0',
  'faq.specialist.openai': '#2e7d32',
  'generic.response.openai': '#ed6c02',
  'response.compose': '#d32f2f',
};

export const NodePalette: React.FC<NodePaletteProps> = ({ nodeTypes }) => {
  const categories = [...new Set(nodeTypes.map((n) => n.category))];

  const onDragStart = (event: React.DragEvent, nodeType: NodeTypeDefinition) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeType));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Paper className={styles.palette} elevation={0}>
      <Typography variant="h6" className={styles.title}>
        Nodos
      </Typography>
      <Divider />

      {categories.map((category) => (
        <Box key={category} className={styles.category}>
          <Typography
            variant="overline"
            color="text.secondary"
            className={styles.categoryTitle}
          >
            {category}
          </Typography>

          <List dense disablePadding>
            {nodeTypes
              .filter((n) => n.category === category)
              .map((nodeType) => (
                <ListItem
                  key={nodeType.type}
                  className={styles.nodeItem}
                  draggable
                  onDragStart={(e) => onDragStart(e, nodeType)}
                  sx={{
                    borderLeft: `3px solid ${nodeColors[nodeType.type] || '#757575'}`,
                    '&:hover': {
                      backgroundColor: `${nodeColors[nodeType.type]}15`,
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <DragIndicator fontSize="small" color="disabled" />
                  </ListItemIcon>
                  <ListItemIcon
                    sx={{ minWidth: 32, color: nodeColors[nodeType.type] }}
                  >
                    {nodeIcons[nodeType.type]}
                  </ListItemIcon>
                  <ListItemText
                    primary={nodeType.label}
                    secondary={nodeType.description}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              ))}
          </List>
        </Box>
      ))}
    </Paper>
  );
};

export default NodePalette;
