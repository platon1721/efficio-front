import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Trash2, Shield, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { tenantsApi } from '../../api/tenants';
import { departmentsApi } from '../../api/departments';
import { rolesApi, permissionsApi } from '../../api/security';
import { getApiError } from '../../api/client';
import { Breadcrumb } from '../../components/detail';
import type { CreateRoleRequest, Permission, RoleWithPermissions } from '../../types/api';

export function RolesPage() {
    const { tenantId, departmentId } = useParams<{ tenantId: string; departmentId: string }>();
    const [showCreate, setShowCreate] = useState(false);
    const [expandedRole, setExpandedRole] = useState<string | null>(null);
    const queryClient = useQueryClient();

    const { data: tenant } = useQuery({
        queryKey: ['tenant', tenantId],
        queryFn: () => tenantsApi.getById(tenantId!),
        enabled: !!tenantId,
    });

    const { data: department } = useQuery({
        queryKey: ['department', departmentId],
        queryFn: () => departmentsApi.getById(tenantId!, departmentId!),
        enabled: !!tenantId && !!departmentId,
    });

    const { data: roles, isLoading } = useQuery({
        queryKey: ['roles', departmentId],
        queryFn: () => rolesApi.getByDepartment(tenantId!, departmentId!),
        enabled: !!tenantId && !!departmentId,
    });

    const deleteMutation = useMutation({
        mutationFn: (roleId: string) => rolesApi.delete(tenantId!, departmentId!, roleId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles', departmentId] });
            toast.success('Role deleted');
        },
        onError: (error) => toast.error(getApiError(error).detail ?? 'Failed to delete'),
    });

    return (
        <div className="space-y-6">
            <Breadcrumb
                items={[
                    { label: 'Tenants', to: '/tenants' },
                    { label: tenant?.name ?? '...', to: `/tenants/${tenantId}` },
                    { label: 'Departments', to: `/tenants/${tenantId}/departments` },
                    { label: department?.name ?? '...', to: `/tenants/${tenantId}/departments/${departmentId}` },
                    { label: 'Roles' },
                ]}
            />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Roles</h1>
                    <p className="text-sm text-gray-500">
                        Roles for {department?.name ?? 'this department'} and their permissions
                    </p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4" />
                    Add Role
                </button>
            </div>

            {showCreate && (
                <CreateRoleForm
                    tenantId={tenantId!}
                    departmentId={departmentId!}
                    onClose={() => setShowCreate(false)}
                    onSuccess={() => {
                        setShowCreate(false);
                        queryClient.invalidateQueries({ queryKey: ['roles', departmentId] });
                    }}
                />
            )}

            {isLoading ? (
                <p className="text-sm text-gray-500">Loading...</p>
            ) : roles && roles.length > 0 ? (
                <div className="space-y-2">
                    {roles.map((role) => (
                        <div key={role.id} className="rounded-lg border border-gray-200 bg-white">
                            <div className="flex items-center justify-between p-4">
                                <button
                                    onClick={() => setExpandedRole(expandedRole === role.id ? null : role.id)}
                                    className="flex flex-1 items-center gap-2.5 text-left"
                                >
                                    {expandedRole === role.id ? (
                                        <ChevronDown className="h-4 w-4 text-gray-400" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4 text-gray-400" />
                                    )}
                                    <Shield className="h-4 w-4 text-blue-600" />
                                    <span className="font-medium text-gray-900">{role.name}</span>
                                    {role.appliesToSubtree && (
                                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                      Applies to sub-departments
                    </span>
                                    )}
                                    {role.fullAccess && (
                                        <span className="rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">
                      Full access
                    </span>
                                    )}
                                </button>
                                {!role.fullAccess && (
                                    <button
                                        onClick={() => { if (confirm(`Delete role "${role.name}"?`)) deleteMutation.mutate(role.id); }}
                                        className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            {expandedRole === role.id && (
                                <RolePermissions
                                    tenantId={tenantId!}
                                    departmentId={departmentId!}
                                    roleId={role.id}
                                    readOnly={role.fullAccess}
                                />
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
                    <Shield className="mx-auto h-8 w-8 text-gray-300" />
                    <p className="mt-2 text-sm text-gray-500">No roles yet.</p>
                </div>
            )}
        </div>
    );
}

// ─── Create role form ────────────────────────────────────────────────

function CreateRoleForm({
                            tenantId, departmentId, onClose, onSuccess,
                        }: {
    tenantId: string;
    departmentId: string;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const { register, handleSubmit, formState: { errors, isSubmitting } } =
        useForm<Omit<CreateRoleRequest, 'departmentId'>>();

    const onSubmit = async (data: Omit<CreateRoleRequest, 'departmentId'>) => {
        try {
            await rolesApi.create(tenantId, departmentId, { ...data, departmentId });
            toast.success(`Role "${data.name}" created`);
            onSuccess();
        } catch (error) {
            toast.error(getApiError(error).detail ?? 'Failed to create');
        }
    };

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="mb-4 font-medium text-gray-900">New Role</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="e.g. Warehouse Manager"
                        {...register('name', { required: 'Name is required' })}
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <input
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        {...register('description')}
                    />
                </div>
                <label className="flex items-start gap-2 text-sm text-gray-700">
                    <input type="checkbox" className="mt-0.5 rounded border-gray-300" {...register('appliesToSubtree')} />
                    <span>
            <span className="font-medium">Applies to sub-departments</span>
            <span className="block text-xs text-gray-500">
              Permissions reach into all departments below this one. Use for managers.
            </span>
          </span>
                </label>
                <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={onClose} className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                        {isSubmitting ? 'Creating...' : 'Create'}
                    </button>
                </div>
            </form>
        </div>
    );
}

// ─── Role permissions (expand panel) ─────────────────────────────────

function RolePermissions({
                             tenantId, departmentId, roleId, readOnly,
                         }: {
    tenantId: string;
    departmentId: string;
    roleId: string;
    readOnly: boolean;
}) {
    const queryClient = useQueryClient();

    // The role with its currently-assigned permissions.
    const { data: role } = useQuery({
        queryKey: ['role', roleId],
        queryFn: () => rolesApi.getById(tenantId, departmentId, roleId),
    });

    // All available permissions (to choose from), grouped by module.
    const { data: allPermissions } = useQuery({
        queryKey: ['permissions'],
        queryFn: permissionsApi.getAll,
    });

    const assignedIds = new Set((role as RoleWithPermissions | undefined)?.permissions.map((p) => p.id));

    const assign = useMutation({
        mutationFn: (permissionId: string) =>
            rolesApi.assignPermission(tenantId, departmentId, roleId, permissionId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['role', roleId] }),
        onError: (error) => toast.error(getApiError(error).detail ?? 'Failed'),
    });

    const remove = useMutation({
        mutationFn: (permissionId: string) =>
            rolesApi.removePermission(tenantId, departmentId, roleId, permissionId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['role', roleId] }),
        onError: (error) => toast.error(getApiError(error).detail ?? 'Failed'),
    });

    const toggle = (permissionId: string, currentlyAssigned: boolean) => {
        if (readOnly) return;
        if (currentlyAssigned) remove.mutate(permissionId);
        else assign.mutate(permissionId);
    };

    // Group permissions by module name.
    const grouped = new Map<string, Permission[]>();
    (allPermissions ?? []).forEach((p) => {
        const key = p.moduleName ?? 'Other';
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key)!.push(p);
    });

    if (readOnly) {
        return (
            <div className="border-t border-gray-100 p-4 text-sm text-gray-500">
                This role has full access to every permission and can't be edited.
            </div>
        );
    }

    return (
        <div className="space-y-4 border-t border-gray-100 p-4">
            {grouped.size === 0 ? (
                <p className="text-sm text-gray-500">No permissions defined yet.</p>
            ) : (
                [...grouped.entries()].map(([moduleName, perms]) => (
                    <div key={moduleName}>
                        <h4 className="mb-1.5 text-xs font-semibold uppercase text-gray-400">{moduleName}</h4>
                        <div className="space-y-1">
                            {perms.map((perm) => {
                                const isAssigned = assignedIds.has(perm.id);
                                return (
                                    <label
                                        key={perm.id}
                                        className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-gray-50"
                                    >
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300"
                                            checked={isAssigned}
                                            onChange={() => toggle(perm.id, isAssigned)}
                                        />
                                        <span className="font-mono text-xs text-gray-600">{perm.key}</span>
                                        {perm.name && <span className="text-gray-500">— {perm.name}</span>}
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}