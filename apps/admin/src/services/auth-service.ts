import { mockDb, withLatency } from './mock-db'
import type { SessionUser } from './types'

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: SessionUser
}

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    return withLatency(() => {
      const user = mockDb.users.find(
        (candidate) =>
          candidate.email.toLowerCase() === payload.email.toLowerCase() &&
          candidate.password === payload.password,
      )

      if (!user) {
        throw new Error('Invalid credentials. Please check email and password.')
      }

      const { password: _password, ...sessionUser } = user
      return {
        token: `mock-token-${sessionUser.id}`,
        user: sessionUser,
      }
    }, 600)
  },

  async logout() {
    return withLatency(() => true, 200)
  },
}
