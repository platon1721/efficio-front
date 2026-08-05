import api from './client';
import type { TenantMember } from '../types/api';

export const membersApi = {
    getByTenant: async (tenantId: string): Promise<TenantMember[]> => {
        const { data } = await api.get<TenantMember[]>(`/tenants/${tenantId}/members`);
        return data;
    },
};