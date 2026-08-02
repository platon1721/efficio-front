export function StatCard({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="rounded-lg bg-gray-50 p-4">
            <div className="mb-1 text-sm text-gray-500">{label}</div>
            <div className="text-2xl font-medium text-gray-900">{value}</div>
        </div>
    );
}