import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Boxes } from 'lucide-react';
import { tenantsApi } from '../../api/tenants';
import { departmentsApi } from '../../api/departments';
import { Breadcrumb } from '../../components/detail';

export function DepartmentsPage() {
    const { tenantId } = useParams<{ tenantId: string }>();
    const navigate = useNavigate();

    const { data: tenant } = useQuery({
        queryKey: ['tenant', tenantId],
        queryFn: () => tenantsApi.getById(tenantId!),
        enabled: !!tenantId,
    });

    const { data: departments, isLoading } = useQuery({
        queryKey: ['departments', tenantId],
        queryFn: () => departmentsApi.getAll(tenantId!),
        enabled: !!tenantId,
    });

    return (
        <div className="space-y-6">
            <Breadcrumb
                items={[
                    { label: 'Tenants', to: '/tenants' },
                    { label: tenant?.name ?? '...', to: `/tenants/${tenantId}` },
                    { label: 'Departments' },
                ]}
            />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
                    <p className="text-sm text-gray-500">The full org structure for this tenant</p>
                </div>
                <button
                    onClick={() => navigate(`/tenants/${tenantId}/department-types`)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    <Boxes className="h-4 w-4" />
                    Manage types
                </button>
            </div>

            {isLoading ? (
                <p className="text-sm text-gray-500">Loading...</p>
            ) : departments && departments.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">Name</th>
                            <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">Type</th>
                            <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">Description</th>
                            <th className="px-5 py-3"></th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {departments.map((dept) => (
                            <tr
                                key={dept.id}
                                onClick={() => navigate(`/tenants/${tenantId}/departments/${dept.id}`)}
                                className="cursor-pointer hover:bg-gray-50"
                            >
                                <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{dept.name}</td>
                                <td className="px-5 py-3.5">
                    <span className="inline-flex rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">
                      {dept.departmentTypeName ?? '—'}
                    </span>
                                </td>
                                <td className="px-5 py-3.5 text-sm text-gray-500">{dept.description ?? '—'}</td>
                                <td className="px-5 py-3.5 text-right">
                                    <ChevronRight className="ml-auto h-4 w-4 text-gray-400" />
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
                    <p className="text-sm text-gray-500">
                        No departments yet. The root department is created automatically when the tenant is set up.
                    </p>
                </div>
            )}
        </div>
    );
}