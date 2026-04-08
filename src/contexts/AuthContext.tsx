import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Auth, type StoredUser } from "@/lib/store";

interface AuthContextType {
  user: StoredUser | null;
  setAuth: (user: StoredUser | null) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const fallbackAuthContext: AuthContextType = {
  user: null,
  setAuth: () => {
    // no-op fallback when provider is not available yet
  },
  logout: async () => {
    // no-op fallback when provider is not available yet
  },
  isAuthenticated: false,
  isLoading: true,
};

const AuthContext = createContext<AuthContextType>(fallbackAuthContext);

let hasWarnedMissingProvider = false;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = Auth.onSessionChange((nextUser: StoredUser | null) => {
      setUser(nextUser);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  function setAuth(newUser: StoredUser | null) {
    setUser(newUser);
  }

  async function logout() {
    await Auth.clearSession();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, setAuth, logout, isAuthenticated: !!user, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === fallbackAuthContext && !hasWarnedMissingProvider) {
    hasWarnedMissingProvider = true;
    console.warn(
      "useAuth se está usando fuera de AuthProvider; aplicando fallback temporal",
    );
  }
  return ctx;
}
