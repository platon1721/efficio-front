import { useQuery } from '@tanstack/react-query';
import { Building2, Users } from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';
import { myApi } from '../../api/tenants';

export function DashboardPage() {
    const { user } = useAuth();

    const { data: memberships, isLoading } = useQuery({
        queryKey: ['my-memberships'],
        queryFn: myApi.getMemberships,
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back, {user?.email}</p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg border border-gray-200 bg-white p-5">
                    <div className="flex items-center gap-3">
                        <div className="rounded-md bg-blue-50 p-2">
                            <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">My Tenants</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {isLoading ? '...' : memberships?.length ?? 0}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-5">
                    <div className="flex items-center gap-3">
                        <div className="rounded-md bg-green-50 p-2">
                            <Users className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Role</p>
                            <p className="text-lg font-semibold text-gray-900">
                                {user?.isPlatformAdmin ? 'Platform Admin' : 'User'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Memberships */}
            {memberships && memberships.length > 0 && (
                <div className="rounded-lg border border-gray-200 bg-white">
                    <div className="border-b border-gray-200 px-5 py-3">
                        <h2 className="font-medium text-gray-900">My Memberships</h2>
                    </div>
                    <ul className="divide-y divide-gray-100">
                        {memberships.map((m) => (
                            <li key={m.id} className="flex items-center justify-between px-5 py-3">
                                <span className="text-sm text-gray-700">{m.tenantRootDepartmentId}</span>
                                <span
                                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                        m.status === 'Active'
                                            ? 'bg-green-50 text-green-700'
                                            : m.status === 'Invited'
                                                ? 'bg-yellow-50 text-yellow-700'
                                                : 'bg-gray-100 text-gray-600'
                                    }`}
                                >
                  {m.status}
                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}