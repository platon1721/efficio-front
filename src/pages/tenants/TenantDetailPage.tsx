import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Network, Users, Box, Settings, Trash2 } from 'lucide-react';
import { tenantsApi } from '../../api/tenants';
import { departmentsApi, departmentTypesApi } from '../../api/departments';
import { getApiError } from '../../api/client';
import { Breadcrumb, DetailHeader, StatCard, SectionCard } from '../../components/detail';

export function TenantDetailPage() {
    const { tenantId } = useParams<{ tenantId: string }>();
    const navigate = useNavigate();

    const { data: tenant, isLoading } = useQuery({
        queryKey: ['tenant', tenantId],
        queryFn: () => tenantsApi.getById(tenantId!),
        enabled: !!tenantId,
    });

    const { data: departments } = useQuery({
        queryKey: ['departments', tenantId],
        queryFn: () => departmentsApi.getAll(tenantId!),
        enabled: !!tenantId,
    });

    const { data: types } = useQuery({
        queryKey: ['department-types', tenantId],
        queryFn: () => departmentTypesApi.getAll(tenantId!),
        enabled: !!tenantId,
    });

    const deleteMutation = useMutation({
        mutationFn: () => tenantsApi.delete(tenantId!),
        onSuccess: () => {
            toast.success('Tenant deleted');
            navigate('/tenants');
        },
        onError: (error) => toast.error(getApiError(error).detail ?? 'Failed to delete'),
    });

    if (isLoading) return <p className="text-sm text-gray-500">Loading...</p>;
    if (!tenant) return <p className="text-sm text-gray-500">Tenant not found.</p>;

    return (
        <div className="space-y-7">
            <Breadcrumb
                items={[
                    { label: 'Tenants', to: '/tenants' },
                    { label: tenant.name },
                ]}
            />

            <DetailHeader
                initials={tenant.name.slice(0, 2).toUpperCase()}
                title={tenant.name}
                subtitle={`${tenant.code} · ${tenant.defaultLocale}`}
                badge={{ label: tenant.status, tone: tenant.status === 'Active' ? 'success' : 'neutral' }}
                actions={
                    <button
                        onClick={() => {
                            if (confirm(`Delete tenant "${tenant.name}"? This cannot be undone.`)) {
                                deleteMutation.mutate();
                            }
                        }}
                        className="inline-flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete
                    </button>
                }
            />

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <StatCard label="Departments" value={departments?.length ?? '—'} />
                <StatCard label="Department types" value={types?.length ?? '—'} />
                <StatCard label="Locale" value={tenant.defaultLocale} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                <SectionCard
                    to={`/tenants/${tenantId}/departments`}
                    icon={<Network className="h-5 w-5 text-blue-600" />}
                    title="Departments"
                    description="Manage the org structure, hierarchy, and department types."
                />
                <SectionCard
                    icon={<Box className="h-5 w-5 text-gray-400" />}
                    title="Modules"
                    description="Activate features like Warehouse and POS for this tenant."
                    comingSoon
                />
                <SectionCard
                    to={`/tenants/${tenantId}/members`}
                    icon={<Users className="h-5 w-5 text-blue-600" />}
                    title="Members"
                    description="Invite users, assign roles, and manage access."
                />
                <SectionCard
                    icon={<Settings className="h-5 w-5 text-gray-400" />}
                    title="Settings"
                    description="Name, code, locale, and timezone configuration."
                    comingSoon
                />
            </div>
        </div>
    );
}