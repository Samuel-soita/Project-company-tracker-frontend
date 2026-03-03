import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectsAPI } from '../api/projects';
import { authAPI } from '../api/auth';
import { Trash2, Edit, Eye, Plus, Shield, Search } from 'lucide-react';
import CreateProjectModal from '../components/CreateProjectModal';
import InvitationNotification from '../components/InvitationNotification';
import NotificationDropdown from '../components/NotificationDropdown';

const StudentDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [ownedProjects, setOwnedProjects] = useState([]);
    const [otherProjects, setOtherProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.two_factor_enabled || false);
    const [classFilter, setClassFilter] = useState('');
    const [cohortFilter, setCohortFilter] = useState('');

    useEffect(() => {
        fetchProjects();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const response = await projectsAPI.getAll();
            const allProjects = response.items || [];

            const owned = allProjects.filter((project) => project.owner_id === user.id);

            const acceptedMemberProjects = allProjects.filter((project) => {
                if (project.owner_id === user.id) return false;
                return project.members?.some(
                    (member) => member.id === user.id && member.status === 'accepted'
                );
            });

            const myProjects = [...owned, ...acceptedMemberProjects];

            const others = allProjects.filter((project) => {
                if (project.owner_id === user.id) return false;
                const isAcceptedMember = project.members?.some(
                    (member) => member.id === user.id && member.status === 'accepted'
                );
                return !isAcceptedMember;
            });

            setOwnedProjects(myProjects);
            setOtherProjects(others);
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProject = async (projectId) => {
        if (!window.confirm('Are you sure you want to delete this project?')) return;

        try {
            await projectsAPI.delete(projectId);
            fetchProjects();
        } catch (error) {
            console.error('Error deleting project:', error);
            alert('Failed to delete project');
        }
    };

    const handleViewProject = (projectId) => navigate(`/projects/${projectId}`);
    const handleEditProject = (projectId) => navigate(`/projects/${projectId}/edit`);

    const handleToggle2FA = async () => {
        try {
            if (twoFactorEnabled) {
                await authAPI.disable2FA(user.id);
                setTwoFactorEnabled(false);
                alert('2FA has been disabled successfully');
            } else {
                await authAPI.enable2FA(user.id);
                setTwoFactorEnabled(true);
                alert('2FA enabled! You will receive a verification code via email when logging in.');
            }
        } catch (error) {
            console.error('Error toggling 2FA:', error);
            alert('Failed to toggle 2FA. Please try again.');
        }
    };

    const filterProjects = (projects) => {
        return projects.filter((project) => {
            const className = project.class?.name?.toLowerCase() || '';
            const cohortName = project.cohort?.name?.toLowerCase() || '';

            const matchesClass = !classFilter || className.includes(classFilter.toLowerCase());
            const matchesCohort = !cohortFilter || cohortName.includes(cohortFilter.toLowerCase());
            return matchesClass && matchesCohort;
        });
    };

    const filteredOwnedProjects = filterProjects(ownedProjects);
    const filteredOtherProjects = filterProjects(otherProjects);

    const ProjectCard = ({ project, canEdit = false }) => (
        <div className="glass-card p-8 flex flex-col h-full hover:neon-border-magenta group border-t-2 border-t-transparent hover:border-t-holo-magenta transition-all duration-500 relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold text-white group-hover:neon-text-magenta transition-colors line-clamp-1 truncate pr-16">{project.name}</h3>
                {project.class && (
                    <span className="absolute top-8 right-8 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-holo-magenta/10 text-holo-magenta border border-holo-magenta/30 shadow-neon-magenta">
                        {project.class.name}
                    </span>
                )}
            </div>

            {project.cover_image && (
                <div className="relative mb-6 rounded-xl overflow-hidden aspect-video border border-white/5">
                    <img
                        src={project.cover_image}
                        alt={project.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-deep-950/60 to-transparent"></div>
                </div>
            )}

            {project.owner_id !== user.id && project.owner_name && (
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-holo-cyan/20 border border-holo-cyan/30 flex-center text-[8px] font-black text-holo-cyan uppercase">
                        {project.owner_name.charAt(0)}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        OP: <span className="text-slate-300">{project.owner_name}</span>
                    </span>
                </div>
            )}

            <p className="text-slate-400 text-sm mb-6 line-clamp-2 leading-relaxed">
                {project.description || 'No system briefing available for this project node.'}
            </p>

            <div className="mt-auto space-y-6">
                {project.members && project.members.length > 0 && (
                    <div className="flex -space-x-3">
                        {project.members.slice(0, 4).map((member, index) => (
                            <div key={index} className="w-10 h-10 rounded-full bg-slate-800 border-2 border-deep-900 flex-center text-xs font-bold text-holo-magenta shadow-lg" title={member.name}>
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

                {project.github_link && (
                    <a
                        href={project.github_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-holo-cyan hover:text-white transition-colors group/link"
                    >
                        <svg className="w-4 h-4 fill-current transition-transform group-hover/link:rotate-12" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                        Source Repository
                    </a>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={() => handleViewProject(project.id)}
                        className="flex-1 flex-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-white/5 hover:border-white/20"
                    >
                        <Eye size={16} className="text-holo-magenta" />
                        Track Progress
                    </button>

                    {canEdit && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleEditProject(project.id)}
                                className="p-3 bg-white/5 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 rounded-xl transition-all border border-white/5 hover:border-blue-500/30"
                                title="Edit Project"
                            >
                                <Edit size={16} />
                            </button>
                            <button
                                onClick={() => handleDeleteProject(project.id)}
                                className="p-3 bg-white/5 hover:bg-red-500/20 text-red-500 hover:text-red-400 rounded-xl transition-all border border-white/5 hover:border-red-500/30"
                                title="Delete Project"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8">
                <div className="flex-center flex-col gap-8">
                    <div className="loader-holo"></div>
                    <p className="neon-text-magenta font-black tracking-[0.4em] text-xs animate-pulse uppercase">
                        Synchronizing Neural Uplink...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-[1600px] mx-auto min-h-screen">
            {/* Header */}
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16">
                <div>
                    <h1 className="text-4xl font-black neon-text-cyan flex items-center gap-4 tracking-tighter uppercase italic">
                        Smirror <span className="text-white">Projects</span>
                        <div className="h-1 lg:w-32 bg-holo-cyan/10 rounded-full" />
                    </h1>
                    <p className="text-slate-500 mt-2 text-xs font-black uppercase tracking-[0.2em]">
                        Welcome back, <span className="text-white">{user?.name}</span>
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 lg:bg-white/5 lg:p-2 lg:rounded-2xl lg:border lg:border-white/5">
                    <InvitationNotification />
                    <NotificationDropdown />
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
            </header>

            <main className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                {/* Search Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
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

                {/* My Projects */}
                <section className="mb-20">
                    <div className="flex-between mb-10">
                        <div>
                            <h2 className="text-3xl font-black neon-text-magenta flex items-center gap-4 tracking-tighter uppercase italic">
                                Active <span className="text-white">Projects</span>
                                <span className="text-4xl text-white bg-holo-magenta/10 px-6 py-2 rounded-2xl border border-holo-magenta/30 shadow-neon-magenta not-italic">
                                    {filteredOwnedProjects.length}
                                </span>
                            </h2>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="btn-holo btn-holo-magenta h-fit"
                        >
                            <Plus size={22} />
                            Initialize Project
                        </button>
                    </div>

                    {filteredOwnedProjects.length === 0 ? (
                        <div className="glass-card py-20 px-10 text-center flex flex-col items-center group">
                            <div className="w-20 h-20 rounded-full bg-holo-magenta/10 border border-holo-magenta/20 flex-center mb-6 group-hover:shadow-neon-magenta transition-all duration-500 overflow-hidden relative">
                                <Plus size={32} className="text-holo-magenta animate-float" />
                                <div className="absolute inset-0 bg-holo-magenta/5 animate-ping" />
                            </div>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-8">No projects detected in this sector.</p>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="btn-holo btn-holo-magenta px-10"
                            >
                                Create Your First Project
                            </button>
                        </div>
                    ) : (
                        <div className="bento-grid">
                            {filteredOwnedProjects.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    canEdit={project.owner_id === user.id}
                                />
                            ))}
                        </div>
                    )}
                </section>

                {/* Other Projects */}
                <section>
                    <div className="mb-10">
                        <h2 className="text-3xl font-black neon-text-cyan flex items-center gap-4 tracking-tighter uppercase italic">
                            Global <span className="text-white">Stream</span>
                        </h2>
                        <p className="text-slate-500 mt-2 text-xs font-black uppercase tracking-[0.2em]">Synchronizing telemetry from all matrix sectors</p>
                    </div>

                    {filteredOtherProjects.length === 0 ? (
                        <div className="glass-card py-16 px-10 text-center flex flex-col items-center">
                            <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">No external data streams available.</p>
                        </div>
                    ) : (
                        <div className="bento-grid">
                            {filteredOtherProjects.map((project) => (
                                <ProjectCard key={project.id} project={project} canEdit={false} />
                            ))}
                        </div>
                    )}
                </section>
            </main>

            {showCreateModal && (
                <CreateProjectModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        fetchProjects();
                    }}
                />
            )}
        </div>
    );
};

export default StudentDashboard;
