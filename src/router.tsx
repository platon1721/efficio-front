import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { TenantsPage } from './pages/tenants/TenantsPage';
import { DepartmentsPage } from './pages/departments/DepartmentsPage';
import { ModulesPage } from './pages/security/ModulesPage';
import { PermissionsPage } from './pages/security/PermissionsPage';
import { DepartmentTypesPage } from './pages/departments/DepartmentTypesPage';

export const router = createBrowserRouter([
    // Public routes
    { path: '/login', element: <LoginPage /> },
    { path: '/register', element: <RegisterPage /> },

    // Protected routes
    {
        element: <ProtectedRoute />,
        children: [
            {
                element: <AppLayout />,
                children: [
                    { path: '/', element: <DashboardPage /> },
                    { path: '/tenants', element: <TenantsPage /> },
                    { path: '/tenants/:tenantId/departments', element: <DepartmentsPage /> },
                    { path: '/modules', element: <ModulesPage /> },
                    { path: '/permissions', element: <PermissionsPage /> },
                    { path: '/tenants/:tenantId/department-types', element: <DepartmentTypesPage /> },
                ],
            },
        ],
    },
]);