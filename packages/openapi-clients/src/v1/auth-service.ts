export type AuthServiceOperationId =
  | "authHealth"
  | "registerUser"
  | "loginUser"
  | "refreshToken"
  | "getCurrentUser";

export type AuthServiceOperation = {
  id: string;
  method: string;
  path: string;
  summary: string;
};

export const AuthServiceOperations: AuthServiceOperation[] = [
  { id: "authHealth", method: "GET", path: "/actuator/health", summary: "Health check" },
  { id: "registerUser", method: "POST", path: "/auth/register", summary: "Register a user" },
  { id: "loginUser", method: "POST", path: "/auth/login", summary: "Login with email/password" },
  { id: "refreshToken", method: "POST", path: "/auth/refresh-token", summary: "Refresh access token" },
  { id: "getCurrentUser", method: "GET", path: "/auth/me", summary: "Get current authenticated user" },
];

