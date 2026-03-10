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
  cost?: number; 
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
    client?: string | Client; // ⚡ NUEVO: Ahora las finanzas se vinculan a clientes
    owner: string;
    createdAt: string;
    updatedAt: string;
}

export type AiTone = 'motivational'|'analitycal'|'strategic';

export interface UserPreferences {
  aiTone: 'motivational' | 'analytical' | 'strategic'; 
  monthlyGoal: number;
  themeColor: string;
  role: 'worker' | 'freelancer' | 'company' | 'god_mode'; 
  companyName?: string;
  taxId?: string;
  address?: string;
  currency?: '€' | '$' | '£';
  city?: string;
  zipCode?: string;
  country?: string;
  phone: string;
  iban?: string;
}

export interface User {
    _id: string;
    email: string;
    name: string;
    preferences: UserPreferences;
    createdAt: string;
    updatedAt: string;
    isTwoFactorEnabled?: boolean;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface DashboardKpis {
  netProfit: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  moneyAtStake: number;
  activeClients: number;
  totalClients: number;
  pendingTasks: number;
  completedTasks: number;
}

export interface ChartDataPoint {
  name: string;
  month: number;
  year: number;
  ingresos: number;
  gastos: number;
  nuevosClientes: number;
}

export interface DashboardData {
  kpis: DashboardKpis;
  chartData: ChartDataPoint[];
}