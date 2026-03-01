'use client';

import React, { useCallback, useRef, useEffect, useState, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Node,
  ReactFlowProvider,
  ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import { useFlowStore } from '../../store';
import { NodeTypeDefinition } from '../../types';
import { CustomNode } from './CustomNode';
import { NodePalette } from './NodePalette';
import { NodeConfigPanel } from './NodeConfigPanel';
import { FlowToolbar } from './FlowToolbar';
import styles from './FlowCanvas.module.scss';

const nodeTypes = {
  'memory.load': CustomNode,
  'orchestrator.openai': CustomNode,
  'faq.specialist.openai': CustomNode,
  'generic.response.openai': CustomNode,
  'response.compose': CustomNode,
  default: CustomNode,
};

export const FlowCanvas: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [newFlowDialogOpen, setNewFlowDialogOpen] = useState(false);
  const [newFlowName, setNewFlowName] = useState('');
  const [lastSavedState, setLastSavedState] = useState<{ nodes: Node[]; edges: any[] }>({ nodes: [], edges: [] });

  const {
    flows,
    activeFlow,
    selectedFlow,
    nodes: storeNodes,
    edges: storeEdges,
    nodeTypes: availableNodeTypes,
    isSaving,
    selectedNodeId,
    loadFlows,
    loadActiveFlow,
    loadNodeTypes,
    selectFlow,
    createFlow,
    updateFlow,
    activateFlow,
    setNodes: setStoreNodes,
    setEdges: setStoreEdges,
    selectNode,
  } = useFlowStore();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Check if there are unsaved changes
  const isDirty = useMemo(() => {
    if (!selectedFlow) return false;
    const nodesChanged = JSON.stringify(nodes.map(n => ({ id: n.id, type: n.type, position: n.position, data: n.data }))) !== 
                         JSON.stringify(lastSavedState.nodes.map(n => ({ id: n.id, type: n.type, position: n.position, data: n.data })));
    const edgesChanged = JSON.stringify(edges.map(e => ({ id: e.id, source: e.source, target: e.target }))) !==
                         JSON.stringify(lastSavedState.edges.map(e => ({ id: e.id, source: e.source, target: e.target })));
    return nodesChanged || edgesChanged;
  }, [nodes, edges, lastSavedState, selectedFlow]);

  // Load data on mount
  useEffect(() => {
    const init = async () => {
      const freshFlows = await loadFlows();
      await loadActiveFlow();
      await loadNodeTypes();
      
      // Get current state after loading
      const state = useFlowStore.getState();
      
      if (state.selectedFlow) {
        // Re-select current flow to reload nodes/edges from definition
        const freshFlow = state.flows.find(f => f.id === state.selectedFlow!.id);
        if (freshFlow) {
          selectFlow(freshFlow);
        }
      } else if (state.activeFlow) {
        // Auto-select active flow if none selected
        selectFlow(state.activeFlow);
      }
    };
    init();
  }, []);

  // Sync store nodes/edges to local state when store changes
  useEffect(() => {
    setNodes(storeNodes);
    setEdges(storeEdges);
    setLastSavedState({ nodes: storeNodes, edges: storeEdges });
  }, [storeNodes, storeEdges, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      // Add condition data for orchestrator edges
      const sourceNode = nodes.find((n) => n.id === params.source);
      const edgeData = sourceNode?.type === 'orchestrator.openai' && params.sourceHandle
        ? { condition: params.sourceHandle }
        : undefined;

      setEdges((eds) =>
        addEdge(
          {
            ...params,
            id: uuidv4(),
            data: edgeData,
          },
          eds
        )
      );
    },
    [nodes, setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !reactFlowInstance) return;

      const data = event.dataTransfer.getData('application/reactflow');
      if (!data) return;

      const nodeType: NodeTypeDefinition = JSON.parse(data);
      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      const newNode: Node = {
        id: uuidv4(),
        type: nodeType.type,
        position,
        data: {
          label: nodeType.label,
          config: Object.fromEntries(
            Object.entries(nodeType.config).map(([key, val]) => [key, val.default])
          ),
          nodeType: nodeType.type,
        },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [reactFlowInstance, setNodes]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      selectNode(node.id);
    },
    [selectNode]
  );

  const onPaneClick = useCallback(() => {
    selectNode(null);
  }, [selectNode]);

  const handleSelectFlow = (flowId: string) => {
    const flow = flows.find((f) => f.id === flowId);
    if (flow) {
      selectFlow(flow);
    }
  };

  const handleSave = async () => {
    if (selectedFlow) {
      await updateFlow(selectedFlow.id, nodes, edges);
      setLastSavedState({ nodes: [...nodes], edges: [...edges] });
    }
  };

  // Handle removing a node from local state
  const handleRemoveNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    selectNode(null);
  }, [setNodes, setEdges, selectNode]);

  const handleActivate = () => {
    if (selectedFlow) {
      activateFlow(selectedFlow.id);
    }
  };

  const handleNewFlow = () => {
    setNewFlowDialogOpen(true);
  };

  const handleCreateFlow = async () => {
    if (newFlowName.trim()) {
      await createFlow(newFlowName.trim());
      setNewFlowName('');
      setNewFlowDialogOpen(false);
    }
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;

  return (
    <Box className={styles.container}>
      <FlowToolbar
        flows={flows}
        selectedFlow={selectedFlow}
        activeFlow={activeFlow}
        isSaving={isSaving}
        isDirty={isDirty}
        hasNodes={nodes.length > 0}
        onSelectFlow={handleSelectFlow}
        onSave={handleSave}
        onActivate={handleActivate}
        onNewFlow={handleNewFlow}
      />

      <Box className={styles.mainContent}>
        <NodePalette nodeTypes={availableNodeTypes} />

        <Box className={styles.canvasWrapper} ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            snapToGrid
            snapGrid={[16, 16]}
          >
            <Controls />
            <MiniMap />
            <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
          </ReactFlow>
        </Box>

        {selectedNodeId && (
          <NodeConfigPanel 
            node={selectedNode} 
            onClose={() => selectNode(null)}
            onRemoveNode={handleRemoveNode}
            onUpdateNode={(nodeId, data) => {
              setNodes((nds) => nds.map((n) => 
                n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
              ));
            }}
          />
        )}
      </Box>

      {/* New Flow Dialog */}
      <Dialog open={newFlowDialogOpen} onClose={() => setNewFlowDialogOpen(false)}>
        <DialogTitle>Nuevo Flow</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre del Flow"
            fullWidth
            value={newFlowName}
            onChange={(e) => setNewFlowName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateFlow()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewFlowDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleCreateFlow} variant="contained">
            Crear
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const FlowCanvasWithProvider: React.FC = () => (
  <ReactFlowProvider>
    <FlowCanvas />
  </ReactFlowProvider>
);

export default FlowCanvasWithProvider;
