import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../auth/AuthProvider';
import { getApiError } from '../../api/client';

interface RegisterForm {
    email: string;
    password: string;
    confirmPassword: string;
}

export function RegisterPage() {
    const { register: registerUser } = useAuth();
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<RegisterForm>();

    const onSubmit = async (data: RegisterForm) => {
        try {
            await registerUser(data.email, data.password);
            toast.success('Account created successfully');
            navigate('/');
        } catch (error) {
            const apiError = getApiError(error);
            if (apiError.errors) {
                Object.values(apiError.errors)
                    .flat()
                    .forEach((msg) => toast.error(msg));
            } else {
                toast.error(apiError.detail ?? 'Registration failed');
            }
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-sm space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
                    <p className="mt-1 text-sm text-gray-500">Get started with Efficio</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            {...register('email', { required: 'Email is required' })}
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="new-password"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            {...register('password', {
                                required: 'Password is required',
                                minLength: { value: 6, message: 'Minimum 6 characters' },
                            })}
                        />
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                            Confirm password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            {...register('confirmPassword', {
                                required: 'Please confirm password',
                                validate: (val) => val === watch('password') || 'Passwords do not match',
                            })}
                        />
                        {errors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Creating account...' : 'Create account'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}