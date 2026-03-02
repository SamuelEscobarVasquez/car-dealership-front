'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Divider,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Switch,
  FormControlLabel,
  Button,
} from '@mui/material';
import { Close, Delete, ExpandMore, Add } from '@mui/icons-material';
import { Node } from '@xyflow/react';
import styles from './NodeConfigPanel.module.scss';

interface ValidationRule {
  field: string;
  orFields?: string[];
  required?: boolean;
  requiredWhenContains?: string[];
  label: string;
}

interface UseCaseValidationConfig {
  extract: 'dates' | 'autos' | 'consultation' | 'none';
  rules: ValidationRule[];
}

const defaultValidatorConfig = {
  useCases: {
    dates: {
      extract: 'dates' as const,
      rules: [
        {
          field: 'date',
          orFields: ['dayOfWeek'],
          required: true,
          label: 'fecha o día de la semana',
        },
      ],
    },
    autos: {
      extract: 'autos' as const,
      rules: [
        {
          field: 'maxPrice',
          orFields: ['minPrice'],
          required: false,
          requiredWhenContains: ['barato', 'económico', 'caro', 'lujoso'],
          label: 'rango de precio',
        },
      ],
    },
  },
};

interface NodeConfigPanelProps {
  node: Node | null;
  onClose: () => void;
  onRemoveNode: (nodeId: string) => void;
  onUpdateNode: (nodeId: string, data: Partial<Node['data']>) => void;
}

// Validator Config Editor Component
interface ValidatorConfigEditorProps {
  config: Record<string, UseCaseValidationConfig>;
  onChange: (config: Record<string, UseCaseValidationConfig>) => void;
}

