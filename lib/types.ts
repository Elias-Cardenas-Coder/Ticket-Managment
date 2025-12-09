// User Types
export type UserRole = 'ADMIN' | 'USER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithoutPassword extends User {
  password?: never;
}

// Request/Solicitude Types
export type RequestStatus = 'OPEN' | 'CLOSED';
export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Request {
  id: string;
  title: string;
  description: string;
  status: RequestStatus;
  createdById: string;
  createdBy?: UserWithoutPassword;
  applications?: Application[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Application {
  id: string;
  userId: string;
  requestId: string;
  status: ApplicationStatus;
  user?: UserWithoutPassword;
  request?: Request;
  createdAt: Date;
  updatedAt: Date;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
}

export interface AuthResponse {
  user: UserWithoutPassword;
  token?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
