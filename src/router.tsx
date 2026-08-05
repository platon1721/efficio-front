import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { TenantsPage } from './pages/tenants/TenantsPage';
import { TenantDetailPage } from './pages/tenants/TenantDetailPage.tsx';
import { DepartmentsPage } from './pages/departments/DepartmentsPage';
import { DepartmentDetailPage } from './pages/departments/DepartmentDetailPage';
import { ModulesPage } from './pages/security/ModulesPage';
import { PermissionsPage } from './pages/security/PermissionsPage';
import { DepartmentTypesPage } from './pages/departments/DepartmentTypesPage';
import { MembersPage } from './pages/members/MembersPage';

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
                    // Tenants
                    { path: '/', element: <DashboardPage /> },
                    { path: '/tenants', element: <TenantsPage /> },
                    { path: '/tenants/:tenantId', element: <TenantDetailPage /> },
                    // Tenant departments
                    { path: '/tenants/:tenantId/departments', element: <DepartmentsPage /> },
                    { path: '/tenants/:tenantId/department-types', element: <DepartmentTypesPage /> },
                    { path: '/tenants/:tenantId/departments/:departmentId', element: <DepartmentDetailPage /> },
                    // Modules
                    { path: '/modules', element: <ModulesPage /> },
                    // Permissions
                    { path: '/permissions', element: <PermissionsPage /> },
                    // Members
                    { path: '/tenants/:tenantId/members', element: <MembersPage /> },
                ],
            },
        ],
    },
]);