'use client';

import React from 'react';
import {
  Box,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Chip,
  CircularProgress,
  SelectChangeEvent,
} from '@mui/material';
import {
  Save,
  PlayArrow,
  Add,
} from '@mui/icons-material';
import { Flow } from '../../types';
import styles from './FlowToolbar.module.scss';

interface FlowToolbarProps {
  flows: Flow[];
  selectedFlow: Flow | null;
  activeFlow: Flow | null;
  isSaving: boolean;
  isDirty: boolean;
  hasNodes: boolean;
  onSelectFlow: (flowId: string) => void;
  onSave: () => void;
  onActivate: () => void;
  onNewFlow: () => void;
}

export const FlowToolbar: React.FC<FlowToolbarProps> = ({
  flows,
  selectedFlow,
  activeFlow,
  isSaving,
  isDirty,
  hasNodes,
  onSelectFlow,
  onSave,
  onActivate,
  onNewFlow,
}) => {
  const handleChange = (event: SelectChangeEvent<string>) => {
    onSelectFlow(event.target.value);
  };

  return (
    <Box className={styles.toolbar}>
      <Box className={styles.left}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Flow</InputLabel>
          <Select
            value={selectedFlow?.id || ''}
            label="Flow"
            onChange={handleChange}
          >
            {flows.map((flow) => (
              <MenuItem key={flow.id} value={flow.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {flow.name}
                  {flow.isActive && (
                    <Chip label="Activo" size="small" color="success" />
                  )}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          startIcon={<Add />}
          onClick={onNewFlow}
          size="small"
        >
          Nuevo
        </Button>
      </Box>

      <Box className={styles.center}>
        {activeFlow && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary" component="span">
              Flow activo:
            </Typography>
            <Chip
              label={activeFlow.name}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
        )}
      </Box>

      <Box className={styles.right}>
        <Button
          variant="outlined"
          startIcon={isSaving ? <CircularProgress size={16} /> : <Save />}
          onClick={onSave}
          disabled={!selectedFlow || isSaving || !isDirty}
          size="small"
          color={isDirty ? 'primary' : 'inherit'}
        >
          {isDirty ? 'Guardar*' : 'Guardar'}
        </Button>

        <Button
          variant="contained"
          startIcon={<PlayArrow />}
          onClick={onActivate}
          disabled={!selectedFlow || selectedFlow.isActive || !hasNodes}
          size="small"
          color="success"
        >
          Activar
        </Button>
      </Box>
    </Box>
  );
};

export default FlowToolbar;
