# Car Dealership Chatbot - Frontend

Interfaz visual para chatbot de concesionario con constructor de flujos drag-and-drop.

## 🚀 Tecnologías

| Categoría | Tecnología | Versión |
|-----------|------------|---------|
| Framework | Next.js | 16.x |
| UI Library | React | 19.x |
| Componentes | Material UI | 7.x |
| Flow Builder | React Flow (@xyflow/react) | 12.x |
| Estado | Zustand | 5.x |
| HTTP Client | Axios | 1.x |
| Estilos | SCSS + Emotion | - |

## 🏗️ Arquitectura

### Decisiones de Diseño

**¿Por qué Next.js con React?**
- Proyecto relativamente pequeño donde Next.js acelera el desarrollo
- Server-side rendering disponible si se necesita SEO
- Middleware integrado para proxy API (resuelve CORS)
- Ecosistema de librerías más amplio que Angular
- Para proyectos más grandes y modulares, Angular sería preferible

**¿Por qué Zustand?**
- API simple y directa sin boilerplate
- Mejor DX que Redux para proyectos medianos
- Integración natural con React hooks

**¿Por qué Material UI?**
- Componentes listos para producción
- Tema personalizable
- Consistencia visual

### Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── layout.tsx         # Layout raíz
│   ├── page.tsx           # Landing page
│   └── (main)/            # Grupo de rutas principales
│       ├── layout.tsx     # Layout con sidebar
│       ├── builder/       # Constructor de flujos
│       └── chat/          # Interfaz de chat
├── components/            # Componentes React
│   ├── builder/          # Componentes del Flow Builder
│   │   ├── FlowCanvas.tsx
│   │   ├── FlowToolbar.tsx
│   │   ├── NodePalette.tsx
│   │   ├── NodeConfigPanel.tsx
│   │   └── CustomNode.tsx
│   ├── chat/             # Componentes del Chat
│   │   ├── ChatContainer.tsx
│   │   ├── ChatMessage.tsx
│   │   └── ChatInput.tsx
│   └── common/           # Componentes compartidos
│       └── Sidebar.tsx
├── store/                # Estado global (Zustand)
│   ├── flowStore.ts      # Estado de flujos
│   └── chatStore.ts      # Estado de chat
├── services/             # Servicios API
│   ├── api.ts            # Instancia Axios
│   ├── flowService.ts    # Operaciones de flujos
│   └── chatService.ts    # Operaciones de chat
├── types/                # Tipos TypeScript
│   ├── flow.types.ts
│   └── chat.types.ts
├── theme/                # Configuración MUI
│   ├── theme.ts
│   └── colors.ts
├── styles/               # Estilos globales SCSS
│   ├── globals.scss
│   ├── _variables.scss
│   └── _mixins.scss
├── providers/            # Context providers
│   └── ThemeProvider.tsx
└── middleware.ts         # Proxy API para CORS
```

## 🎨 Funcionalidades

### 1. Flow Builder (Constructor de Flujos)

Editor visual drag-and-drop para crear flujos de chatbot:

```
┌─────────────────────────────────────────────────────────┐
│ [Toolbar: Nuevo | Guardar | Activar]                   │
├────────────┬────────────────────────────┬───────────────┤
│            │                            │               │
│  Palette   │     Canvas (React Flow)    │  Config Panel │
│            │                            │               │
│ ┌────────┐ │   ┌────┐    ┌────┐        │ ┌───────────┐ │
│ │Orch... │ │   │Node│───→│Node│        │ │ Node Name │ │
│ ├────────┤ │   └────┘    └────┘        │ ├───────────┤ │
│ │FAQ     │ │       ↓                   │ │ Config... │ │
│ ├────────┤ │   ┌────┐                  │ │           │ │
│ │Autos   │ │   │Node│                  │ └───────────┘ │
│ └────────┘ │   └────┘                  │               │
└────────────┴────────────────────────────┴───────────────┘
```

**Características:**
- Drag & drop de nodos desde paleta
- Conexión visual de nodos
- Configuración de nodos individual
- Previsualización en tiempo real
- Múltiples flujos guardables
- Activación de flujo con un click

### 2. Chat Interface

Interfaz de conversación con el chatbot:

```
┌─────────────────────────────────────┐
│         Car Dealership Bot          │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🤖 ¡Hola! Soy tu asistente │   │
│  └─────────────────────────────┘   │
│                                     │
│         ┌─────────────────────────┐ │
│         │ Busco un SUV usado     │ │
│         └─────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🤖 Tenemos varios SUVs...  │   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│ [_______________] [Enviar]          │
└─────────────────────────────────────┘
```

**Características:**
- Conversaciones persistentes
- Lista de conversaciones recientes
- Indicador de typing
- Formato de mensajes

### 3. Sidebar de Navegación

- Navegación entre Builder y Chat
- Enlaces a repositorios GitHub
- Tema oscuro/claro (preparado)

## 🔧 Tipos de Nodos Soportados

| Nodo | Descripción | Configurable |
|------|-------------|--------------|
| Orchestrator | Clasifica intención | Tipo LLM |
| FAQ Specialist | Responde preguntas | topK |
| Autos Specialist | Búsqueda vehículos | Filtros |
| Dates Specialist | Gestión citas | Horarios |
| Validator | Valida campos | Reglas |
| Memory Load | Carga contexto | maxTurns |
| Response Compose | Respuesta final | Template |
| Generic Response | Respuestas default | - |

## 🌐 Proxy Middleware (CORS)

El middleware en `middleware.ts` resuelve problemas de CORS en producción:

```typescript
// /api/* → BACKEND_API_URL/api/*
request('/api/flows') → proxy → 'http://backend:3001/api/flows'
```

## 🛠️ Instalación

### Requisitos
- Node.js 20+
- Backend corriendo en puerto 3001

### Variables de Entorno

```bash
# .env.local (desarrollo)
NEXT_PUBLIC_API_URL=http://localhost:3001/api
BACKEND_API_URL=http://localhost:3001

