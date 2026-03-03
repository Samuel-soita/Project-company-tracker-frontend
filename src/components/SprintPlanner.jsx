import { useState, useEffect, useCallback } from 'react';
import { sprintApi } from '../api/sprints';
import { Plus, Settings, CheckCircle } from 'lucide-react';

const SprintPlanner = ({ projectId }) => {
    const [sprints, setSprints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showSprintModal, setShowSprintModal] = useState(false);
    const [sprintName, setSprintName] = useState('');

    const fetchSprints = useCallback(async () => {
        try {
            setLoading(true);
            const response = await sprintApi.getSprints(projectId);
            setSprints(response.sprints || []);
        } catch (error) {
            console.error('Error fetching sprints:', error);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchSprints();
    }, [fetchSprints]);

    const handleCreateSprint = async (e) => {
        e.preventDefault();
        if (!sprintName.trim()) return;

        try {
            await sprintApi.createSprint(projectId, { name: sprintName });
            setSprintName('');
            setShowSprintModal(false);
            fetchSprints();
        } catch (error) {
            console.error('Error creating sprint:', error);
        }
    };

    if (loading) {
        return <div className="p-4 text-center">Loading Sprints...</div>;
    }

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Sprint Planner</h2>
                    <p className="text-gray-500 text-sm">Organize tasks into iterations</p>
                </div>
                <button
                    onClick={() => setShowSprintModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                    <Plus size={18} /> Add Sprint
                </button>
            </div>

            <div className="space-y-6">
                {sprints.map((sprint) => (
                    <div key={sprint.id} className="border border-gray-200 rounded-lg p-5 hover:border-indigo-300 transition">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-lg text-gray-800 tracking-wide">{sprint.name}</h3>
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${sprint.status === 'Active' ? 'bg-green-100 text-green-700' :
                                sprint.status === 'Completed' ? 'bg-gray-100 text-gray-700' :
                                    'bg-blue-100 text-blue-700'
                                }`}>
                                {sprint.status}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {sprint.tasks && sprint.tasks.length > 0 ? (
                                sprint.tasks.map(task => (
                                    <div key={task.id} className="bg-gray-50 p-3 rounded border border-gray-100 flex items-center gap-3">
                                        <CheckCircle size={16} className={task.status === 'Done' ? 'text-green-500' : 'text-gray-400'} />
                                        <span className={`text-sm ${task.status === 'Done' ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                                            {task.title}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-400 italic">No tasks assigned to this sprint.</p>
                            )}
                        </div>
                    </div>
                ))}

                {sprints.length === 0 && (
                    <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <p className="text-gray-500">No sprints created yet.</p>
                        <button
                            onClick={() => setShowSprintModal(true)}
                            className="text-indigo-600 font-medium mt-2 hover:underline"
                        >
                            Create your first sprint
                        </button>
                    </div>
                )}
            </div>

            {/* Create Sprint Modal */}
            {showSprintModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-bold mb-4">Create New Sprint</h3>
                        <form onSubmit={handleCreateSprint}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sprint Name</label>
                                <input
                                    type="text"
                                    value={sprintName}
                                    onChange={(e) => setSprintName(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    placeholder="e.g. Sprint 1, Beta Release"
                                    required
                                />
                            </div>
                            <div className="flex gap-3 justify-end mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowSprintModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                                >
                                    Create Sprint
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SprintPlanner;
