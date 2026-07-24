import api from './client';
import type {
    Module,
    CreateModuleRequest,
    Permission,
    CreatePermissionRequest,
    Role,
    RoleWithPermissions,
    CreateRoleRequest,
    UpdateRoleRequest,
} from '../types/api';

export const modulesApi = {
    getAll: async (): Promise<Module[]> => {
        const { data } = await api.get<Module[]>('/modules');
        return data;
    },

    getByCode: async (code: string): Promise<Module> => {
        const { data } = await api.get<Module>(`/modules/by-code/${code}`);
        return data;
    },

    create: async (request: CreateModuleRequest): Promise<Module> => {
        const { data } = await api.post<Module>('/modules', request);
        return data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/modules/${id}`);
    },
};

export const permissionsApi = {
    getAll: async (): Promise<Permission[]> => {
        const { data } = await api.get<Permission[]>('/permissions');
        return data;
    },

    getActive: async (): Promise<Permission[]> => {
        const { data } = await api.get<Permission[]>('/permissions/active');
        return data;
    },

    getByModule: async (moduleId: string): Promise<Permission[]> => {
        const { data } = await api.get<Permission[]>(`/permissions/by-module/${moduleId}`);
        return data;
    },

    create: async (request: CreatePermissionRequest): Promise<Permission> => {
        const { data } = await api.post<Permission>('/permissions', request);
        return data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/permissions/${id}`);
    },
};

export const rolesApi = {
    getByDepartment: async (tenantId: string, departmentId: string): Promise<Role[]> => {
        const { data } = await api.get<Role[]>(`/tenants/${tenantId}/departments/${departmentId}/roles`);
        return data;
    },

    getById: async (tenantId: string, departmentId: string, id: string): Promise<RoleWithPermissions> => {
        const { data } = await api.get<RoleWithPermissions>(`/tenants/${tenantId}/departments/${departmentId}/roles/${id}`);
        return data;
    },

    create: async (tenantId: string, departmentId: string, request: CreateRoleRequest): Promise<Role> => {
        const { data } = await api.post<Role>(`/tenants/${tenantId}/departments/${departmentId}/roles`, request);
        return data;
    },

    update: async (tenantId: string, departmentId: string, id: string, request: UpdateRoleRequest): Promise<Role> => {
        const { data } = await api.put<Role>(`/tenants/${tenantId}/departments/${departmentId}/roles/${id}`, request);
        return data;
    },

    delete: async (tenantId: string, departmentId: string, id: string): Promise<void> => {
        await api.delete(`/tenants/${tenantId}/departments/${departmentId}/roles/${id}`);
    },

    assignPermission: async (tenantId: string, departmentId: string, roleId: string, permissionId: string): Promise<RoleWithPermissions> => {
        const { data } = await api.post<RoleWithPermissions>(
            `/tenants/${tenantId}/departments/${departmentId}/roles/${roleId}/permissions`,
            { permissionId }
        );
        return data;
    },

    removePermission: async (tenantId: string, departmentId: string, roleId: string, permissionId: string): Promise<void> => {
        await api.delete(`/tenants/${tenantId}/departments/${departmentId}/roles/${roleId}/permissions/${permissionId}`);
    },
};