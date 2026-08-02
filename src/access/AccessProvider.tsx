import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { myApi } from '../api/my';
import type { MyContext, MyTenant } from '../types/api';

interface AccessContextValue {
    /** Full context from /my/context. Null while loading or if not logged in. */
    context: MyContext | null;
    isLoading: boolean;

    /** Platform-level flags (from the user record, not tenant-scoped). */
    isPlatformAdmin: boolean;
    isGodAdmin: boolean;

    /** The tenant the user is currently working in. */
    activeTenant: MyTenant | null;
    setActiveTenantId: (tenantId: string) => void;

    /** The department the user is currently working in (within activeTenant). */
    activeDepartmentId: string | null;
    setActiveDepartmentId: (departmentId: string) => void;

    /** True if the active tenant has the given module code active. */
    hasModule: (code: string) => boolean;

    /** Permissions in the active department (computed, inheritance applied). */
    permissions: string[];
    hasPermission: (key: string) => boolean;
    permissionsLoading: boolean;
}

const AccessContext = createContext<AccessContextValue | undefined>(undefined);

const ACTIVE_TENANT_KEY = 'efficio.activeTenantId';
const ACTIVE_DEPT_KEY = 'efficio.activeDepartmentId';

export function AccessProvider({ children }: { children: ReactNode }) {
    const { data: context, isLoading } = useQuery({
        queryKey: ['my-context'],
        queryFn: myApi.getContext,
        staleTime: 5 * 60 * 1000, // 5 min — context doesn't change often
        enabled: !!localStorage.getItem('efficio_token'), // only when logged in
        retry: false, // don't hammer /my/context on 401
    });

    const [activeTenantId, setActiveTenantIdState] = useState<string | null>(
        () => localStorage.getItem(ACTIVE_TENANT_KEY)
    );
    const [activeDepartmentId, setActiveDepartmentIdState] = useState<string | null>(
        () => localStorage.getItem(ACTIVE_DEPT_KEY)
    );

    // Once context loads, ensure we have a valid active tenant/department.
    useEffect(() => {
        if (!context || context.tenants.length === 0) return;

        // Validate stored tenant still exists; otherwise pick the first.
        const validTenant =
            context.tenants.find((t) => t.tenantId === activeTenantId) ?? context.tenants[0];

        if (validTenant.tenantId !== activeTenantId) {
            setActiveTenantIdState(validTenant.tenantId);
            localStorage.setItem(ACTIVE_TENANT_KEY, validTenant.tenantId);
        }

        // Validate stored department belongs to the active tenant.
        const deptValid = validTenant.workDepartments.some(
            (d) => d.departmentId === activeDepartmentId
        );
        if (!deptValid) {
            const firstDept = validTenant.workDepartments[0]?.departmentId ?? null;
            setActiveDepartmentIdState(firstDept);
            if (firstDept) localStorage.setItem(ACTIVE_DEPT_KEY, firstDept);
            else localStorage.removeItem(ACTIVE_DEPT_KEY);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [context]);

    const activeTenant =
        context?.tenants.find((t) => t.tenantId === activeTenantId) ?? null;

    const setActiveTenantId = (tenantId: string) => {
        setActiveTenantIdState(tenantId);
        localStorage.setItem(ACTIVE_TENANT_KEY, tenantId);
        // Reset department to the first one in the new tenant.
        const tenant = context?.tenants.find((t) => t.tenantId === tenantId);
        const firstDept = tenant?.workDepartments[0]?.departmentId ?? null;
        setActiveDepartmentIdState(firstDept);
        if (firstDept) localStorage.setItem(ACTIVE_DEPT_KEY, firstDept);
        else localStorage.removeItem(ACTIVE_DEPT_KEY);
    };

    const setActiveDepartmentId = (departmentId: string) => {
        setActiveDepartmentIdState(departmentId);
        localStorage.setItem(ACTIVE_DEPT_KEY, departmentId);
    };

    const hasModule = (code: string) =>
        activeTenant?.modules.includes(code) ?? false;

    // Permissions in the active department — fetched on demand.
    const { data: permData, isLoading: permissionsLoading } = useQuery({
        queryKey: ['my-permissions', activeDepartmentId],
        queryFn: () => myApi.getPermissions(activeDepartmentId!),
        enabled: !!activeDepartmentId,
        staleTime: 5 * 60 * 1000,
    });

    const permissions = permData?.permissions ?? [];
    const hasPermission = (key: string) => permissions.includes(key);

    const value: AccessContextValue = {
        context: context ?? null,
        isLoading,
        isPlatformAdmin: context?.user.isPlatformAdmin ?? false,
        isGodAdmin: context?.user.isGodAdmin ?? false,
        activeTenant,
        setActiveTenantId,
        activeDepartmentId,
        setActiveDepartmentId,
        hasModule,
        permissions,
        hasPermission,
        permissionsLoading,
    };

    return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>;
}

export function useAccess() {
    const ctx = useContext(AccessContext);
    if (ctx === undefined) {
        throw new Error('useAccess must be used within an AccessProvider');
    }
    return ctx;
}