import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
    label: string;
    to?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
    return (
        <nav className="flex flex-wrap items-center gap-2 text-sm text-gray-400">
            {items.map((item, i) => {
                const isLast = i === items.length - 1;
                return (
                    <span key={i} className="flex items-center gap-2">
            {item.to && !isLast ? (
                <Link to={item.to} className="text-gray-500 hover:text-gray-700">
                    {item.label}
                </Link>
            ) : (
                <span className={isLast ? 'text-gray-900' : 'text-gray-500'}>{item.label}</span>
            )}
                        {!isLast && <ChevronRight className="h-3.5 w-3.5" />}
          </span>
                );
            })}
        </nav>
    );
}