import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectsAPI } from '../api/projects';
import { membersAPI } from '../api/members';
import { ArrowLeft, Edit, Trash2, X, UserPlus, Shield } from 'lucide-react';
import KanbanBoard from '../components/KanbanBoard';
import CommentSection from '../components/CommentSection';
import AttachmentList from '../components/AttachmentList';
import ActivityTimeline from '../components/ActivityTimeline';
import SprintPlanner from '../components/SprintPlanner';
import CalendarView from '../components/CalendarView';
import { sprintApi } from '../api/sprints';
import NotificationDropdown from '../components/NotificationDropdown';

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isManager } = useAuth();
    const [project, setProject] = useState(null);
    const [sprints, setSprints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Workspace');
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('collaborator');

    const fetchProject = useCallback(async () => {
        try {
            setLoading(true);
            const response = await projectsAPI.getById(id);
            setProject(response.project);

            // Fetch sprints for this project
            try {
                const sprintRes = await sprintApi.getSprints(id);
                setSprints(sprintRes.sprints || []);
            } catch (err) {
                console.warn('Could not fetch sprints', err);
            }

        } catch (error) {
            console.error('Error fetching project:', error);
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchProject();
    }, [fetchProject]);

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this project?')) return;

        try {
            await projectsAPI.delete(id);
            navigate('/dashboard');
        } catch (error) {
            console.error('Error deleting project:', error);
            alert('Failed to delete project');
        }
    };

    const handleRemoveMember = async (userId, memberName) => {
        if (!window.confirm(`Are you sure you want to remove ${memberName} from this project?`)) return;

        try {
            await membersAPI.remove(id, userId);
            fetchProject();
        } catch (error) {
            console.error('Error removing member:', error);
            alert('Failed to remove member');
        }
    };

    const handleInviteMember = async (e) => {
        e.preventDefault();
        try {
            await membersAPI.invite(id, { email: inviteEmail, role: inviteRole });
            setInviteEmail('');
            setShowInviteModal(false);
            fetchProject();
            alert('Invitation sent!');
        } catch (error) {
            console.error('Error inviting member:', error);
            alert('Failed to invite member. They may already be in the project.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8">
                <div className="flex-center flex-col gap-8">
                    <div className="loader-holo"></div>
                    <p className="neon-text-cyan font-black tracking-[0.4em] text-xs animate-pulse uppercase">
                        Synchronizing Terminal Data...
                    </p>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8">
                <div className="glass-card p-12 text-center max-w-md">
                    <X size={48} className="text-red-500 mx-auto mb-6 animate-pulse" />
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4">Project Not Found</h2>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-8">The requested project could not be located in the system.</p>
                    <button onClick={() => navigate('/dashboard')} className="btn-holo w-full">Return to HUB</button>
                </div>
            </div>
        );
    }

    const isOwner = project.owner_id === user?.id;
    const canEdit = isOwner || isManager();

    // Check if user is an accepted member
    const isAcceptedMember = project.members?.some(
        (member) => member.id === user?.id && member.status === 'accepted'
    );

    // Collaborators can drag tasks but cannot edit/delete
    const canDrag = isOwner || isManager() || isAcceptedMember;
    const isReadOnly = !canEdit;

    return (
        <div className="p-8 max-w-[1600px] mx-auto min-h-screen">
            {/* Header */}
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl border border-white/5 transition-all group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-4xl font-black neon-text-cyan flex items-center gap-4 tracking-tighter uppercase italic">
                            Project <span className="text-white">Details</span>
                            <div className="h-1 lg:w-32 bg-holo-cyan/10 rounded-full" />
                        </h1>
                        <p className="text-slate-500 mt-2 text-[10px] font-black uppercase tracking-[0.3em]">Project: <span className="text-slate-300">{project.name}</span></p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <NotificationDropdown />
                    {canEdit && (
                        <div className="flex gap-3 bg-white/5 p-2 rounded-2xl border border-white/5">
                            <button
                                onClick={() => navigate(`/projects/${id}/edit`)}
                                className="flex items-center gap-2 px-6 py-3 bg-holo-cyan text-deep-950 font-black text-[10px] uppercase tracking-widest rounded-xl hover:shadow-neon-cyan transition-all"
                            >
                                <Edit size={14} />
                                Edit Project
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-red-600 transition-all opacity-80 hover:opacity-100"
                            >
                                <Trash2 size={14} />
                                Delete Project
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <main className="animate-in fade-in zoom-in duration-700">
                {/* Project Info Card */}
                <div className="glass-card p-10 mb-12 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-holo-cyan/5 rounded-full blur-3xl -content-none pointer-events-none group-hover:bg-holo-cyan/10 transition-all duration-1000" />

                    <div className="flex flex-col lg:flex-row gap-12">
                        <div className="flex-1">
                            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-6 flex items-center gap-4">
                                <span className="neon-text-cyan">Project</span> Description
                            </h2>
                            <p className="text-slate-400 text-lg leading-relaxed font-medium bg-white/5 p-6 rounded-2xl border border-white/5">
                                {project.description || 'System briefing currently unavailable for this operation.'}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
                                {project.class && (
                                    <div className="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-holo-magenta/30 transition-all">
                                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Project Category</h4>
                                        <p className="text-white font-bold">{project.class.name}</p>
                                    </div>
                                )}
                                {project.cohort && (
                                    <div className="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-holo-cyan/30 transition-all">
                                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Assigned Team</h4>
                                        <p className="text-white font-bold">{project.cohort.name}</p>
                                    </div>
                                )}
                                {project.github_link && (
                                    <a
                                        href={project.github_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/20 transition-all flex items-center justify-between group/repo"
                                    >
                                        <div>
                                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Source Repository</h4>
                                            <p className="text-holo-cyan font-bold text-sm">GitHub Repository</p>
                                        </div>
                                        <svg className="w-6 h-6 fill-slate-500 group-hover/repo:fill-white transition-colors" viewBox="0 0 24 24">
                                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                        </svg>
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="shrink-0 space-y-8">
                            {project.cover_image && (
                                <div className="relative group/img">
                                    <img
                                        src={project.cover_image}
                                        alt={project.name}
                                        className="w-48 h-48 object-cover rounded-2xl border-2 border-white/5 group-hover/img:border-holo-cyan/50 transition-all duration-500 shadow-2xl"
                                    />
                                    <div className="absolute inset-0 rounded-2xl bg-holo-cyan/10 opacity-0 group-hover/img:opacity-100 transition-opacity" />
                                </div>
                            )}

                            {project.owner && (
                                <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 italic">Project Manager</h4>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-holo-cyan/20 border border-holo-cyan/30 rounded-full flex-center text-holo-cyan font-black italic">
                                            {project.owner.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-white font-bold">{project.owner.name}</p>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">{project.owner.email}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-10 bg-white/5 p-2 rounded-2xl border border-white/5 w-fit">
                    {['Workspace', 'Members'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-500 ${activeTab === tab
                                ? 'bg-holo-cyan text-deep-950 shadow-neon-cyan'
                                : 'text-slate-500 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {tab === 'Members' ? `${tab} [${project.members?.length || 0}]` : tab}
                        </button>
                    ))}
                </div>

                {activeTab === 'Workspace' && (
                    <div className="space-y-12">
                        {/* Kanban Board */}
                        <div className="glass-card p-10 group">
                            <div className="mb-10 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black text-white hover:neon-text-magenta transition-colors uppercase italic tracking-tighter flex items-center gap-4">
                                        Project <span className="text-holo-magenta">Board</span>
                                    </h2>
                                    <p className="text-slate-500 mt-2 text-[10px] font-black uppercase tracking-[0.2em]">Real-time task management and tracking</p>
                                </div>
                                <div className="h-px flex-1 bg-white/5 mx-10 hidden md:block" />
                            </div>
                            <KanbanBoard
                                projectId={id}
                                isReadOnly={isReadOnly}
                                canDrag={canDrag}
                                projectMembers={project.members || []}
                                sprints={sprints}
                            />
                        </div>

                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <CalendarView projectId={id} />
                        </div>

                        {/* Sprints & Collaboration Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                            {/* Sprints & Attachments */}
                            <div className="space-y-8">
                                <SprintPlanner projectId={id} />
                                <AttachmentList projectId={id} />
                            </div>

                            {/* Timeline & Comments */}
                            <div className="space-y-8">
                                <ActivityTimeline projectId={id} />
                                <CommentSection projectId={id} />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'Members' && (
                    <div className="glass-card p-10 animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                            <div>
                                <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-4">
                                    Operation <span className="neon-text-cyan">Team</span>
                                </h2>
                                <p className="text-slate-500 mt-2 text-[10px] font-black uppercase tracking-[0.2em]">Authorized team members for this project</p>
                            </div>
                            {canEdit && (
                                <button
                                    onClick={() => setShowInviteModal(true)}
                                    className="btn-holo btn-holo-cyan"
                                >
                                    <UserPlus size={18} /> Invite Team Member
                                </button>
                            )}
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/5 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                                        <th className="pb-4 px-6">Member Name</th>
                                        <th className="pb-4 px-6">Assignment</th>
                                        <th className="pb-4 px-6">Status</th>
                                        {canEdit && <th className="pb-4 px-6 text-right">Clearance</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {/* Owner Row */}
                                    <tr className="group hover:bg-white/5 transition-all">
                                        <td className="py-6 px-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-holo-cyan/20 border border-holo-cyan/30 text-holo-cyan rounded-full flex-center font-black italic shadow-neon-cyan/20">
                                                    {project.owner.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white group-hover:text-holo-cyan transition-colors">{project.owner.name}</p>
                                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">{project.owner.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-6 px-6">
                                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-holo-magenta/10 text-holo-magenta border border-holo-magenta/20 shadow-neon-magenta/20">
                                                <Shield size={12} /> Project Lead
                                            </span>
                                        </td>
                                        <td className="py-6 px-6">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-green-500/10 text-green-400 border border-green-500/20">
                                                ACTIVE
                                            </span>
                                        </td>
                                        {canEdit && <td className="py-6 px-6 text-right"></td>}
                                    </tr>

                                    {/* Member Rows */}
                                    {project.members?.map((member) => (
                                        <tr key={member.id} className="group hover:bg-white/5 transition-all">
                                            <td className="py-6 px-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-white/5 border border-white/10 text-slate-400 rounded-full flex-center font-black italic">
                                                        {member.name?.charAt(0) || 'M'}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white group-hover:text-holo-cyan transition-colors">{member.name}</p>
                                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">{member.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-6 px-6">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase bg-white/5 text-slate-400 border border-white/10 group-hover:border-holo-cyan/30 transition-all">
                                                    {member.role || 'Operator'}
                                                </span>
                                            </td>
                                            <td className="py-6 px-6">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${member.status === 'accepted'
                                                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                    : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 animate-pulse'
                                                    }`}>
                                                    {member.status === 'accepted' ? 'ACCEPTED' : 'INVITATION PENDING'}
                                                </span>
                                            </td>
                                            {canEdit && (
                                                <td className="py-6 px-6 text-right">
                                                    <button
                                                        onClick={() => handleRemoveMember(member.id, member.name)}
                                                        className="p-3 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/30"
                                                        title="Remove Member"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-deep-950/80 backdrop-blur-xl flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
                    <div className="glass-card p-10 w-full max-w-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] border-holo-cyan/20">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black neon-text-cyan uppercase italic tracking-tighter">Invite <span className="text-white">Member</span></h3>
                            <button onClick={() => setShowInviteModal(false)} className="p-2 text-slate-500 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleInviteMember} className="space-y-8">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 italic">Operator Frequency (Email)</label>
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl focus:neon-border-cyan focus:outline-none text-white transition-all placeholder-slate-600"
                                    placeholder="email@example.com"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 italic">Access Clearance</label>
                                <select
                                    value={inviteRole}
                                    onChange={(e) => setInviteRole(e.target.value)}
                                    className="w-full px-6 py-4 bg-deep-900 border border-white/10 rounded-xl focus:neon-border-cyan focus:outline-none text-white transition-all cursor-pointer appearance-none"
                                >
                                    <option value="collaborator" className="bg-deep-950">COLLABORATOR (Write Access)</option>
                                    <option value="viewer" className="bg-deep-950">VIEWER (Read-only)</option>
                                </select>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowInviteModal(false)}
                                    className="flex-1 py-4 bg-white/5 text-slate-500 font-black text-[10px] uppercase tracking-widest rounded-xl border border-white/5 hover:bg-white/10 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] btn-holo btn-holo-cyan"
                                >
                                    Send Invitation
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectDetails;
