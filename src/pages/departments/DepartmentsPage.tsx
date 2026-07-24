import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { departmentsApi, departmentTypesApi } from '../../api/departments';
import { getApiError } from '../../api/client';
import type { CreateDepartmentRequest } from '../../types/api';

export function DepartmentsPage() {
    const { tenantId } = useParams<{ tenantId: string }>();
    const [showCreate, setShowCreate] = useState(false);
    const queryClient = useQueryClient();

    const { data: departments, isLoading } = useQuery({
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
        mutationFn: (id: string) => departmentsApi.delete(tenantId!, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['departments', tenantId] });
            toast.success('Department deleted');
        },
        onError: (error) => toast.error(getApiError(error).detail ?? 'Failed to delete'),
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
                    <p className="text-sm text-gray-500">Manage departments within this tenant</p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4" />
                    Add Department
                </button>
            </div>

            {showCreate && types && (
                <CreateForm
                    tenantId={tenantId!}
                    types={types}
                    onClose={() => setShowCreate(false)}
                    onSuccess={() => {
                        setShowCreate(false);
                        queryClient.invalidateQueries({ queryKey: ['departments', tenantId] });
                    }}
                />
            )}

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
                            <th className="px-5 py-3 text-right text-xs font-medium uppercase text-gray-500">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {departments.map((dept) => (
                            <tr key={dept.id} className="hover:bg-gray-50">
                                <td className="px-5 py-3 text-sm font-medium text-gray-900">{dept.name}</td>
                                <td className="px-5 py-3">
                    <span className="inline-flex rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">
                      {dept.departmentTypeName ?? '—'}
                    </span>
                                </td>
                                <td className="px-5 py-3 text-sm text-gray-500">{dept.description ?? '—'}</td>
                                <td className="px-5 py-3 text-right">
                                    <button
                                        onClick={() => { if (confirm(`Delete "${dept.name}"?`)) deleteMutation.mutate(dept.id); }}
                                        className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-sm text-gray-500">No departments yet.</p>
            )}
        </div>
    );
}

function CreateForm({
                        tenantId, types, onClose, onSuccess,
                    }: {
    tenantId: string;
    types: { id: string; name: string }[];
    onClose: () => void;
    onSuccess: () => void;
}) {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreateDepartmentRequest>();

    const onSubmit = async (data: CreateDepartmentRequest) => {
        try {
            await departmentsApi.create(tenantId, data);
            toast.success(`Department "${data.name}" created`);
            onSuccess();
        } catch (error) {
            toast.error(getApiError(error).detail ?? 'Failed to create');
        }
    };

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="mb-4 font-medium text-gray-900">New Department</h2>
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