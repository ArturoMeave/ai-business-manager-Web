import {api} from './api';
import type { AuthResponse, User } from '../types';

export interface LoginCredentials {
    email: string;
    password: string;
}
export interface RegisterData {
    email: string;
    password: string;
    name: string;
}
export const authService = {
    async login(credentials: LoginCredentials): Promise<AuthResponse>{
        const response = await api.post<AuthResponse>('/auth/login', credentials);
        return response.data;
    },
    
    async register(data: RegisterData): Promise<AuthResponse>{
        const response = await api.post<AuthResponse>('/auth/register', data);
        return response.data;
    },
    async getCurrentUser(): Promise<User>{
        const response = await api.get<User>('/auth/me');
        return response.data;
    },
    async updatePreferences(preferences: Partial<User['preferences']>): Promise<User> {
        const response = await api.put<User>('/auth/preferences', preferences);
        return response.data;
    },
    async updateDetails(data: { name: string; email: string }) {
        const response = await api.put('/auth/updatedetails', data);
        return response.data;
    },
    async updatePassword(data: { currentPassword: string; newPassword: string }) {
        const response = await api.put('/auth/updatepassword', data);
        return response.data;
    },
    async deleteAccount() {
        const response = await api.delete('/auth/delete-account');
        return response.data;
    },

    logout(){
        localStorage.removeItem('auth_token');
    },
};