export type ClientCategory =
  | "Prospect"
  | "Active"
  | "VIP"
  | "Inactive"
  | "Potencial"
  | "General";

export interface Client {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
    companyName?: string;
    logoUrl?: string;
    active: boolean;
    category: ClientCategory;
    industry?: string;
    taxId?: string;
    employees?: number;
    website?: string;
    owner: string;
    createdAt: string;
    updatedAt: string;
}

export type TaskStatus = 'pending'|'in progress'|'completed';
export type TaskPriority = 'low'|'medium'|'high';
export type TaskCategory = 'Llamada'|'Reunion'|'Email'|'Reforma'|'Mantenimiento'|'Otro';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  budget: number;
  cost?: number; // 👈 NUEVO
  client?: string | Client;
  dueDate?: string;
  dueTime?: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export type FinanceType = 'ingreso'|'gasto';
export type FinanceStatus = 'estimado'|'completado';

export interface Finance {
    _id: string;
    type: FinanceType;
    amount: number;
    description: string;
    status: FinanceStatus;
    date: string;
    category?: string;
    owner: string;
    createdAt: string;
    updatedAt: string;
}

export type AiTone = 'motivational'|'analitycal'|'strategic';

export interface UserPreferences {
  aiTone: 'motivational' | 'analytical' | 'strategic'; // 👈 CORREGIDO: analytical (antes ponía analitycal)
  monthlyGoal: number;
  themeColor: string;
  role: 'worker' | 'freelancer' | 'company' | 'god_mode'; // 👈 AÑADIDO: Para evitar errores any
}

export interface User {
    _id: string;
    email: string;
    name: string;
    preferences: UserPreferences;
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}