'use client';

import React, { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { Box, Typography } from '@mui/material';
import {
  Memory,
  AccountTree,
  QuestionAnswer,
  Chat,
  Output,
  Settings,
} from '@mui/icons-material';
import styles from './CustomNode.module.scss';

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

type CustomNodeData = {
  label: string;
  config: Record<string, unknown>;
  nodeType?: string;
};

type CustomFlowNode = Node<CustomNodeData>;

export const CustomNode: React.FC<NodeProps<CustomFlowNode>> = memo(({ data, type, selected }) => {
  const nodeType = data.nodeType || type || 'default';
  const icon = nodeIcons[nodeType] || <Settings />;
  const color = nodeColors[nodeType] || '#757575';

  return (
    <Box
      className={`${styles.customNode} ${selected ? styles.selected : ''}`}
      sx={{
        borderColor: color,
        '&:hover': {
          boxShadow: `0 0 0 2px ${color}40`,
        },
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className={styles.handle}
        style={{ backgroundColor: color }}
      />

      <Box className={styles.header} sx={{ backgroundColor: color }}>
        <Box className={styles.icon}>{icon}</Box>
        <Typography variant="caption" className={styles.type}>
          {nodeType.split('.').pop()}
        </Typography>
      </Box>

      <Box className={styles.content}>
        <Typography variant="body2" fontWeight={500}>
          {data.label}
        </Typography>
      </Box>

      <Handle
        type="source"
        position={Position.Bottom}
        className={styles.handle}
        style={{ backgroundColor: color }}
      />

      {/* Conditional handles for orchestrator */}
      {nodeType === 'orchestrator.openai' && (
        <>
          <Handle
            type="source"
            position={Position.Right}
            id="faq"
            className={styles.handle}
            style={{ backgroundColor: '#2e7d32', top: '40%' }}
          />
          <Handle
            type="source"
            position={Position.Right}
            id="generic"
            className={styles.handle}
            style={{ backgroundColor: '#ed6c02', top: '70%' }}
          />
        </>
      )}
    </Box>
  );
});

CustomNode.displayName = 'CustomNode';

export default CustomNode;
