export type UserServiceOperationId =
  | "userHealth"
  | "listUsers"
  | "createUserProfile"
  | "getUserById"
  | "updateUserProfile"
  | "deleteUserProfile";

export type UserServiceOperation = {
  id: string;
  method: string;
  path: string;
  summary: string;
};

export const UserServiceOperations: UserServiceOperation[] = [
  { id: "userHealth", method: "GET", path: "/actuator/health", summary: "Health check" },
  { id: "listUsers", method: "GET", path: "/users", summary: "List users" },
  { id: "createUserProfile", method: "POST", path: "/users", summary: "Create user profile" },
  { id: "getUserById", method: "GET", path: "/users/{userId}", summary: "Get user by id" },
  { id: "updateUserProfile", method: "PUT", path: "/users/{userId}", summary: "Update user" },
  { id: "deleteUserProfile", method: "DELETE", path: "/users/{userId}", summary: "Delete user" },
];

