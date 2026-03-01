import { create } from 'zustand';
import { Node, Edge } from '@xyflow/react';
import { Flow, NodeTypeDefinition, FlowNode, FlowEdge } from '../types';
import { flowService } from '../services';

interface FlowStore {
  // Flow list
  flows: Flow[];
  activeFlow: Flow | null;
  selectedFlow: Flow | null;
  
  // Builder state
  nodes: Node[];
  edges: Edge[];
  nodeTypes: NodeTypeDefinition[];
  
  // UI state
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  selectedNodeId: string | null;
  
  // Actions
  loadFlows: () => Promise<void>;
  loadActiveFlow: () => Promise<void>;
  loadNodeTypes: () => Promise<void>;
  selectFlow: (flow: Flow | null) => void;
  createFlow: (name: string, description?: string) => Promise<Flow>;
  updateFlow: (id: string, nodes: Node[], edges: Edge[]) => Promise<void>;
  deleteFlow: (id: string) => Promise<void>;
  activateFlow: (id: string) => Promise<void>;
  
  // Builder actions
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  addNode: (node: Node) => void;
  updateNode: (nodeId: string, data: Partial<Node['data']>) => void;
  removeNode: (nodeId: string) => void;
  selectNode: (nodeId: string | null) => void;
  
  setError: (error: string | null) => void;
}

type ApiError = { response?: { data?: { message?: string } } };

export const useFlowStore = create<FlowStore>()((set, get) => ({
  flows: [],
  activeFlow: null,
  selectedFlow: null,
  nodes: [],
  edges: [],
  nodeTypes: [],
  isLoading: false,
  isSaving: false,
  error: null,
  selectedNodeId: null,

  loadFlows: async () => {
    set({ isLoading: true, error: null });
    try {
      const flows = await flowService.getAll();
      set({ flows, isLoading: false });
    } catch (error: unknown) {
      const err = error as ApiError;
      set({
        isLoading: false,
        error: err.response?.data?.message || 'Error al cargar los flows',
      });
    }
  },

  loadActiveFlow: async () => {
    try {
      const activeFlow = await flowService.getActive();
      set({ activeFlow });
    } catch (error: unknown) {
      console.error('Error loading active flow:', error);
    }
  },

  loadNodeTypes: async () => {
    try {
      const response = await flowService.getNodeTypes();
      set({ nodeTypes: response.definitions });
    } catch (error: unknown) {
      console.error('Error loading node types:', error);
    }
  },

  selectFlow: (flow: Flow | null) => {
    if (flow) {
      const nodes: Node[] = flow.definition.nodes.map((n: FlowNode) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: n.data,
      }));
      const edges: Edge[] = flow.definition.edges.map((e: FlowEdge) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
        data: e.data,
      }));
      set({ selectedFlow: flow, nodes, edges, selectedNodeId: null });
    } else {
      set({ selectedFlow: null, nodes: [], edges: [], selectedNodeId: null });
    }
  },

  createFlow: async (name: string, description?: string) => {
    set({ isSaving: true, error: null });
    try {
      const newFlow = await flowService.create({
        name,
        description,
        definition: {
          startNodeId: '',
          nodes: [],
          edges: [],
        },
      });
      // Reload flows to ensure list is in sync, then select the new flow
      const flows = await flowService.getAll();
      const createdFlow = flows.find((f: Flow) => f.id === newFlow.id) || newFlow;
      set({ flows, isSaving: false });
      get().selectFlow(createdFlow);
      return createdFlow;
    } catch (error: unknown) {
      const err = error as ApiError;
      set({
        isSaving: false,
        error: err.response?.data?.message || 'Error al crear el flow',
      });
      throw error;
    }
  },

  updateFlow: async (id: string, nodes: Node[], edges: Edge[]) => {
    const { selectedFlow } = get();
    if (!selectedFlow) return;

    set({ isSaving: true, error: null });
    try {
      const startNodeId = nodes.length > 0 ? nodes[0].id : '';
      const definition = {
        startNodeId,
        nodes: nodes.map((n: Node) => ({
          id: n.id,
          type: n.type || 'default',
          position: n.position,
          data: n.data as { label: string; config: Record<string, unknown> },
        })),
        edges: edges.map((e: Edge) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          sourceHandle: e.sourceHandle ?? undefined,
          targetHandle: e.targetHandle ?? undefined,
          data: e.data as { condition?: string },
        })),
      };

      await flowService.update(id, { definition });
      // Reload flows to ensure list is in sync
      const flows = await flowService.getAll();
      const updatedFlow = flows.find((f: Flow) => f.id === id);
      set({
        flows,
        selectedFlow: updatedFlow || null,
        isSaving: false,
      });
    } catch (error: unknown) {
      const err = error as ApiError;
      set({
        isSaving: false,
        error: err.response?.data?.message || 'Error al guardar el flow',
      });
    }
  },

  deleteFlow: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await flowService.delete(id);
      set((state: FlowStore) => ({
        flows: state.flows.filter((f: Flow) => f.id !== id),
        selectedFlow: state.selectedFlow?.id === id ? null : state.selectedFlow,
        isLoading: false,
      }));
    } catch (error: unknown) {
      const err = error as ApiError;
      set({
        isLoading: false,
        error: err.response?.data?.message || 'Error al eliminar el flow',
      });
    }
  },

  activateFlow: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const activated = await flowService.activate(id);
      set((state: FlowStore) => {
        const updatedFlows = state.flows.map((f: Flow) => ({
          ...f,
          isActive: f.id === id,
        }));
        // Also update selectedFlow if it's the one being activated
        const updatedSelectedFlow = state.selectedFlow?.id === id 
          ? { ...state.selectedFlow, isActive: true }
          : state.selectedFlow;
        return {
          flows: updatedFlows,
          activeFlow: activated,
          selectedFlow: updatedSelectedFlow,
          isLoading: false,
        };
      });
    } catch (error: unknown) {
      const err = error as ApiError;
      set({
        isLoading: false,
        error: err.response?.data?.message || 'Error al activar el flow',
      });
    }
  },

  setNodes: (nodes: Node[]) => set({ nodes }),
  setEdges: (edges: Edge[]) => set({ edges }),
  
  addNode: (node: Node) => set((state: FlowStore) => ({ nodes: [...state.nodes, node] })),
  
  updateNode: (nodeId: string, data: Partial<Node['data']>) =>
    set((state: FlowStore) => ({
      nodes: state.nodes.map((n: Node) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
      ),
    })),
  
  removeNode: (nodeId: string) =>
    set((state: FlowStore) => ({
      nodes: state.nodes.filter((n: Node) => n.id !== nodeId),
      edges: state.edges.filter(
        (e: Edge) => e.source !== nodeId && e.target !== nodeId
      ),
      selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
    })),
  
  selectNode: (nodeId: string | null) => set({ selectedNodeId: nodeId }),
  
  setError: (error: string | null) => set({ error }),
}));
