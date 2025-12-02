import { useEffect, useReducer, ReactNode } from "react";
import { AuthProvider as AuthContext, AuthContextType } from "./context";

import { getMetaConfig, getUser, mbLogin } from "@/helpers/mb-api_helper";
import { setAuthorization } from "@/helpers/api_helper";

// ----------------------------------------------------------------------

interface AuthAction {
  type:
    | "INITIALIZE"
    | "LOGIN_REQUEST"
    | "LOGIN_SUCCESS"
    | "LOGIN_ERROR"
    | "LOGOUT";
  payload?: Partial<AuthContextType>;
}

// Initial state
const initialState: AuthContextType = {
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  errorMessage: null,
  user: null,
  login: async () => {},
  logout: async () => {},
};

// Reducer handlers
const reducerHandlers: Record<
  AuthAction["type"],
  (state: AuthContextType, action: AuthAction) => AuthContextType
> = {
  INITIALIZE: (state, action) => ({
    ...state,
    isAuthenticated: action.payload?.isAuthenticated ?? false,
    isInitialized: true,
    user: action.payload?.user ?? null,
  }),

  LOGIN_REQUEST: (state) => ({
    ...state,
    isLoading: true,
  }),

  LOGIN_SUCCESS: (state, action) => ({
    ...state,
    isAuthenticated: true,
    isLoading: false,
    user: action.payload?.user ?? null,
  }),

  LOGIN_ERROR: (state, action) => ({
    ...state,
    errorMessage: action.payload?.errorMessage ?? "An error occurred",
    isLoading: false,
  }),

  LOGOUT: (state) => ({
    ...state,
    isAuthenticated: false,
    user: null,
  }),
};

// Reducer function
const reducer = (
  state: AuthContextType,
  action: AuthAction,
): AuthContextType => {
  const handler = reducerHandlers[action.type];
  return handler ? handler(state, action) : state;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const init = async () => {
      try {
        const authToken = window.localStorage.getItem("authToken");

        if (authToken) {
          setAuthorization(authToken);

          const userRes = await getUser();
          const metaRes = await getMetaConfig();

          console.log("User profile response:", userRes);

          const user = {
            ...userRes?.details,
            meta: metaRes,
          };

          localStorage.setItem("authUser", JSON.stringify(user));

          dispatch({
            type: "INITIALIZE",
            payload: {
              isAuthenticated: true,
              user,
            },
          });
        } else {
          dispatch({
            type: "INITIALIZE",
            payload: {
              isAuthenticated: false,
              user: null,
            },
          });
        }
      } catch (err) {
        console.error(err);
        dispatch({
          type: "INITIALIZE",
          payload: {
            isAuthenticated: false,
            user: null,
          },
        });
      }
    };

    init();
  }, []);

  const login = async (credentials: { account: string; username: string; password: string }) => {
    dispatch({ type: "LOGIN_REQUEST" });
  
    try {
      const loginRes = await mbLogin({
        account: credentials.account,
        name: credentials.username,
        password: credentials.password,
      });
  
      console.log("Login response:", loginRes);
  
      const authToken = loginRes?.token;
      if (!authToken) throw new Error("Token missing in login response");

      setAuthorization(authToken);

      const userRes = await getUser();
      const metaRes = await getMetaConfig();

      const user = {
        ...userRes.data.details,
        meta: metaRes,
      };

    
      localStorage.setItem("authUser", JSON.stringify(user));
  
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user },
      });

      //  Redirect immediately
       window.location.href = "/dashboards";
    } catch (err: any) {
      dispatch({
        type: "LOGIN_ERROR",
        payload: {
          errorMessage: err?.message || "Login failed",
        },
      });
    }
  };
  
  

  const logout = async () => {
    localStorage.removeItem("authUser");
    localStorage.removeItem("authToken");
    dispatch({ type: "LOGOUT" });
  };

  if (!children) {
    return null;
  }

  return (
    <AuthContext
      value={{
        ...state,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext>
  );
}
