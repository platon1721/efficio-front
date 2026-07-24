import { Outlet, Link, useNavigate } from 'react-router-dom';
import { LogOut, Building2, LayoutDashboard, Boxes, Key } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../auth/AuthProvider';

export function AppLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        toast.success('Logged out');
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="flex w-64 flex-col border-r border-gray-200 bg-white">
                <div className="flex h-14 items-center border-b border-gray-200 px-4">
                    <h1 className="text-lg font-bold text-gray-900">Efficio</h1>
                </div>

                <nav className="flex-1 space-y-1 px-3 py-4">
                    <Link
                        to="/"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                    </Link>
                    <Link
                        to="/tenants"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                        <Building2 className="h-4 w-4" />
                        Tenants
                    </Link>

                    {/* Platform Admin section */}
                    {user?.isPlatformAdmin && (
                        <>
                            <div className="pt-4 pb-1 px-3">
                                <p className="text-xs font-semibold uppercase text-gray-400">Platform</p>
                            </div>
                            <Link
                                to="/modules"
                                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                            >
                                <Boxes className="h-4 w-4" />
                                Modules
                            </Link>
                            <Link
                                to="/permissions"
                                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                            >
                                <Key className="h-4 w-4" />
                                Permissions
                            </Link>
                        </>
                    )}
                </nav>

                {/* User footer */}
                <div className="border-t border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-900">{user?.email}</p>
                            {user?.isPlatformAdmin && (
                                <p className="text-xs text-blue-600">Platform Admin</p>
                            )}
                        </div>
                        <button
                            onClick={handleLogout}
                            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            title="Log out"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-auto">
                <div className="p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}