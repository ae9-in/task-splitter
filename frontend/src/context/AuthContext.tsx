import { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import { verifySession } from '../api/auth';
import type { AuthState } from '../types';

interface AuthContextValue extends AuthState {
  setAuthenticated: (value: boolean) => void;
}

type AuthAction =
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload, isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // On mount, verify if existing session cookie is valid
    verifySession().then((isAuth) => {
      dispatch({ type: 'SET_AUTHENTICATED', payload: isAuth });
    });
  }, []);

  const setAuthenticated = (value: boolean) => {
    dispatch({ type: 'SET_AUTHENTICATED', payload: value });
  };

  return (
    <AuthContext.Provider value={{ ...state, setAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export default AuthContext;
