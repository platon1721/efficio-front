import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { tenantsApi } from '../../api/tenants';
import { getApiError } from '../../api/client';
import type { CreateTenantRequest } from '../../types/api';

export function TenantsPage() {
    const [showCreate, setShowCreate] = useState(false);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: tenants, isLoading } = useQuery({
        queryKey: ['tenants'],
        queryFn: tenantsApi.getAll,
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Tenants</h1>
                <button
                    onClick={() => setShowCreate(true)}
                    className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4" />
                    Create Tenant
                </button>
            </div>

            {showCreate && (
                <CreateTenantForm
                    onClose={() => setShowCreate(false)}
                    onSuccess={() => {
                        setShowCreate(false);
                        queryClient.invalidateQueries({ queryKey: ['tenants'] });
                    }}
                />
            )}

            {isLoading ? (
                <p className="text-sm text-gray-500">Loading...</p>
            ) : tenants && tenants.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">Name</th>
                            <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">Code</th>
                            <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                            <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">Locale</th>
                            <th className="px-5 py-3"></th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {tenants.map((tenant) => (
                            <tr
                                key={tenant.id}
                                onClick={() => navigate(`/tenants/${tenant.id}`)}
                                className="cursor-pointer hover:bg-gray-50"
                            >
                                <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{tenant.name}</td>
                                <td className="px-5 py-3.5 text-sm text-gray-500">{tenant.code}</td>
                                <td className="px-5 py-3.5">
                    <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            tenant.status === 'Active'
                                ? 'bg-green-50 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                        }`}
                    >
                      {tenant.status}
                    </span>
                                </td>
                                <td className="px-5 py-3.5 text-sm text-gray-500">{tenant.defaultLocale}</td>
                                <td className="px-5 py-3.5 text-right">
                                    <ChevronRight className="ml-auto h-4 w-4 text-gray-400" />
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-sm text-gray-500">No tenants yet.</p>
            )}
        </div>
    );
}

function CreateTenantForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<CreateTenantRequest>();

    const onSubmit = async (data: CreateTenantRequest) => {
        try {
            await tenantsApi.create(data);
            toast.success(`Tenant "${data.name}" created`);
            onSuccess();
        } catch (error) {
            toast.error(getApiError(error).detail ?? 'Failed to create tenant');
        }
    };

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="mb-4 font-medium text-gray-900">New Tenant</h2>
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
                        <label className="block text-sm font-medium text-gray-700">Code</label>
                        <input
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="e.g. acme"
                            {...register('code', { required: 'Code is required', maxLength: 10 })}
                        />
                        {errors.code && <p className="mt-1 text-xs text-red-600">{errors.code.message}</p>}
                    </div>
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