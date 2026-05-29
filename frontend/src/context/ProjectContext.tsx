import { createContext, useContext, useReducer } from 'react';
import type { ReactNode, Dispatch } from 'react';
import type { Project, Module, Feature, Task } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface ProjectState {
  project: Project | null;
  isDirty: boolean;
}

type ProjectAction =
  | { type: 'SET_PROJECT'; payload: Project }
  | { type: 'CLEAR_PROJECT' }
  | { type: 'SET_MODULES'; payload: Module[] }
  | { type: 'UPDATE_MODULE'; payload: { moduleId: string; updates: Partial<Module> } }
  | { type: 'DELETE_MODULE'; payload: { moduleId: string } }
  | { type: 'ADD_MODULE'; payload: { name: string; description: string } }
  | { type: 'ADD_FEATURE'; payload: { moduleId: string; name: string; description: string } }
  | { type: 'UPDATE_FEATURE'; payload: { moduleId: string; featureId: string; updates: Partial<Feature> } }
  | { type: 'DELETE_FEATURE'; payload: { moduleId: string; featureId: string } }
  | { type: 'ADD_TASK'; payload: { moduleId: string; featureId: string; title: string; description: string } }
  | { type: 'UPDATE_TASK'; payload: { moduleId: string; featureId: string; taskId: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: { moduleId: string; featureId: string; taskId: string } }
  | { type: 'SET_DIRTY'; payload: boolean }
  | { type: 'UPDATE_PROJECT_META'; payload: { title?: string; description?: string } };

const initialState: ProjectState = {
  project: null,
  isDirty: false,
};

function projectReducer(state: ProjectState, action: ProjectAction): ProjectState {
  if (!state.project && action.type !== 'SET_PROJECT' && action.type !== 'CLEAR_PROJECT') {
    return state;
  }

  switch (action.type) {
    case 'SET_PROJECT':
      return { project: action.payload, isDirty: false };

    case 'CLEAR_PROJECT':
      return { project: null, isDirty: false };

    case 'SET_DIRTY':
      return { ...state, isDirty: action.payload };

    case 'UPDATE_PROJECT_META': {
      const proj = state.project!;
      return {
        project: { ...proj, ...action.payload },
        isDirty: true,
      };
    }

    case 'SET_MODULES':
      return {
        project: { ...state.project!, modules: action.payload },
        isDirty: true,
      };

    case 'UPDATE_MODULE': {
      const modules = state.project!.modules.map((m) =>
        m.id === action.payload.moduleId ? { ...m, ...action.payload.updates } : m
      );
      return { project: { ...state.project!, modules }, isDirty: true };
    }

    case 'DELETE_MODULE': {
      const modules = state.project!.modules.filter((m) => m.id !== action.payload.moduleId);
      return { project: { ...state.project!, modules }, isDirty: true };
    }

    case 'ADD_MODULE': {
      const newModule: Module = {
        id: uuidv4(),
        name: action.payload.name,
        description: action.payload.description,
        order: state.project!.modules.length,
        features: [],
      };
      return {
        project: { ...state.project!, modules: [...state.project!.modules, newModule] },
        isDirty: true,
      };
    }

    case 'ADD_FEATURE': {
      const modules = state.project!.modules.map((m) => {
        if (m.id !== action.payload.moduleId) return m;
        const newFeature: Feature = {
          id: uuidv4(),
          name: action.payload.name,
          description: action.payload.description,
          order: m.features.length,
          tasks: [],
        };
        return { ...m, features: [...m.features, newFeature] };
      });
      return { project: { ...state.project!, modules }, isDirty: true };
    }

    case 'UPDATE_FEATURE': {
      const modules = state.project!.modules.map((m) => {
        if (m.id !== action.payload.moduleId) return m;
        const features = m.features.map((f) =>
          f.id === action.payload.featureId ? { ...f, ...action.payload.updates } : f
        );
        return { ...m, features };
      });
      return { project: { ...state.project!, modules }, isDirty: true };
    }

    case 'DELETE_FEATURE': {
      const modules = state.project!.modules.map((m) => {
        if (m.id !== action.payload.moduleId) return m;
        return { ...m, features: m.features.filter((f) => f.id !== action.payload.featureId) };
      });
      return { project: { ...state.project!, modules }, isDirty: true };
    }

    case 'ADD_TASK': {
      const modules = state.project!.modules.map((m) => {
        if (m.id !== action.payload.moduleId) return m;
        const features = m.features.map((f) => {
          if (f.id !== action.payload.featureId) return f;
          const newTask: Task = {
            id: uuidv4(),
            title: action.payload.title,
            description: action.payload.description,
            priority: 'medium',
            type: 'backend',
            order: f.tasks.length,
          };
          return { ...f, tasks: [...f.tasks, newTask] };
        });
        return { ...m, features };
      });
      return { project: { ...state.project!, modules }, isDirty: true };
    }

    case 'UPDATE_TASK': {
      const modules = state.project!.modules.map((m) => {
        if (m.id !== action.payload.moduleId) return m;
        const features = m.features.map((f) => {
          if (f.id !== action.payload.featureId) return f;
          const tasks = f.tasks.map((t) =>
            t.id === action.payload.taskId ? { ...t, ...action.payload.updates } : t
          );
          return { ...f, tasks };
        });
        return { ...m, features };
      });
      return { project: { ...state.project!, modules }, isDirty: true };
    }

    case 'DELETE_TASK': {
      const modules = state.project!.modules.map((m) => {
        if (m.id !== action.payload.moduleId) return m;
        const features = m.features.map((f) => {
          if (f.id !== action.payload.featureId) return f;
          return { ...f, tasks: f.tasks.filter((t) => t.id !== action.payload.taskId) };
        });
        return { ...m, features };
      });
      return { project: { ...state.project!, modules }, isDirty: true };
    }

    default:
      return state;
  }
}

interface ProjectContextValue extends ProjectState {
  dispatch: Dispatch<ProjectAction>;
}

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(projectReducer, initialState);
  return (
    <ProjectContext.Provider value={{ ...state, dispatch }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjectContext(): ProjectContextValue {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProjectContext must be used within ProjectProvider');
  return ctx;
}

export default ProjectContext;
