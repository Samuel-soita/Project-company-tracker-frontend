import { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import { apiClient } from '../api/client';

const ActivityTimeline = ({ projectId }) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                setLoading(true);
                // The current backend route is /activities/activities, but it might not filter by project.
                // We'll fetch all and filter client-side for now, assuming activity action strings contain the project name.
                // In a true enterprise app, the backend would have a dedicated endpoint for project-specific activities.

                const res = await apiClient.get('/activities/activities');
                if (res && res.items) {
                    setActivities(res.items);
                }
            } catch (error) {
                console.error("Failed to fetch activities", error);
            } finally {
                setLoading(false);
            }
        };
        fetchActivities();
    }, [projectId]);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Activity size={20} className="text-blue-600" />
                Activity Timeline
            </h3>

            <div className="space-y-6">
                {loading ? (
                    <div className="animate-pulse space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex gap-4">
                                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : activities.length === 0 ? (
                    <p className="text-gray-500 italic text-center py-4">No recent activity.</p>
                ) : (
                    <div className="relative border-l-2 border-gray-100 ml-4 space-y-8">
                        {activities.slice(0, 10).map((activity) => ( // Show only top 10 recent
                            <div key={activity.id} className="relative pl-6">
                                {/* Timeline blip */}
                                <div className="absolute -left-[9px] top-1.5 w-4 h-4 bg-white border-2 border-blue-500 rounded-full"></div>

                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-gray-900 text-sm">
                                        {activity.user_name || 'System'}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {new Date(activity.created_at).toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600">{activity.action}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityTimeline;
