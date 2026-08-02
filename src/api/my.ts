import api from './client';
import type { MyContext, MyPermissions } from '../types/api';

export const myApi = {
    getContext: async (): Promise<MyContext> => {
        const { data } = await api.get<MyContext>('/my/context');
        return data;
    },

    getPermissions: async (departmentId: string): Promise<MyPermissions> => {
        const { data } = await api.get<MyPermissions>('/my/permissions', {
            params: { departmentId },
        });
        return data;
    },
};