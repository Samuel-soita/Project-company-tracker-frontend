import { useState, useEffect, useCallback } from 'react';
import { Calendar, AlertCircle } from 'lucide-react';
import { tasksAPI } from '../api/tasks';

const CalendarView = ({ projectId }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTasks = useCallback(async () => {
        try {
            setLoading(true);
            const response = await tasksAPI.getByProject(projectId);
            setTasks(response.tasks || []);
        } catch (error) {
            console.error('Error fetching tasks for calendar:', error);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    // Group tasks by upcoming dates
    const groupedTasks = {
        Overdue: [],
        Today: [],
        ThisWeek: [],
        Upcoming: [],
        NoDate: []
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    tasks.forEach(task => {
        if (task.status === 'Done') return; // Skip completed tasks

        if (!task.due_date) {
            groupedTasks.NoDate.push(task);
            return;
        }

        const dueDate = new Date(task.due_date);
        dueDate.setHours(0, 0, 0, 0);

        if (dueDate < today) {
            groupedTasks.Overdue.push(task);
        } else if (dueDate.getTime() === today.getTime()) {
            groupedTasks.Today.push(task);
        } else if (dueDate < nextWeek) {
            groupedTasks.ThisWeek.push(task);
        } else {
            groupedTasks.Upcoming.push(task);
        }
    });

    if (loading) {
        return <div className="p-4 text-center">Loading Calendar...</div>;
    }

    const renderTaskGroup = (title, taskList, colorClass) => {
        if (taskList.length === 0) return null;

        return (
            <div className="mb-6">
                <h4 className={`text-sm font-bold uppercase tracking-wider mb-3 ${colorClass}`}>{title}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {taskList.map(task => (
                        <div key={task.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition">
                            <h5 className="font-semibold text-gray-800 mb-1 leading-tight">{task.title}</h5>
                            <div className="flex justify-between items-end mt-3">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${task.priority === 'Urgent' ? 'bg-red-100 text-red-800' :
                                        task.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                                            'bg-gray-100 text-gray-800'
                                    }`}>
                                    {task.priority || 'Medium'}
                                </span>
                                {task.due_date && (
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <Calendar size={12} />
                                        {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-4">
                <Calendar className="text-indigo-600" size={24} />
                <h3 className="text-xl font-bold text-gray-800">Task Calendar View</h3>
            </div>

            {groupedTasks.Overdue.length > 0 && renderTaskGroup('⚠️ Overdue', groupedTasks.Overdue, 'text-red-600')}
            {renderTaskGroup('🕒 Due Today', groupedTasks.Today, 'text-orange-600')}
            {renderTaskGroup('📅 This Week', groupedTasks.ThisWeek, 'text-blue-600')}
            {renderTaskGroup('🗓️ Upcoming', groupedTasks.Upcoming, 'text-gray-600')}
            {renderTaskGroup('📝 No Due Date', groupedTasks.NoDate, 'text-gray-400')}

            {tasks.filter(t => t.status !== 'Done').length === 0 && (
                <div className="text-center py-10">
                    <AlertCircle className="mx-auto text-gray-300 mb-2" size={32} />
                    <p className="text-gray-500">No pending tasks found for this project.</p>
                </div>
            )}
        </div>
    );
};

export default CalendarView;
