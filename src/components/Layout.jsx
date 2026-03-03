import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    FolderKanban,
    Users,
    Settings,
    LogOut,
    Bell,
    ChevronLeft,
    ChevronRight,
    Terminal,
    Layers
} from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';

const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const menuItems = [
        { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} />, role: ['Manager', 'Employee'] },
        { name: 'Projects', path: '/projects', icon: <FolderKanban size={20} />, role: ['Manager', 'Employee'] },
        { name: 'Teams', path: '/manager', icon: <Users size={20} />, role: ['Manager'] },
        { name: 'Settings', path: '/settings', icon: <Settings size={20} />, role: ['Manager', 'Employee'] },
    ];

    const filteredMenu = menuItems.filter(item => item.role.includes(user?.role));

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen w-full bg-[#020617] text-slate-200 overflow-hidden font-sans">
            {/* Holographic Sidebar */}
            <aside
                className={`glass-nav h-full transition-all duration-500 ease-in-out flex flex-col z-50 ${isSidebarOpen ? 'w-64' : 'w-20'
                    }`}
            >
                {/* Logo Section */}
                <div className="p-6 flex items-center gap-3 border-b border-white/10">
                    <div className="w-10 h-10 bg-gradient-to-tr from-holo-cyan to-holo-magenta rounded-xl flex-center neon-border-cyan animate-pulse">
                        <Terminal className="text-deep-950" size={24} />
                    </div>
                    {isSidebarOpen && (
                        <span className="font-bold text-xl tracking-tighter neon-text-cyan">
                            SMIRROR<span className="text-white">PROJECTS</span>
                        </span>
                    )}
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 px-4 py-8 space-y-4">
                    {filteredMenu.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group ${isActive
                                    ? 'bg-holo-cyan/10 text-holo-cyan border border-holo-cyan/20 neon-border-cyan'
                                    : 'hover:bg-white/5 text-slate-400 hover:text-white'
                                    }`}
                            >
                                <div className={`${isActive ? 'neon-text-cyan' : 'group-hover:text-holo-cyan transition-colors'}`}>
                                    {item.icon}
                                </div>
                                {isSidebarOpen && (
                                    <span className="font-medium tracking-wide">{item.name}</span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Section & Logout */}
                <div className="p-4 border-t border-white/10 space-y-4">
                    {isSidebarOpen && (
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex-center overflow-hidden">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name)}&background=random`}
                                    alt="User"
                                />
                            </div>
                            <div className="flex flex-col overflow-hidden">
                                <span className="font-semibold text-sm truncate">{user?.name}</span>
                                <span className="text-xs text-slate-500 uppercase tracking-widest">{user?.role}</span>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 text-slate-400 hover:text-red-400 hover:bg-red-500/10 ${!isSidebarOpen && 'justify-center'
                            }`}
                    >
                        <LogOut size={20} />
                        {isSidebarOpen && <span className="font-medium">Logout</span>}
                    </button>
                </div>

                {/* Sidebar Toggle */}
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="absolute -right-3 top-24 w-6 h-12 bg-holo-cyan/20 backdrop-blur-md border border-holo-cyan/30 rounded-full flex-center text-holo-cyan hover:bg-holo-cyan hover:text-deep-950 transition-all z-50 transform hover:scale-110 shadow-neon-cyan"
                >
                    {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                </button>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-[#020617] relative">
                {/* Global Background Glows */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-holo-cyan/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-holo-magenta/5 rounded-full blur-[120px] pointer-events-none" />

                {/* Top Navbar */}
                <header className="h-20 flex-between px-8 border-b border-white/10 sticky top-0 z-40 bg-slate-950/50 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <Layers className="text-holo-magenta animate-pulse" size={24} />
                        <h2 className="text-lg font-bold tracking-widest text-white uppercase">
                            Smirror <span className="text-holo-magenta">Limited</span>
                        </h2>
                    </div>

                    <div className="flex items-center gap-6">
                        <NotificationDropdown />
                        <button className="flex-center w-10 h-10 rounded-full glass-card hover:neon-border-cyan transition-all group">
                            <Settings size={18} className="text-slate-400 group-hover:text-holo-cyan transition-colors" />
                        </button>
                    </div>
                </header>

                {/* Viewport Wrapper */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-8 custom-scrollbar">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
