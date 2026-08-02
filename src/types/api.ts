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
    isGodAdmin: boolean;
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

// ==================== Departments ====================

export interface Department {
    id: string;
    tenantRootDepartmentId: string;
    name: string;
    description?: string;
    departmentTypeId: string;
    departmentTypeName?: string;
}

export interface CreateDepartmentRequest {
    name: string;
    description?: string;
    departmentTypeId: string;
    parentDepartmentId: string;
}

export interface UpdateDepartmentRequest {
    name: string;
    description?: string;
    departmentTypeId?: string;
}

export interface DepartmentType {
    id: string;
    tenantRootDepartmentId: string;
    name: string;
    description?: string;
}

export interface CreateDepartmentTypeRequest {
    name: string;
    description?: string;
}

export interface DepartmentLink {
    id: string;
    tenantRootDepartmentId: string;
    parentDepartmentId: string;
    childDepartmentId: string;
    parentDepartmentName?: string;
    childDepartmentName?: string;
}

export interface CreateDepartmentLinkRequest {
    parentDepartmentId: string;
    childDepartmentId: string;
}

// ==================== Security ====================

export interface Module {
    id: string;
    code: string;
    name: string;
    description?: string;
    isMain: boolean;
    isActive: boolean;
}

export interface CreateModuleRequest {
    code: string;
    name: string;
    description?: string;
    isMain: boolean;
    isActive: boolean;
}

export interface Permission {
    id: string;
    moduleId: string;
    moduleName?: string;
    key: string;
    name?: string;
    isActive: boolean;
}

export interface CreatePermissionRequest {
    moduleId: string;
    key: string;
    name?: string;
    isActive: boolean;
}

export interface Role {
    id: string;
    tenantRootDepartmentId: string;
    departmentId: string;
    name: string;
    description?: string;
    departmentName?: string;
}

export interface RoleWithPermissions extends Role {
    permissions: Permission[];
}

export interface CreateRoleRequest {
    departmentId: string;
    name: string;
    description?: string;
}

export interface UpdateRoleRequest {
    name: string;
    description?: string;
}

// ==================== Errors ====================

export interface ApiError {
    type: string;
    title: string;
    status: number;
    detail?: string;
    errors?: Record<string, string[]>;
}

// ==================== My Context ====================
// Add these to src/types/api.ts

export interface MyUser {
    id: string;
    email: string;
    isPlatformAdmin: boolean;
    isGodAdmin: boolean;
}

export interface MyWorkDepartment {
    departmentId: string;
    name: string;
    departmentTypeName?: string;
    roleName: string;
}

export interface MyManagedSubtree {
    rootDepartmentId: string;
    rootDepartmentName: string;
    canManageAll: boolean;
}

export interface MyTenant {
    tenantId: string;
    name: string;
    code: string;
    rootDepartmentId: string;
    modules: string[];
    workDepartments: MyWorkDepartment[];
    managedSubtree: MyManagedSubtree | null;
}

export interface MyContext {
    user: MyUser;
    tenants: MyTenant[];
}

export interface MyPermissions {
    departmentId: string;
    permissions: string[];
}