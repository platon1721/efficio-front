import type { ReactNode } from 'react';

export interface HeaderBadge {
    label: string;
    tone?: 'success' | 'neutral';
}

export function DetailHeader({
                                 initials,
                                 title,
                                 subtitle,
                                 badge,
                                 actions,
                             }: {
    initials: string;
    title: string;
    subtitle?: string;
    badge?: HeaderBadge;
    actions?: ReactNode;
}) {
    return (
        <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
                <div className="flex h-13 w-13 items-center justify-center rounded-xl bg-blue-50 text-lg font-medium text-blue-700">
                    {initials}
                </div>
                <div>
                    <div className="flex items-center gap-2.5">
                        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                        {badge && (
                            <span
                                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                    badge.tone === 'success'
                                        ? 'bg-green-50 text-green-700'
                                        : 'bg-gray-100 text-gray-600'
                                }`}
                            >
                {badge.label}
              </span>
                        )}
                    </div>
                    {subtitle && <p className="mt-0.5 font-mono text-xs text-gray-500">{subtitle}</p>}
                </div>
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
    );
}