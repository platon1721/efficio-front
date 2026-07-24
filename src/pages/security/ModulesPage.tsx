import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { modulesApi } from '../../api/security';
import { getApiError } from '../../api/client';
import type { CreateModuleRequest } from '../../types/api';

export function ModulesPage() {
    const [showCreate, setShowCreate] = useState(false);
    const queryClient = useQueryClient();

    const { data: modules, isLoading } = useQuery({
        queryKey: ['modules'],
        queryFn: modulesApi.getAll,
    });

    const deleteMutation = useMutation({
        mutationFn: modulesApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['modules'] });
            toast.success('Module deleted');
        },
        onError: (error) => toast.error(getApiError(error).detail ?? 'Failed to delete'),
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Modules</h1>
                    <p className="text-sm text-gray-500">Platform-level module management</p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4" />
                    Add Module
                </button>
            </div>

            {showCreate && (
                <CreateForm
                    onClose={() => setShowCreate(false)}
                    onSuccess={() => {
                        setShowCreate(false);
                        queryClient.invalidateQueries({ queryKey: ['modules'] });
                    }}
                />
            )}

            {isLoading ? (
                <p className="text-sm text-gray-500">Loading...</p>
            ) : modules && modules.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">Code</th>
                            <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">Name</th>
                            <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                            <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">Main</th>
                            <th className="px-5 py-3 text-right text-xs font-medium uppercase text-gray-500">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {modules.map((mod) => (
                            <tr key={mod.id} className="hover:bg-gray-50">
                                <td className="px-5 py-3 text-sm font-mono text-gray-900">{mod.code}</td>
                                <td className="px-5 py-3 text-sm font-medium text-gray-900">{mod.name}</td>
                                <td className="px-5 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${mod.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {mod.isActive ? 'Active' : 'Inactive'}
                    </span>
                                </td>
                                <td className="px-5 py-3 text-sm text-gray-500">{mod.isMain ? 'Yes' : '—'}</td>
                                <td className="px-5 py-3 text-right">
                                    <button
                                        onClick={() => { if (confirm(`Delete module "${mod.name}"?`)) deleteMutation.mutate(mod.id); }}
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
                <p className="text-sm text-gray-500">No modules yet.</p>
            )}
        </div>
    );
}

function CreateForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreateModuleRequest>({
        defaultValues: { isActive: true, isMain: false },
    });

    const onSubmit = async (data: CreateModuleRequest) => {
        try {
            await modulesApi.create(data);
            toast.success(`Module "${data.name}" created`);
            onSuccess();
        } catch (error) {
            toast.error(getApiError(error).detail ?? 'Failed to create');
        }
    };

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="mb-4 font-medium text-gray-900">New Module</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Code</label>
                        <input className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="e.g. HR"
                               {...register('code', { required: 'Code is required' })} />
                        {errors.code && <p className="mt-1 text-xs text-red-600">{errors.code.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="e.g. Human Resources"
                               {...register('name', { required: 'Name is required' })} />
                        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <input className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" {...register('description')} />
                </div>
                <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" className="rounded border-gray-300" {...register('isActive')} /> Active
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" className="rounded border-gray-300" {...register('isMain')} /> Main module
                    </label>
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