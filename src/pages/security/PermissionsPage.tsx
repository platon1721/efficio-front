import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { permissionsApi, modulesApi } from '../../api/security';
import { getApiError } from '../../api/client';
import type { CreatePermissionRequest } from '../../types/api';

export function PermissionsPage() {
    const [showCreate, setShowCreate] = useState(false);
    const queryClient = useQueryClient();

    const { data: permissions, isLoading } = useQuery({
        queryKey: ['permissions'],
        queryFn: permissionsApi.getAll,
    });

    const { data: modules } = useQuery({
        queryKey: ['modules'],
        queryFn: modulesApi.getAll,
    });

    const deleteMutation = useMutation({
        mutationFn: permissionsApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['permissions'] });
            toast.success('Permission deleted');
        },
        onError: (error) => toast.error(getApiError(error).detail ?? 'Failed to delete'),
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Permissions</h1>
                    <p className="text-sm text-gray-500">Platform-level permission management</p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4" />
                    Add Permission
                </button>
            </div>

            {showCreate && modules && (
                <CreateForm
                    modules={modules}
                    onClose={() => setShowCreate(false)}
                    onSuccess={() => {
                        setShowCreate(false);
                        queryClient.invalidateQueries({ queryKey: ['permissions'] });
                    }}
                />
            )}

            {isLoading ? (
                <p className="text-sm text-gray-500">Loading...</p>
            ) : permissions && permissions.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">Key</th>
                            <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">Name</th>
                            <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">Module</th>
                            <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                            <th className="px-5 py-3 text-right text-xs font-medium uppercase text-gray-500">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {permissions.map((perm) => (
                            <tr key={perm.id} className="hover:bg-gray-50">
                                <td className="px-5 py-3 text-sm font-mono text-gray-900">{perm.key}</td>
                                <td className="px-5 py-3 text-sm text-gray-900">{perm.name ?? '—'}</td>
                                <td className="px-5 py-3">
                    <span className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                      {perm.moduleName ?? '—'}
                    </span>
                                </td>
                                <td className="px-5 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${perm.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {perm.isActive ? 'Active' : 'Inactive'}
                    </span>
                                </td>
                                <td className="px-5 py-3 text-right">
                                    <button
                                        onClick={() => { if (confirm(`Delete permission "${perm.key}"?`)) deleteMutation.mutate(perm.id); }}
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
                <p className="text-sm text-gray-500">No permissions yet.</p>
            )}
        </div>
    );
}

function CreateForm({
                        modules, onClose, onSuccess,
                    }: {
    modules: { id: string; name: string }[];
    onClose: () => void;
    onSuccess: () => void;
}) {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreatePermissionRequest>({
        defaultValues: { isActive: true },
    });

    const onSubmit = async (data: CreatePermissionRequest) => {
        try {
            await permissionsApi.create(data);
            toast.success(`Permission "${data.key}" created`);
            onSuccess();
        } catch (error) {
            toast.error(getApiError(error).detail ?? 'Failed to create');
        }
    };

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="mb-4 font-medium text-gray-900">New Permission</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Key</label>
                        <input className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="e.g. users.read"
                               {...register('key', { required: 'Key is required' })} />
                        {errors.key && <p className="mt-1 text-xs text-red-600">{errors.key.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="e.g. View Users"
                               {...register('name')} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Module</label>
                        <select className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                {...register('moduleId', { required: 'Module is required' })}>
                            <option value="">Select...</option>
                            {modules.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                        {errors.moduleId && <p className="mt-1 text-xs text-red-600">{errors.moduleId.message}</p>}
                    </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" className="rounded border-gray-300" {...register('isActive')} /> Active
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