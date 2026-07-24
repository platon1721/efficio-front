import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    ChevronRight,
    ArrowRight,
    Trash2,
    Network,
    Users,
    Box,
    Settings,
} from 'lucide-react';
import { tenantsApi } from '../../api/tenants';
import { departmentsApi, departmentTypesApi } from '../../api/departments';
import { getApiError } from '../../api/client';

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

    if (isLoading) {
        return <p className="text-sm text-gray-500">Loading...</p>;
    }

    if (!tenant) {
        return (
            <div className="space-y-4">
                <p className="text-sm text-gray-500">Tenant not found.</p>
                <Link to="/tenants" className="text-sm text-blue-600 hover:underline">← Back to tenants</Link>
            </div>
        );
    }

    const initials = tenant.name.slice(0, 2).toUpperCase();

    return (
        <div className="space-y-7">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-400">
                <Link to="/tenants" className="text-gray-500 hover:text-gray-700">Tenants</Link>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="text-gray-900">{tenant.name}</span>
            </nav>

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                    <div className="flex h-13 w-13 items-center justify-center rounded-xl bg-blue-50 text-lg font-medium text-blue-700" style={{ height: '3.25rem', width: '3.25rem' }}>
                        {initials}
                    </div>
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-2xl font-bold text-gray-900">{tenant.name}</h1>
                            <span
                                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                    tenant.status === 'Active'
                                        ? 'bg-green-50 text-green-700'
                                        : 'bg-gray-100 text-gray-600'
                                }`}
                            >
                {tenant.status}
              </span>
                        </div>
                        <p className="mt-0.5 font-mono text-xs text-gray-500">
                            {tenant.code} · {tenant.defaultLocale}
                        </p>
                    </div>
                </div>
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
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <StatCard label="Departments" value={departments?.length ?? '—'} />
                <StatCard label="Department types" value={types?.length ?? '—'} />
                <StatCard label="Locale" value={tenant.defaultLocale} />
            </div>

            {/* Section cards */}
            <div className="grid gap-3 sm:grid-cols-2">
                <SectionCard
                    to={`/tenants/${tenantId}/departments`}
                    icon={<Network className="h-5 w-5 text-blue-600" />}
                    title="Departments"
                    description="Manage the org structure, hierarchy, and department types."
                />
                <SectionCard
                    to={`/tenants/${tenantId}/modules`}
                    icon={<Box className="h-5 w-5 text-blue-600" />}
                    title="Modules"
                    description="Activate features like Warehouse and POS for this tenant."
                />
                <SectionCard
                    icon={<Users className="h-5 w-5 text-gray-400" />}
                    title="Members"
                    description="Invite users, assign roles, and manage access."
                    comingSoon
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

function StatCard({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="rounded-lg bg-gray-50 p-4">
            <div className="mb-1 text-sm text-gray-500">{label}</div>
            <div className="text-2xl font-medium text-gray-900">{value}</div>
        </div>
    );
}

function SectionCard({
                         to,
                         icon,
                         title,
                         description,
                         comingSoon,
                     }: {
    to?: string;
    icon: React.ReactNode;
    title: string;
    description: string;
    comingSoon?: boolean;
}) {
    const inner = (
        <div
            className={`rounded-xl border border-gray-200 bg-white p-5 ${
                comingSoon ? 'opacity-60' : 'cursor-pointer hover:border-gray-300 hover:shadow-sm'
            }`}
        >
            <div className="mb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    {icon}
                    <span className="font-medium text-gray-900">{title}</span>
                </div>
                {comingSoon ? (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
            Coming soon
          </span>
                ) : (
                    <ArrowRight className="h-4.5 w-4.5 text-gray-400" />
                )}
            </div>
            <p className="text-sm leading-relaxed text-gray-500">{description}</p>
        </div>
    );

    if (comingSoon || !to) {
        return inner;
    }

    return <Link to={to}>{inner}</Link>;
}