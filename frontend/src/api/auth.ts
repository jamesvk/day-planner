import { apiFetch } from './client';
import type { RegisteredUser, LoginResponse } from '../types';

export function registerUser(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
): Promise<RegisteredUser> {
  return apiFetch<RegisteredUser>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ firstName, lastName, email, password }),
  });
}

export function loginUser(email: string, password: string) {
  return apiFetch<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}
