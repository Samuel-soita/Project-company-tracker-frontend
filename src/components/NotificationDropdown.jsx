import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { notificationsApi } from '../api/notifications';
import { useNavigate } from 'react-router-dom';

const NotificationDropdown = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        try {
            const data = await notificationsApi.getNotifications();
            setNotifications(data.notifications || []);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleRead = async (id, link) => {
        try {
            await notificationsApi.markAsRead(id);
            fetchNotifications();
            setIsOpen(false);
            if (link) {
                navigate(link);
            }
        } catch (error) {
            console.error('Failed to mark notification as read', error);
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800">Notifications</h3>
                        {unreadCount > 0 && (
                            <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full">
                                {unreadCount} new
                            </span>
                        )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">
                                <Bell className="mx-auto mb-2 opacity-20" size={32} />
                                <p className="text-sm">You have no notifications</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        onClick={() => handleRead(n.id, n.link)}
                                        className={`p-4 hover:bg-gray-50 cursor-pointer transition ${!n.is_read ? 'bg-blue-50/30' : ''}`}
                                    >
                                        <div className="flex gap-3">
                                            <div className="flex-1">
                                                <p className={`text-sm ${!n.is_read ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                                                    {n.message}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {new Date(n.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                            {!n.is_read && (
                                                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
