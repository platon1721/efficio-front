import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Network, Shield, Users, Trash2, Plus } from 'lucide-react';
import { tenantsApi } from '../../api/tenants';
import { departmentsApi, departmentTypesApi, departmentLinksApi } from '../../api/departments';
import { getApiError } from '../../api/client';
import { Breadcrumb, DetailHeader, StatCard, SectionCard } from '../../components/detail';
import type { CreateDepartmentRequest } from '../../types/api';

export function DepartmentDetailPage() {
    const { tenantId, departmentId } = useParams<{ tenantId: string; departmentId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [showCreate, setShowCreate] = useState(false);

    const { data: tenant } = useQuery({
        queryKey: ['tenant', tenantId],
        queryFn: () => tenantsApi.getById(tenantId!),
        enabled: !!tenantId,
    });

    const { data: department, isLoading } = useQuery({
        queryKey: ['department', departmentId],
        queryFn: () => departmentsApi.getById(tenantId!, departmentId!),
        enabled: !!tenantId && !!departmentId,
    });

    const { data: children } = useQuery({
        queryKey: ['department-children', departmentId],
        queryFn: () => departmentLinksApi.getChildren(tenantId!, departmentId!),
        enabled: !!tenantId && !!departmentId,
    });

    const { data: types } = useQuery({
        queryKey: ['department-types', tenantId],
        queryFn: () => departmentTypesApi.getAll(tenantId!),
        enabled: !!tenantId,
    });

    const deleteMutation = useMutation({
        mutationFn: () => departmentsApi.delete(tenantId!, departmentId!),
        onSuccess: () => {
            toast.success('Department deleted');
            navigate(`/tenants/${tenantId}/departments`);
        },
        onError: (error) => toast.error(getApiError(error).detail ?? 'Failed to delete'),
    });

    if (isLoading) return <p className="text-sm text-gray-500">Loading...</p>;
    if (!department) return <p className="text-sm text-gray-500">Department not found.</p>;

    const childCount = children?.length ?? 0;

    return (
        <div className="space-y-7">
            <Breadcrumb
                items={[
                    { label: 'Tenants', to: '/tenants' },
                    { label: tenant?.name ?? '...', to: `/tenants/${tenantId}` },
                    { label: 'Departments', to: `/tenants/${tenantId}/departments` },
                    { label: department.name },
                ]}
            />

            <DetailHeader
                initials={department.name.slice(0, 2).toUpperCase()}
                title={department.name}
                subtitle={department.departmentTypeName ?? undefined}
                actions={
                    <button
                        onClick={() => {
                            if (confirm(`Delete department "${department.name}"?`)) deleteMutation.mutate();
                        }}
                        className="inline-flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete
                    </button>
                }
            />

            {department.description && (
                <p className="text-sm text-gray-600">{department.description}</p>
            )}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <StatCard label="Sub-departments" value={childCount} />
                <StatCard label="Type" value={department.departmentTypeName ?? '—'} />
            </div>

            {/* Sub-departments section with inline create */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-gray-900">Sub-departments</h2>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        <Plus className="h-4 w-4" />
                        Add sub-department
                    </button>
                </div>

                {showCreate && types && (
                    <CreateSubDepartmentForm
                        tenantId={tenantId!}
                        parentDepartmentId={departmentId!}
                        types={types}
                        onClose={() => setShowCreate(false)}
                        onSuccess={() => {
                            setShowCreate(false);
                            queryClient.invalidateQueries({ queryKey: ['department-children', departmentId] });
                            queryClient.invalidateQueries({ queryKey: ['departments', tenantId] });
                        }}
                    />
                )}

                {childCount > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                        {children!.map((link) => (
                            <SectionCard
                                key={link.id}
                                to={`/tenants/${tenantId}/departments/${link.childDepartmentId}`}
                                icon={<Network className="h-5 w-5 text-blue-600" />}
                                title={link.childDepartmentName ?? 'Department'}
                                description="Open to manage this sub-department."
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500">No sub-departments yet.</p>
                )}
            </div>

            {/* Other management sections */}
            <div className="grid gap-3 sm:grid-cols-2">
                <SectionCard
                    icon={<Shield className="h-5 w-5 text-gray-400" />}
                    title="Roles"
                    description="Define roles and assign permissions for this department."
                    comingSoon
                />
                <SectionCard
                    icon={<Users className="h-5 w-5 text-gray-400" />}
                    title="People"
                    description="Assign users to roles within this department."
                    comingSoon
                />
            </div>
        </div>
    );
}

function CreateSubDepartmentForm({
                                     tenantId,
                                     parentDepartmentId,
                                     types,
                                     onClose,
                                     onSuccess,
                                 }: {
    tenantId: string;
    parentDepartmentId: string;
    types: { id: string; name: string }[];
    onClose: () => void;
    onSuccess: () => void;
}) {
    const { register, handleSubmit, formState: { errors, isSubmitting } } =
        useForm<Omit<CreateDepartmentRequest, 'parentDepartmentId'>>();

    const onSubmit = async (data: Omit<CreateDepartmentRequest, 'parentDepartmentId'>) => {
        try {
            await departmentsApi.create(tenantId, { ...data, parentDepartmentId });
            toast.success(`Department "${data.name}" created`);
            onSuccess();
        } catch (error) {
            toast.error(getApiError(error).detail ?? 'Failed to create');
        }
    };

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="mb-4 font-medium text-gray-900">New sub-department</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            {...register('name', { required: 'Name is required' })}
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Type</label>
                        <select
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            {...register('departmentTypeId', { required: 'Type is required' })}
                        >
                            <option value="">Select type...</option>
                            {types.map((t) => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                        {errors.departmentTypeId && <p className="mt-1 text-xs text-red-600">{errors.departmentTypeId.message}</p>}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <input
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        {...register('description')}
                    />
                </div>
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