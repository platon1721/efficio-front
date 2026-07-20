import api from './client';
import type {
    Tenant,
    CreateTenantRequest,
    UpdateTenantRequest,
    UserTenantMembership,
} from '../types/api';

export const tenantsApi = {
    getAll: async (): Promise<Tenant[]> => {
        const response = await api.get<Tenant[]>('/Tenants');
        return response.data;
    },

    getById: async (id: string): Promise<Tenant> => {
        const response = await api.get<Tenant>(`/Tenants/${id}`);
        return response.data;
    },

    getByCode: async (code: string): Promise<Tenant> => {
        const response = await api.get<Tenant>(`/Tenants/by-code/${code}`);
        return response.data;
    },

    create: async (data: CreateTenantRequest): Promise<Tenant> => {
        const response = await api.post<Tenant>('/Tenants', data);
        return response.data;
    },

    update: async (id: string, data: UpdateTenantRequest): Promise<Tenant> => {
        const response = await api.put<Tenant>(`/Tenants/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/Tenants/${id}`);
    },
};

export const myApi = {
    getMemberships: async (): Promise<UserTenantMembership[]> => {
        const response = await api.get<UserTenantMembership[]>('/my/memberships');
        return response.data;
    },
};