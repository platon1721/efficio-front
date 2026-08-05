import {useParams} from 'react-router-dom';
import {useQuery} from '@tanstack/react-query';
import {Users} from 'lucide-react';
import {tenantsApi} from '../../api/tenants';
import {membersApi} from '../../api/members';
import {Breadcrumb} from '../../components/detail';

export function MembersPage() {
    const {tenantId} = useParams<{ tenantId: string }>();

    const {data: tenant} = useQuery({
        queryKey: ['tenant', tenantId],
        queryFn: () => tenantsApi.getById(tenantId!),
        enabled: !!tenantId,
    });

    const {data: members, isLoading} = useQuery({
        queryKey: ['members', tenantId],
        queryFn: () => membersApi.getByTenant(tenantId!),
        enabled: !!tenantId,
    });

    return (
        <div className="space-y-6">
            <Breadcrumb
                items={[
                    {label: 'Tenants', to: '/tenants'},
                    {label: tenant?.name ?? '...', to: `/tenants/${tenantId}`},
                    {label: 'Members'},
                ]}
            />

            <div>
                <h1 className="text-2xl font-bold text-gray-900">Members</h1>
                <p className="text-sm text-gray-500">People who belong to this tenant and their roles</p>
            </div>

            {isLoading ? (
                <p className="text-sm text-gray-500">Loading...</p>
            ) : members && members.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">User</th>
                            <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                            <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">Roles</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {members.map((member) => {
                            const displayName = [member.firstName, member.lastName].filter(Boolean).join(' ');
                            return (
                                <tr key={member.userId} className="hover:bg-gray-50">
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-2.5">
                                            <div
                                                className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-xs font-medium text-blue-700">
                                                {(displayName[0] ?? member.email[0] ?? '?').toUpperCase()}
                                            </div>
                                            <div>
                                                {displayName && (
                                                    <div
                                                        className="text-sm font-medium text-gray-900">{displayName}</div>
                                                )}
                                                <div className="text-sm text-gray-500">{member.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5">
                      <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                              member.status === 'Active'
                                  ? 'bg-green-50 text-green-700'
                                  : 'bg-gray-100 text-gray-600'
                          }`}
                      >
                        {member.status}
                      </span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        {member.roles.length > 0 ? (
                                            <div className="flex flex-wrap gap-1.5">
                                                {member.roles.map((role, i) => (
                                                    <span
                                                        key={i}
                                                        className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
                                                    >
                                                        <span className="font-medium">{role.roleName}</span>
                                                        <span className="text-gray-400">·</span>
                                                        <span className="text-gray-500">{role.departmentName}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-400">No roles</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
                    <Users className="mx-auto h-8 w-8 text-gray-300"/>
                    <p className="mt-2 text-sm text-gray-500">No members yet.</p>
                </div>
            )}
        </div>
    );
}