# Producción
BACKEND_API_URL=https://tu-backend.com
```

### Comandos

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build producción
npm run build

# Iniciar producción
npm start
```

## 🐳 Docker

```dockerfile
# Build
docker build -t car-dealership-front .

# Run
docker run -p 3000:3000 \
  -e BACKEND_API_URL=http://api:3001 \
  car-dealership-front
```

## 📁 Stores (Estado Global)

### flowStore.ts
```typescript
{
  flows: Flow[]         // Lista de flujos
  activeFlow: Flow      // Flujo activo actual
  selectedFlow: Flow    // Flujo seleccionado en editor
  nodes: Node[]         // Nodos en canvas
  edges: Edge[]         // Conexiones en canvas
  nodeTypes: []         // Tipos disponibles
  
  // Actions
  loadFlows()
  createFlow()
  updateFlow()
  activateFlow()
  addNode()
  selectNode()
}
```

### chatStore.ts
```typescript
{
  conversations: []     // Lista de conversaciones
  currentConversation   // Conversación activa
  messages: []          // Mensajes actuales
  isLoading: boolean    // Estado de carga
  
  // Actions
  loadConversations()
  sendMessage()
  selectConversation()
}
```

## 🎯 Patrones Implementados

- **Feature-based structure**: Componentes agrupados por funcionalidad
- **Container/Presentational**: Separación de lógica y UI
- **Custom Hooks**: Lógica reutilizable encapsulada
- **Absolute imports**: Paths limpios con @/
- **Type-safe stores**: Zustand con TypeScript estricto

## 🔐 Buenas Prácticas

- **TypeScript estricto**: Tipos en todos los componentes
- **Componentes modulares**: Archivos pequeños y enfocados
- **SCSS Modules**: Estilos encapsulados
- **Servicios centralizados**: API en un solo lugar
- **Estado predecible**: Zustand con acciones claras
- **Proxy para CORS**: Middleware de Next.js

## 📄 Licencia

MIT
