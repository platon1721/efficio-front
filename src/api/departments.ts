import api from './client';
import type {
    Department,
    CreateDepartmentRequest,
    UpdateDepartmentRequest,
    DepartmentType,
    CreateDepartmentTypeRequest,
    DepartmentLink,
    CreateDepartmentLinkRequest,
} from '../types/api';

export const departmentsApi = {
    getAll: async (tenantId: string): Promise<Department[]> => {
        const { data } = await api.get<Department[]>(`/tenants/${tenantId}/departments`);
        return data;
    },

    getById: async (tenantId: string, id: string): Promise<Department> => {
        const { data } = await api.get<Department>(`/tenants/${tenantId}/departments/${id}`);
        return data;
    },

    getRoots: async (tenantId: string): Promise<Department[]> => {
        const { data } = await api.get<Department[]>(`/tenants/${tenantId}/departments/roots`);
        return data;
    },

    create: async (tenantId: string, request: CreateDepartmentRequest): Promise<Department> => {
        const { data } = await api.post<Department>(`/tenants/${tenantId}/departments`, request);
        return data;
    },

    update: async (tenantId: string, id: string, request: UpdateDepartmentRequest): Promise<Department> => {
        const { data } = await api.put<Department>(`/tenants/${tenantId}/departments/${id}`, request);
        return data;
    },

    delete: async (tenantId: string, id: string): Promise<void> => {
        await api.delete(`/tenants/${tenantId}/departments/${id}`);
    },
};

export const departmentTypesApi = {
    getAll: async (tenantId: string): Promise<DepartmentType[]> => {
        const { data } = await api.get<DepartmentType[]>(`/tenants/${tenantId}/department-types`);
        return data;
    },

    create: async (tenantId: string, request: CreateDepartmentTypeRequest): Promise<DepartmentType> => {
        const { data } = await api.post<DepartmentType>(`/tenants/${tenantId}/department-types`, request);
        return data;
    },

    delete: async (tenantId: string, id: string): Promise<void> => {
        await api.delete(`/tenants/${tenantId}/department-types/${id}`);
    },
};

export const departmentLinksApi = {
    getAll: async (tenantId: string): Promise<DepartmentLink[]> => {
        const { data } = await api.get<DepartmentLink[]>(`/tenants/${tenantId}/department-links`);
        return data;
    },

    getChildren: async (tenantId: string, parentId: string): Promise<DepartmentLink[]> => {
        const { data } = await api.get<DepartmentLink[]>(`/tenants/${tenantId}/department-links/children/${parentId}`);
        return data;
    },

    create: async (tenantId: string, request: CreateDepartmentLinkRequest): Promise<DepartmentLink> => {
        const { data } = await api.post<DepartmentLink>(`/tenants/${tenantId}/department-links`, request);
        return data;
    },

    delete: async (tenantId: string, id: string): Promise<void> => {
        await api.delete(`/tenants/${tenantId}/department-links/${id}`);
    },
};