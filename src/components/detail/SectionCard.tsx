import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function SectionCard({
                                icon,
                                title,
                                description,
                                to,
                                comingSoon,
                            }: {
    icon: ReactNode;
    title: string;
    description: string;
    to?: string;
    comingSoon?: boolean;
}) {
    const inner = (
        <div
            className={`rounded-xl border border-gray-200 bg-white p-5 ${
                comingSoon || !to
                    ? 'opacity-60'
                    : 'cursor-pointer hover:border-gray-300 hover:shadow-sm'
            }`}
        >
            <div className="mb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    {icon}
                    <span className="font-medium text-gray-900">{title}</span>
                </div>
                {comingSoon ? (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
            Coming soon
          </span>
                ) : to ? (
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                ) : null}
            </div>
            <p className="text-sm leading-relaxed text-gray-500">{description}</p>
        </div>
    );

    if (comingSoon || !to) return inner;
    return <Link to={to}>{inner}</Link>;
}