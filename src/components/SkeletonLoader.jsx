import React from 'react';

const SkeletonLoader = ({ className = '', variant = 'default' }) => {
    const baseClasses = 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer';

    const variants = {
        default: 'h-4 rounded',
        card: 'h-32 rounded-lg',
        text: 'h-4 rounded w-3/4',
        avatar: 'h-10 w-10 rounded-full',
        button: 'h-10 rounded-lg w-24',
        title: 'h-6 rounded w-1/2',
    };

    return (
        <div
            className={`${baseClasses} ${variants[variant]} ${className}`}
            style={{
                backgroundImage: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
            }}
        />
    );
};

// Predefined skeleton components
export const ProjectCardSkeleton = () => (
    <div className="bg-white rounded-lg shadow-sm p-4 border">
        <SkeletonLoader variant="title" className="mb-2" />
        <SkeletonLoader variant="text" className="mb-3" />
        <div className="flex gap-1 mb-3">
            <SkeletonLoader className="h-6 w-16 rounded-full" />
            <SkeletonLoader className="h-6 w-20 rounded-full" />
        </div>
        <div className="flex gap-2">
            <SkeletonLoader variant="button" />
            <SkeletonLoader variant="button" />
        </div>
    </div>
);

export const DashboardSkeleton = () => (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <SkeletonLoader variant="title" />
            <SkeletonLoader variant="button" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
                <ProjectCardSkeleton key={i} />
            ))}
        </div>
    </div>
);

export const KanbanSkeleton = () => (
    <div className="flex gap-4 overflow-x-auto pb-4">
        {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg p-4 w-80 flex-shrink-0">
                <SkeletonLoader variant="title" className="mb-4" />
                <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, j) => (
                        <div key={j} className="bg-white p-4 rounded-lg shadow-sm border">
                            <SkeletonLoader variant="title" className="mb-2 w-full" />
                            <SkeletonLoader variant="text" className="mb-2" />
                            <SkeletonLoader className="h-4 w-24 rounded" />
                        </div>
                    ))}
                </div>
            </div>
        ))}
    </div>
);

export default SkeletonLoader;