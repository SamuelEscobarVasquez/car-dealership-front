// Flow types
export interface FlowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    config: Record<string, any>;
  };
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  data?: {
    condition?: string;
  };
}

export interface FlowDefinition {
  startNodeId: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export interface Flow {
  id: string;
  name: string;
  description?: string;
  definition: FlowDefinition;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFlowDto {
  name: string;
  description?: string;
  definition: FlowDefinition;
}

export interface UpdateFlowDto {
  name?: string;
  description?: string;
  definition?: FlowDefinition;
}

export interface NodeTypeDefinition {
  type: string;
  label: string;
  description: string;
  category: 'memory' | 'ai' | 'output';
  outputs?: string[];
  config: Record<string, {
    type: string;
    default?: any;
    description?: string;
  }>;
}

export interface NodeTypesResponse {
  types: string[];
  definitions: NodeTypeDefinition[];
}
