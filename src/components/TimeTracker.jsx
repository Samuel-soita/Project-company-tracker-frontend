import { useState, useEffect, useCallback } from 'react';
import { timeApi } from '../api/time';
import { Clock, Trash2, Plus } from 'lucide-react';

const TimeTracker = ({ taskId }) => {
    const [logs, setLogs] = useState([]);
    const [totalHours, setTotalHours] = useState(0);
    const [loading, setLoading] = useState(true);
    const [hours, setHours] = useState('');
    const [description, setDescription] = useState('');
    const [dateLogged, setDateLogged] = useState(new Date().toISOString().split('T')[0]);

    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true);
            const response = await timeApi.getTimeLogs(taskId);
            setLogs(response.logs || []);
            setTotalHours(response.total_hours || 0);
        } catch (error) {
            console.error('Error fetching time logs:', error);
        } finally {
            setLoading(false);
        }
    }, [taskId]);

    useEffect(() => {
        if (taskId) {
            fetchLogs();
        }
    }, [taskId, fetchLogs]);

    const handleLogTime = async (e) => {
        e.preventDefault();
        if (!hours || isNaN(hours)) return;

        try {
            await timeApi.logTime(taskId, {
                hours_spent: parseFloat(hours),
                description,
                date_logged: dateLogged
            });
            setHours('');
            setDescription('');
            fetchLogs();
        } catch (error) {
            console.error('Error logging time:', error);
            alert('Failed to log time');
        }
    };

    const handleDeleteLog = async (logId) => {
        if (!window.confirm('Delete this time log?')) return;
        try {
            await timeApi.deleteTimeLog(logId);
            fetchLogs();
        } catch (error) {
            console.error('Error deleting time log:', error);
            alert('Failed to delete or you are unauthorized.');
        }
    };

    if (!taskId) return null;

    return (
        <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-md font-bold text-gray-800 flex items-center gap-2">
                    <Clock size={18} className="text-blue-600" /> Time Tracking
                </h4>
                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold border border-blue-200">
                    Total: {totalHours.toFixed(1)} hrs
                </div>
            </div>

            <form onSubmit={handleLogTime} className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Hours</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0.1"
                            value={hours}
                            onChange={(e) => setHours(e.target.value)}
                            className="w-full text-sm px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                            placeholder="e.g. 2.5"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                        <input
                            type="date"
                            value={dateLogged}
                            onChange={(e) => setDateLogged(e.target.value)}
                            className="w-full text-sm px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>
                </div>
                <div>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full text-sm px-3 py-1.5 border border-gray-300 rounded mb-3 focus:outline-none focus:border-blue-500"
                        placeholder="What did you work on? (Optional)"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-1 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition"
                >
                    <Plus size={16} /> Log Time
                </button>
            </form>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                {loading ? (
                    <p className="text-xs text-center text-gray-500">Loading...</p>
                ) : logs.length === 0 ? (
                    <p className="text-xs text-center text-gray-500 italic">No time logged yet.</p>
                ) : (
                    logs.map(log => (
                        <div key={log.id} className="flex justify-between items-start bg-white p-2 border border-gray-100 rounded text-sm">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-800">{log.hours_spent}h</span>
                                    <span className="text-xs text-gray-400">{log.date_logged} • {log.user_name}</span>
                                </div>
                                {log.description && <p className="text-xs text-gray-600 mt-1">{log.description}</p>}
                            </div>
                            <button
                                onClick={() => handleDeleteLog(log.id)}
                                className="text-red-400 hover:text-red-600 transition"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TimeTracker;
