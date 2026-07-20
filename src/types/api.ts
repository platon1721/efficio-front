// ==================== Auth ====================

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
}

export interface JwtResponse {
    token: string;
    refreshToken: string;
    expiresAt: string;
}

export interface RefreshTokenRequest {
    token: string;
    refreshToken: string;
}

export interface LogoutRequest {
    refreshToken: string;
}

export interface UserInfo {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    isPlatformAdmin: boolean;
}

// ==================== Tenants ====================

export interface Tenant {
    id: string;
    name: string;
    code: string;
    defaultTimeZone: string;
    defaultLocale: string;
    rootDepartmentId: string;
    status: string;
}

export interface CreateTenantRequest {
    name: string;
    code: string;
    defaultTimeZone?: string;
    defaultLocale?: string;
}

export interface UpdateTenantRequest {
    name: string;
    defaultTimeZone?: string;
    defaultLocale?: string;
}

export interface TenantModule {
    id: string;
    tenantRootDepartmentId: string;
    moduleId: string;
    moduleName?: string;
    moduleCode?: string;
    expiresAt?: string;
}

export interface UserTenantMembership {
    id: string;
    tenantRootDepartmentId: string;
    userId: string;
    status: string;
}

// ==================== Errors ====================

export interface ApiError {
    type: string;
    title: string;
    status: number;
    detail?: string;
    errors?: Record<string, string[]>;
}