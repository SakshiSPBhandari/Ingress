import type { ApiToken, AuthResponse, CreatedToken, LoginRequest, PendingSignup, RegisterRequest, TokenKind, User } from "@/types/api";
import { apiClient } from "./client";

export const authApi = {
  options: () => apiClient.get<{ google: boolean }>("/auth/options"),
  // The server emails a code first; the mock backend signs in straight away.
  register: (body: RegisterRequest) => apiClient.post<AuthResponse | PendingSignup>("/auth/register", body),
  verify: (email: string, code: string) => apiClient.post<AuthResponse>("/auth/verify", { email, code }),
  resend: (email: string) => apiClient.post<{ sent: boolean }>("/auth/resend", { email }),
  forgot: (email: string) => apiClient.post<{ sent: boolean }>("/auth/forgot", { email }),
  reset: (email: string, code: string, password: string) => apiClient.post<AuthResponse>("/auth/reset", { email, code, password }),
  login: (body: LoginRequest) => apiClient.post<AuthResponse>("/auth/login", body),
  logout: () => apiClient.post<void>("/auth/logout"),
  me: () => apiClient.get<User>("/me"),
};

export const tokensApi = {
  list: () => apiClient.get<ApiToken[]>("/tokens"),
  create: (kind: TokenKind, name: string) => apiClient.post<CreatedToken>("/tokens", { kind, name }),
  revoke: (id: string) => apiClient.delete(`/tokens/${id}`),
};
