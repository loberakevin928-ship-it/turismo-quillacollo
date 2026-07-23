const SkeletonCard = ({ rows = 3 }) => {
    return (
        <div className="animate-pulse bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
            </div>
            {rows > 1 && (
                <div className="mt-3 space-y-2">
                    {Array.from({ length: rows - 1 }).map((_, i) => (
                        <div key={i} className="h-3 bg-gray-200 rounded w-full"></div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SkeletonCard;