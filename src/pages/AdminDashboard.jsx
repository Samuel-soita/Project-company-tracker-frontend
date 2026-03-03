import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectsAPI } from '../api/projects';
import { cohortsAPI } from '../api/cohorts';
import { classesAPI } from '../api/classes';
import { dashboardApi } from '../api/dashboard';
import { authAPI } from '../api/auth';
import { Plus, Edit, Trash2, Eye, Shield, Search, TrendingUp } from 'lucide-react';
import CreateProjectModal from '../components/CreateProjectModal';
import NotificationDropdown from '../components/NotificationDropdown';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('projects');
    const [projects, setProjects] = useState([]);
    const [cohorts, setCohorts] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [showCohortModal, setShowCohortModal] = useState(false);
    const [showClassModal, setShowClassModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.two_factor_enabled || false);
    const [classFilter, setClassFilter] = useState('');
    const [cohortFilter, setCohortFilter] = useState('');

    // Analytics state
    const [analytics, setAnalytics] = useState({
        summary: null,
        status: [],
        teams: [],
        tasks: []
    });

    const tabs = [
        { id: 'projects', label: 'Projects', icon: <Eye size={16} /> },
        { id: 'teams', label: 'Teams', icon: <Plus size={16} /> },
        { id: 'project-types', label: 'Project Types', icon: <Shield size={16} /> },
        { id: 'analytics', label: 'Analytics', icon: <TrendingUp size={16} /> },
    ];

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            if (activeTab === 'projects') {
                const response = await projectsAPI.getAll();
                setProjects(response.items || []);
            } else if (activeTab === 'teams') {
                const response = await cohortsAPI.getAll();
                setCohorts(response.items || []);
            } else if (activeTab === 'project-types') {
                const response = await classesAPI.getAll();
                setClasses(Array.isArray(response) ? response : []);
            } else if (activeTab === 'analytics') {
                const [summaryObj, statusArr, teamsArr, tasksArr] = await Promise.all([
                    dashboardApi.getManagerSummary(),
                    dashboardApi.getProjectsByStatus(),
                    dashboardApi.getProjectsByTeam(),
                    dashboardApi.getTaskProductivity()
                ]);
                setAnalytics({
                    summary: summaryObj,
                    status: statusArr.data || [],
                    teams: teamsArr.data || [],
                    tasks: tasksArr.data || []
                });
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDeleteProject = async (id) => {
        if (!window.confirm('Are you sure you want to delete this project?')) return;
        try {
            await projectsAPI.delete(id);
            fetchData();
        } catch (error) {
            console.error('Error deleting project:', error);
        }
    };

    const handleDeleteCohort = async (id) => {
        if (!window.confirm('Are you sure you want to delete this cohort?')) return;
        try {
            await cohortsAPI.delete(id);
            fetchData();
        } catch (error) {
            console.error('Error deleting cohort:', error);
        }
    };

    const handleDeleteClass = async (id) => {
        if (!window.confirm('Are you sure you want to delete this class?')) return;
        try {
            await classesAPI.delete(id);
            fetchData();
        } catch (error) {
            console.error('Error deleting class:', error);
        }
    };

    const handleToggle2FA = async () => {
        try {
            if (twoFactorEnabled) {
                // Disable 2FA
                await authAPI.disable2FA(user.id);
                setTwoFactorEnabled(false);
                alert('2FA has been disabled successfully');
            } else {
                // Enable 2FA
                await authAPI.enable2FA(user.id);
                setTwoFactorEnabled(true);
                alert('2FA enabled! You will receive a verification code via email when logging in.');
            }
        } catch (error) {
            console.error('Error toggling 2FA:', error);
            alert('Failed to toggle 2FA. Please try again.');
        }
    };

    // Filter projects based on class and cohort filters
    const filterProjects = () => {
        return projects.filter((project) => {
            const className = project.class?.name?.toLowerCase() || '';
            const cohortName = project.cohort?.name?.toLowerCase() || '';

            const matchesClass = !classFilter || className.includes(classFilter.toLowerCase());
            const matchesCohort = !cohortFilter || cohortName.includes(cohortFilter.toLowerCase());
            return matchesClass && matchesCohort;
        });
    };

    const filteredProjects = filterProjects();

    const ProjectsTab = () => (
        <div className="space-y-6">
            <div className="flex-between">
                <div>
                    <h2 className="text-3xl font-black neon-text-cyan flex items-center gap-4 tracking-tighter uppercase italic">
                        Project <span className="text-white">Overview</span>
                        <span className="text-4xl text-white bg-holo-cyan/10 px-6 py-2 rounded-2xl border border-holo-cyan/30 shadow-neon-cyan not-italic">
                            {filteredProjects.length}
                        </span>
                    </h2>
                </div>
                <button
                    onClick={() => setShowProjectModal(true)}
                    className="btn-holo"
                >
                    <Plus size={22} />
                    Initialize Project
                </button>
            </div>

            {/* Search Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search size={18} className="text-slate-500 group-focus-within:text-holo-cyan transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Filter by class name..."
                        value={classFilter}
                        onChange={(e) => setClassFilter(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:neon-border-cyan transition-all placeholder-slate-600 text-slate-200"
                    />
                </div>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search size={18} className="text-slate-500 group-focus-within:text-holo-magenta transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Filter by cohort name..."
                        value={cohortFilter}
                        onChange={(e) => setCohortFilter(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-holo-magenta/50 focus:shadow-[0_0_15px_rgba(255,0,255,0.2)] transition-all placeholder-slate-600 text-slate-200"
                    />
                </div>
            </div>

            <div className="bento-grid">
                {filteredProjects.map((project) => (
                    <div key={project.id} className="glass-card p-8 flex flex-col h-full hover:neon-border-cyan group border-t-2 border-t-transparent hover:border-t-holo-cyan transition-all duration-500">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-xl font-bold text-white group-hover:neon-text-cyan transition-colors line-clamp-1">{project.name}</h3>
                            {project.class && (
                                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-holo-cyan/10 text-holo-cyan border border-holo-cyan/30 shadow-neon-cyan">
                                    {project.class.name}
                                </span>
                            )}
                        </div>

                        <p className="text-slate-400 text-sm mb-6 line-clamp-3 leading-relaxed">
                            {project.description || 'No system briefing available for this project node.'}
                        </p>

                        <div className="mt-auto space-y-6">
                            {project.members && project.members.length > 0 && (
                                <div className="flex -space-x-3">
                                    {project.members.slice(0, 4).map((member, index) => (
                                        <div key={index} className="w-10 h-10 rounded-full bg-slate-800 border-2 border-deep-900 flex-center text-xs font-bold text-holo-cyan shadow-lg" title={member.name}>
                                            {member.name.charAt(0)}
                                        </div>
                                    ))}
                                    {project.members.length > 4 && (
                                        <div className="w-10 h-10 rounded-full bg-white/5 border-2 border-deep-900 flex-center text-[10px] font-bold text-slate-400 backdrop-blur-sm">
                                            +{project.members.length - 4}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => navigate(`/projects/${project.id}`)}
                                    className="flex-1 flex-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all border border-white/5 hover:border-white/20"
                                >
                                    <Eye size={16} className="text-holo-cyan" />
                                    Sync
                                </button>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setEditingItem(project);
                                            setShowProjectModal(true);
                                        }}
                                        className="p-2.5 bg-white/5 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 rounded-xl transition-all border border-white/5 hover:border-blue-500/30"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteProject(project.id)}
                                        className="p-2.5 bg-white/5 hover:bg-red-500/20 text-red-500 hover:text-red-400 rounded-xl transition-all border border-white/5 hover:border-red-500/30"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const TeamsTab = () => (
        <div className="space-y-6">
            <div className="flex-between">
                <div>
                    <h2 className="text-3xl font-black neon-text-magenta flex items-center gap-4 tracking-tighter uppercase italic">
                        Team <span className="text-white">Sectors</span>
                        <span className="text-4xl text-white bg-holo-magenta/10 px-6 py-2 rounded-2xl border border-holo-magenta/30 shadow-neon-magenta not-italic">
                            {cohorts.length}
                        </span>
                    </h2>
                </div>
                <button
                    onClick={() => setShowCohortModal(true)}
                    className="btn-holo btn-holo-magenta"
                >
                    <Plus size={22} />
                    Create New Team
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {cohorts.map((cohort) => (
                    <div key={cohort.id} className="glass-card p-8 hover:neon-border-magenta group border-l-4 border-l-transparent hover:border-l-holo-magenta transition-all duration-500">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <h3 className="text-2xl font-black text-white mb-6 group-hover:neon-text-magenta transition-colors tracking-tight uppercase">
                                    {cohort.name}
                                </h3>
                                <div className="space-y-4">
                                    {cohort.start_date && (
                                        <div className="flex items-center gap-4">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 w-24">Deployment</span>
                                            <span className="text-sm font-bold text-slate-200 bg-white/5 px-3 py-1 rounded-lg border border-white/5">{new Date(cohort.start_date).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                    {cohort.end_date && (
                                        <div className="flex items-center gap-4">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 w-24">Decommission</span>
                                            <span className="text-sm font-bold text-slate-200 bg-white/5 px-3 py-1 rounded-lg border border-white/5">{new Date(cohort.end_date).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => {
                                        setEditingItem(cohort);
                                        setShowCohortModal(true);
                                    }}
                                    className="p-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-holo-magenta rounded-xl border border-white/5 hover:border-holo-magenta/30 transition-all shadow-lg"
                                >
                                    <Edit size={20} />
                                </button>
                                <button
                                    onClick={() => handleDeleteCohort(cohort.id)}
                                    className="p-3 bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-xl border border-white/5 hover:border-red-500/30 transition-all shadow-lg"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const ProjectTypesTab = () => (
        <div className="space-y-6">
            <div className="flex-between">
                <div>
                    <h2 className="text-3xl font-black neon-text-cyan flex items-center gap-4 tracking-tighter uppercase italic">
                        Project <span className="text-white">Catalog</span>
                        <span className="text-4xl text-white bg-holo-cyan/10 px-6 py-2 rounded-2xl border border-holo-cyan/30 shadow-neon-cyan not-italic">
                            {classes.length}
                        </span>
                    </h2>
                </div>
                <button
                    onClick={() => setShowClassModal(true)}
                    className="btn-holo"
                >
                    <Plus size={22} />
                    New Project Type
                </button>
            </div>

            <div className="bento-grid">
                {classes.map((classItem) => (
                    <div key={classItem.id} className="glass-card p-6 hover:shadow-neon-cyan transition-all duration-300 border-l-4 border-l-holo-cyan">
                        <div className="flex-between mb-4">
                            <h3 className="text-xl font-bold text-white uppercase tracking-wider">{classItem.name}</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setEditingItem(classItem);
                                        setShowClassModal(true);
                                    }}
                                    className="p-2 glass-card hover:border-holo-cyan transition-all text-slate-400 hover:text-holo-cyan"
                                >
                                    <Edit size={14} />
                                </button>
                                <button
                                    onClick={() => handleDeleteClass(classItem.id)}
                                    className="p-2 glass-card hover:border-red-500 transition-all text-slate-400 hover:text-red-500"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                        <p className="text-slate-400 leading-relaxed italic">
                            {classItem.description || 'No system parameters defined.'}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );

    const AnalyticsTab = () => (
        <div className="space-y-10">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-holo-magenta/10 flex-center border border-holo-magenta/30 shadow-neon-magenta text-holo-magenta animate-pulse">
                    <TrendingUp size={24} />
                </div>
                <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                    Performance <span className="text-holo-magenta">Insight</span>
                </h2>
            </div>

            {/* Quick Stats Bento */}
            {analytics.summary && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="glass-card p-10 flex flex-col items-center hover:shadow-neon-cyan group">
                        <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mb-6 group-hover:text-holo-cyan transition-colors">Active Projects</span>
                        <span className="text-7xl font-black text-white neon-text-cyan">{analytics.summary.totalProjects}</span>
                        <div className="mt-6 w-12 h-1 bg-holo-cyan/20 rounded-full group-hover:w-24 group-hover:bg-holo-cyan/50 transition-all duration-500" />
                    </div>
                    <div className="glass-card p-10 flex flex-col items-center border-t-2 border-t-holo-magenta hover:shadow-neon-magenta group">
                        <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mb-6 group-hover:text-holo-magenta transition-colors">Total Operations</span>
                        <span className="text-7xl font-black text-white neon-text-magenta">{analytics.summary.totalTasks}</span>
                        <div className="mt-6 w-12 h-1 bg-holo-magenta/20 rounded-full group-hover:w-24 group-hover:bg-holo-magenta/50 transition-all duration-500" />
                    </div>
                    <div className="glass-card p-10 flex flex-col items-center border-b-2 border-b-white/10 hover:neon-border-cyan group">
                        <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mb-6 group-hover:text-white transition-colors">Current Sprints</span>
                        <span className="text-7xl font-black text-white">{analytics.summary.activeSprints}</span>
                        <div className="mt-6 w-12 h-1 bg-white/10 rounded-full group-hover:w-24 group-hover:bg-white/30 transition-all duration-500" />
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Projects by Status */}
                <div className="glass-card p-8 lg:col-span-1 border-t-4 border-holo-cyan">
                    <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-holo-cyan shadow-neon-cyan" />
                        Status Distribution
                    </h3>
                    <div className="space-y-6">
                        {analytics.status.length > 0 ? analytics.status.map((item, idx) => (
                            <div key={idx} className="group">
                                <div className="flex-between text-xs font-bold uppercase tracking-widest mb-2">
                                    <span className="text-slate-400 group-hover:text-holo-cyan transition-colors">{item.name}</span>
                                    <span className="text-white">{item.value}</span>
                                </div>
                                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${item.name === 'Completed' ? 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]' : 'bg-holo-cyan shadow-neon-cyan'
                                            }`}
                                        style={{ width: `${Math.min(100, item.value * 10)}%` }}
                                    ></div>
                                </div>
                            </div>
                        )) : <p className="text-xs text-slate-500 italic">No telemetry data...</p>}
                    </div>
                </div>

                {/* Projects by Team */}
                <div className="glass-card p-8 lg:col-span-1 border-t-4 border-holo-magenta">
                    <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-holo-magenta shadow-neon-magenta" />
                        Vector performance
                    </h3>
                    <div className="space-y-6">
                        {analytics.teams.length > 0 ? analytics.teams.map((item, idx) => (
                            <div key={idx} className="group">
                                <div className="flex-between text-xs font-bold uppercase tracking-widest mb-2">
                                    <span className="text-slate-400 group-hover:text-holo-magenta transition-colors">{item.name}</span>
                                    <span className="text-white">{item.value}</span>
                                </div>
                                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-holo-magenta shadow-neon-magenta transition-all duration-1000"
                                        style={{ width: `${Math.min(100, (item.value / (analytics.summary?.totalProjects || 10)) * 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        )) : <p className="text-xs text-slate-500 italic">No telemetry data...</p>}
                    </div>
                </div>

                {/* Task Productivity */}
                <div className="glass-card p-8 lg:col-span-1 border-t-4 border-slate-500">
                    <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-slate-400 shadow-lg" />
                        Operation Velocity
                    </h3>
                    <div className="space-y-6">
                        {analytics.tasks.length > 0 ? analytics.tasks.map((item, idx) => (
                            <div key={idx} className="group">
                                <div className="flex-between text-xs font-bold uppercase tracking-widest mb-2">
                                    <span className="text-slate-400 group-hover:text-white transition-colors">{item.name}</span>
                                    <span className="text-white">{item.value}</span>
                                </div>
                                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${item.name === 'Done' ? 'bg-emerald-400' : item.name === 'In Progress' ? 'bg-blue-400' : 'bg-slate-500'
                                            }`}
                                        style={{ width: `${Math.min(100, item.value * 5)}%` }}
                                    ></div>
                                </div>
                            </div>
                        )) : <p className="text-xs text-slate-500 italic">No telemetry data...</p>}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-8 max-w-[1600px] mx-auto min-h-screen">
            {/* Action Bar & Tabs */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16">
                <div className="flex-center gap-4 p-2 bg-white/5 backdrop-blur-md rounded-2xl border border-white/5">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center gap-3 ${activeTab === tab.id
                                ? 'bg-holo-cyan text-deep-950 shadow-neon-cyan scale-105'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {tab.icon && <span>{tab.icon}</span>}
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleToggle2FA}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all duration-500 border ${twoFactorEnabled
                            ? 'border-green-500/50 text-green-400 bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.2)]'
                            : 'border-white/10 text-slate-400 bg-white/5 hover:border-holo-cyan/50 hover:text-holo-cyan'
                            }`}
                    >
                        <Shield size={14} />
                        {twoFactorEnabled ? '2FA ACTIVE' : 'SECURE OPS'}
                    </button>

                    <button
                        onClick={logout}
                        className="px-6 py-3 bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-xl border border-white/5 hover:border-red-500/30 font-black text-[10px] uppercase tracking-widest transition-all"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Content Container */}
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                {loading ? (
                    <div className="flex-center flex-col py-48 gap-8">
                        <div className="loader-holo"></div>
                        <p className="neon-text-cyan font-black tracking-[0.4em] text-xs animate-pulse uppercase">
                            Synchronizing Core Systems...
                        </p>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {activeTab === 'projects' && <ProjectsTab />}
                        {activeTab === 'teams' && <TeamsTab />}
                        {activeTab === 'project-types' && <ProjectTypesTab />}
                        {activeTab === 'analytics' && <AnalyticsTab />}
                    </div>
                )}
            </div>

            {/* Modals */}
            {showProjectModal && (
                <CreateProjectModal
                    project={editingItem}
                    onClose={() => {
                        setShowProjectModal(false);
                        setEditingItem(null);
                    }}
                    onSuccess={() => {
                        setShowProjectModal(false);
                        setEditingItem(null);
                        fetchData();
                    }}
                />
            )}

            {showCohortModal && (
                <CohortModal
                    cohort={editingItem}
                    onClose={() => {
                        setShowCohortModal(false);
                        setEditingItem(null);
                    }}
                    onSuccess={() => {
                        setShowCohortModal(false);
                        setEditingItem(null);
                        fetchData();
                    }}
                />
            )}

            {showClassModal && (
                <ClassModal
                    classItem={editingItem}
                    onClose={() => {
                        setShowClassModal(false);
                        setEditingItem(null);
                    }}
                    onSuccess={() => {
                        setShowClassModal(false);
                        setEditingItem(null);
                        fetchData();
                    }}
                />
            )}
        </div>
    );
};

// Cohort Modal Component
const CohortModal = ({ cohort, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: cohort?.name || '',
        start_date: cohort?.start_date || '',
        end_date: cohort?.end_date || '',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (cohort) {
                await cohortsAPI.update(cohort.id, formData);
            } else {
                await cohortsAPI.create(formData);
            }
            onSuccess();
        } catch (error) {
            console.error('Error saving cohort:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-deep-950/80 backdrop-blur-xl flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
            <div className="glass-card w-full max-w-md border-holo-magenta/20 shadow-neon-magenta/20">
                <div className="p-8">
                    <h2 className="text-3xl font-black mb-8 neon-text-magenta uppercase tracking-tighter italic">
                        {cohort ? 'Modify' : 'Initialize'} <span className="text-white">Team</span>
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">
                                Designation
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:neon-border-magenta transition-all placeholder-slate-600"
                                placeholder="e.g. ALPHA-V4"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.start_date}
                                    onChange={(e) =>
                                        setFormData({ ...formData, start_date: e.target.value })
                                    }
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:neon-border-magenta transition-all color-scheme-dark"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.end_date}
                                    onChange={(e) =>
                                        setFormData({ ...formData, end_date: e.target.value })
                                    }
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:neon-border-magenta transition-all color-scheme-dark"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-6 py-3 bg-white/5 text-slate-400 font-bold rounded-xl hover:bg-white/10 transition-all uppercase tracking-widest text-xs border border-white/5"
                            >
                                Abort
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 btn-holo btn-holo-magenta py-3 shadow-lg"
                            >
                                {loading ? 'Processing...' : cohort ? 'Update' : 'Commit'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Class Modal Component
const ClassModal = ({ classItem, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: classItem?.name || '',
        description: classItem?.description || '',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (classItem) {
                await classesAPI.update(classItem.id, formData);
            } else {
                await classesAPI.create(formData);
            }
            onSuccess();
        } catch (error) {
            console.error('Error saving class:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-deep-950/80 backdrop-blur-xl flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
            <div className="glass-card w-full max-w-md border-holo-cyan/20 shadow-neon-cyan/20">
                <div className="p-8">
                    <h2 className="text-3xl font-black mb-8 neon-text-cyan uppercase tracking-tighter italic">
                        {classItem ? 'Modify' : 'Define'} <span className="text-white">Category</span>
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">
                                Designation
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:neon-border-cyan transition-all placeholder-slate-600 font-bold"
                                placeholder="e.g. SE-06"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">
                                Category Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                rows={4}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:neon-border-cyan transition-all placeholder-slate-600 resize-none leading-relaxed"
                                placeholder="Describe the project type parameters..."
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-6 py-3 bg-white/5 text-slate-400 font-bold rounded-xl hover:bg-white/10 transition-all uppercase tracking-widest text-xs border border-white/5"
                            >
                                Abort
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 btn-holo py-3 shadow-lg"
                            >
                                {loading ? 'Processing...' : classItem ? 'Update' : 'Commit'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;