import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { TenantsPage } from './pages/tenants/TenantsPage';
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
                ],
            },
        ],
    },
]);