const ValidatorConfigEditor: React.FC<ValidatorConfigEditorProps> = ({ config, onChange }) => {
  const [triggerInputs, setTriggerInputs] = useState<Record<string, string>>({});
  const [newUseCaseName, setNewUseCaseName] = useState('');

  const handleRuleChange = (
    useCase: string,
    ruleIndex: number,
    field: keyof ValidationRule,
    value: any
  ) => {
    const updatedConfig = { ...config };
    const rules = [...(updatedConfig[useCase]?.rules || [])];
    rules[ruleIndex] = { ...rules[ruleIndex], [field]: value };
    updatedConfig[useCase] = { ...updatedConfig[useCase], rules };
    onChange(updatedConfig);
  };

  const handleAddRule = (useCase: string) => {
    const updatedConfig = { ...config };
    const rules = [...(updatedConfig[useCase]?.rules || [])];
    rules.push({
      field: '',
      orFields: [],
      required: false,
      requiredWhenContains: [],
      label: '',
    });
    updatedConfig[useCase] = { ...updatedConfig[useCase], rules };
    onChange(updatedConfig);
  };

  const handleRemoveRule = (useCase: string, ruleIndex: number) => {
    const updatedConfig = { ...config };
    const rules = [...(updatedConfig[useCase]?.rules || [])];
    rules.splice(ruleIndex, 1);
    updatedConfig[useCase] = { ...updatedConfig[useCase], rules };
    onChange(updatedConfig);
  };

  const handleAddTrigger = (useCase: string, ruleIndex: number) => {
    const key = `${useCase}-${ruleIndex}`;
    const triggerValue = triggerInputs[key];
    if (!triggerValue?.trim()) return;
    const triggers = [...(config[useCase]?.rules[ruleIndex]?.requiredWhenContains || [])];
    triggers.push(triggerValue.trim());
    handleRuleChange(useCase, ruleIndex, 'requiredWhenContains', triggers);
    setTriggerInputs({ ...triggerInputs, [key]: '' });
  };

  const handleRemoveTrigger = (useCase: string, ruleIndex: number, triggerIndex: number) => {
    const triggers = [...(config[useCase]?.rules[ruleIndex]?.requiredWhenContains || [])];
    triggers.splice(triggerIndex, 1);
    handleRuleChange(useCase, ruleIndex, 'requiredWhenContains', triggers);
  };

  const handleAddUseCase = () => {
    if (!newUseCaseName.trim()) return;
    const updatedConfig = { ...config };
    updatedConfig[newUseCaseName.trim().toLowerCase()] = {
      extract: 'none',
      rules: [],
    };
    onChange(updatedConfig);
    setNewUseCaseName('');
  };

  const handleRemoveUseCase = (useCase: string) => {
    const updatedConfig = { ...config };
    delete updatedConfig[useCase];
    onChange(updatedConfig);
  };

  const handleExtractChange = (useCase: string, value: 'dates' | 'autos' | 'consultation' | 'none') => {
    const updatedConfig = { ...config };
    updatedConfig[useCase] = { ...updatedConfig[useCase], extract: value };
    onChange(updatedConfig);
  };

  const useCases = Object.keys(config);

  const getUseCaseIcon = (useCase: string) => {
    switch (useCase) {
      case 'dates': return '📅';
      case 'autos': return '🚗';
      case 'faq': return '❓';
      default: return '📋';
    }
  };

  return (
    <Box sx={{ mt: 1 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
        Configura qué campos son requeridos para cada caso de uso
      </Typography>
      
      {useCases.map((useCase) => (
        <Accordion key={useCase} defaultExpanded={useCases.length <= 2} sx={{ mt: 1 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
              <Typography variant="subtitle2">
                {getUseCaseIcon(useCase)} {useCase.charAt(0).toUpperCase() + useCase.slice(1)}
              </Typography>
              <IconButton 
                size="small" 
                color="error"
                onClick={(e) => { e.stopPropagation(); handleRemoveUseCase(useCase); }}
                sx={{ mr: 1 }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {/* Extract type selector */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">Tipo de extracción:</Typography>
              <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                {(['none', 'dates', 'autos', 'consultation'] as const).map((extractType) => (
                  <Chip
                    key={extractType}
                    label={extractType}
                    size="small"
                    color={config[useCase]?.extract === extractType ? 'primary' : 'default'}
                    onClick={() => handleExtractChange(useCase, extractType)}
                  />
                ))}
              </Box>
            </Box>

            {/* Rules */}
            {(config[useCase]?.rules || []).map((rule, ruleIndex) => (
              <Box key={ruleIndex} sx={{ mb: 2, p: 1.5, bgcolor: 'action.hover', borderRadius: 1, position: 'relative' }}>
                <IconButton 
                  size="small" 
                  color="error"
                  onClick={() => handleRemoveRule(useCase, ruleIndex)}
                  sx={{ position: 'absolute', top: 4, right: 4 }}
                >
                  <Delete fontSize="small" />
                </IconButton>
                
                <Typography variant="caption" color="primary" sx={{ fontWeight: 'bold' }}>
                  Regla {ruleIndex + 1}
                </Typography>

                <TextField
                  label="Campo principal"
                  value={rule.field}
                  onChange={(e) => handleRuleChange(useCase, ruleIndex, 'field', e.target.value)}
                  size="small"
                  fullWidth
                  margin="dense"
                  helperText="Nombre del campo a validar (ej: date, maxPrice)"
                />
                
                <TextField
                  label="Campos alternativos (OR)"
                  value={(rule.orFields || []).join(', ')}
                  onChange={(e) => handleRuleChange(useCase, ruleIndex, 'orFields', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                  size="small"
                  fullWidth
                  margin="dense"
                  helperText="Campos alternativos separados por coma (ej: dayOfWeek)"
                />

                <TextField
                  label="Etiqueta para el usuario"
                  value={rule.label}
                  onChange={(e) => handleRuleChange(useCase, ruleIndex, 'label', e.target.value)}
                  size="small"
                  fullWidth
                  margin="dense"
                  helperText="Texto que se mostrará al pedir el dato"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={rule.required || false}
                      onChange={(e) => handleRuleChange(useCase, ruleIndex, 'required', e.target.checked)}
                      size="small"
                    />
                  }
                  label="Siempre requerido"
                />

                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Requerir cuando el mensaje contiene:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                    {(rule.requiredWhenContains || []).map((trigger, idx) => (
                      <Chip
                        key={idx}
                        label={trigger}
                        size="small"
                        onDelete={() => handleRemoveTrigger(useCase, ruleIndex, idx)}
                      />
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <TextField
                      placeholder="Nueva palabra trigger"
                      value={triggerInputs[`${useCase}-${ruleIndex}`] || ''}
                      onChange={(e) => setTriggerInputs({ ...triggerInputs, [`${useCase}-${ruleIndex}`]: e.target.value })}
                      size="small"
                      sx={{ flex: 1 }}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTrigger(useCase, ruleIndex)}
                    />
                    <IconButton size="small" onClick={() => handleAddTrigger(useCase, ruleIndex)} color="primary">
                      <Add />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            ))}

            {/* Add Rule Button */}
            <Button
              startIcon={<Add />}
              size="small"
              variant="outlined"
              onClick={() => handleAddRule(useCase)}
              fullWidth
              sx={{ mt: 1 }}
            >
              Añadir Regla
            </Button>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Add UseCase */}
      <Box sx={{ mt: 2, p: 1, border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Añadir nuevo caso de uso:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <TextField
            placeholder="Nombre del caso (ej: reservas)"
            value={newUseCaseName}
            onChange={(e) => setNewUseCaseName(e.target.value)}
            size="small"
            sx={{ flex: 1 }}
            onKeyPress={(e) => e.key === 'Enter' && handleAddUseCase()}
          />
          <IconButton size="small" onClick={handleAddUseCase} color="primary">
            <Add />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

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
  // Use node.type as fallback if nodeType is not in data
  const nodeType = nodeData.nodeType || node.type;

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

        {nodeType === 'memory.load' && (
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

        {nodeType === 'faq.specialist.openai' && (
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

        {nodeType === 'validator.required_fields' && (
          <ValidatorConfigEditor
            config={nodeData.config?.useCases || defaultValidatorConfig.useCases}
            onChange={(useCases) => handleConfigChange('useCases', useCases)}
          />
        )}

        {nodeType === 'autos.specialist.openai' && (
          <TextField
            label="Max Resultados"
            type="number"
            value={nodeData.config?.maxResults || 5}
            onChange={(e) => handleConfigChange('maxResults', parseInt(e.target.value))}
            fullWidth
            size="small"
            margin="normal"
            helperText="Número máximo de autos a mostrar"
          />
        )}

        {nodeType === 'dates.specialist.openai' && (
          <TextField
            label="Max Slots"
            type="number"
            value={nodeData.config?.maxSlots || 5}
            onChange={(e) => handleConfigChange('maxSlots', parseInt(e.target.value))}
            fullWidth
            size="small"
            margin="normal"
            helperText="Número máximo de horarios a mostrar"
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
