import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectsAPI } from '../api/projects';
import { classesAPI } from '../api/classes';
import { cohortsAPI } from '../api/cohorts';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

const EditProject = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isManager } = useAuth();
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        github_link: '',
        class_id: '',
        cohort_id: '',
    });
    const [classes, setClasses] = useState([]);
    const [cohorts, setCohorts] = useState([]);
    const [ownerName, setOwnerName] = useState('');
    const [members, setMembers] = useState([]);
    const [memberEmail, setMemberEmail] = useState('');
    const [error, setError] = useState('');

    const fetchClassesAndCohorts = useCallback(async () => {
        try {
            const [classesResponse, cohortsResponse] = await Promise.all([
                classesAPI.getAll(),
                cohortsAPI.getAll(),
            ]);
            setClasses(Array.isArray(classesResponse) ? classesResponse : []);
            setCohorts(cohortsResponse.items || []);
        } catch (err) {
            console.error('Error fetching classes and cohorts:', err);
        }
    }, []);

    const fetchProject = useCallback(async () => {
        try {
            setLoading(true);
            const response = await projectsAPI.getById(id);
            const project = response.project;

            // Check if user has permission to edit
            if (!isManager() && project.owner_id !== user?.id) {
                alert('You do not have permission to edit this project');
                navigate(`/projects/${id}`);
                return;
            }

            setFormData({
                name: project.name || '',
                description: project.description || '',
                github_link: project.github_link || '',
                class_id: project.class_id || '',
                cohort_id: project.cohort_id || '',
            });

            // Set owner name
            if (project.owner) {
                setOwnerName(project.owner.name || project.owner.email);
            }

            // Set existing members (convert to email list for backend compatibility)
            if (project.members && Array.isArray(project.members)) {
                setMembers(project.members.map(member => ({
                    email: member.email,
                    name: member.name,
                    id: member.id
                })));
            }
        } catch (error) {
            console.error('Error fetching project:', error);
            alert('Failed to load project');
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    }, [id, user?.id, navigate, isManager]);

    useEffect(() => {
        fetchProject();
        fetchClassesAndCohorts();
    }, [fetchProject, fetchClassesAndCohorts]);

    const handleAddMember = () => {
        if (!memberEmail.trim()) {
            setError('Please enter a valid email address');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(memberEmail.trim())) {
            setError('Please enter a valid email address');
            return;
        }

        // Check if email already exists in members list
        if (members.some(member => member.email === memberEmail.trim())) {
            setError('This member has already been added');
            return;
        }

        const newMember = {
            email: memberEmail.trim(),
            name: memberEmail.trim().split('@')[0], // Use email prefix as display name temporarily
        };

        setMembers([...members, newMember]);
        setMemberEmail('');
        setError('');
    };

    const handleRemoveMember = (index) => {
        setMembers(members.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            alert('Project name is required');
            return;
        }

        try {
            // Send only email addresses to backend (as per backend API requirement)
            const memberEmails = members.map(member => member.email);

            await projectsAPI.update(id, {
                name: formData.name,
                description: formData.description,
                github_link: formData.github_link,
                class_id: formData.class_id ? parseInt(formData.class_id) : null,
                cohort_id: formData.cohort_id ? parseInt(formData.cohort_id) : null,
                members: memberEmails, // Send array of email addresses
            });

            alert('Project updated successfully! Invitations have been sent to new members.');
            navigate(`/projects/${id}`);
        } catch (error) {
            console.error('Error updating project:', error);
            alert(error.message || 'Failed to update project');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8">
                <div className="flex-center flex-col gap-8">
                    <div className="loader-holo"></div>
                    <p className="text-neon-cyan font-black tracking-[0.4em] text-xs animate-pulse uppercase">
                        Accessing Secure Cores...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-[1200px] mx-auto min-h-screen">
            {/* Header */}
            <header className="flex items-center gap-6 mb-16">
                <button
                    onClick={() => navigate(`/projects/${id}`)}
                    className="p-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl border border-white/5 transition-all group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                </button>
                <div>
                    <h1 className="text-4xl font-black neon-text-magenta tracking-tighter uppercase italic">
                        Project <span className="text-white">Settings</span>
                    </h1>
                    <p className="text-slate-500 mt-2 text-[10px] font-black uppercase tracking-[0.3em]">Project: <span className="text-slate-300">{formData.name || 'Unknown'}</span></p>
                </div>
            </header>

            <main className="animate-in fade-in zoom-in duration-700">
                <div className="glass-card p-10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-holo-magenta/5 rounded-full blur-3xl -content-none pointer-events-none group-hover:bg-holo-magenta/10 transition-all duration-1000" />

                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-10 flex items-center gap-4">
                        <span className="neon-text-magenta text-3xl">Edit</span> Project
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-10">
                        {/* Grid for basic info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Project Name */}
                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1">
                                    Project Name <span className="text-holo-magenta">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:neon-border-magenta focus:outline-none text-white transition-all placeholder-slate-600 font-medium"
                                    placeholder="Enter project designate"
                                    required
                                />
                            </div>

                            {/* Project Owner (readonly) */}
                            <div className="space-y-3 opacity-60">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1">
                                    Project Manager
                                </label>
                                <input
                                    type="text"
                                    value={ownerName}
                                    disabled
                                    className="w-full px-6 py-4 bg-black/20 border border-white/5 rounded-2xl text-slate-400 cursor-not-allowed font-medium italic"
                                />
                            </div>
                        </div>

                        {/* Project Description */}
                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1">
                                Project Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:neon-border-magenta focus:outline-none text-white transition-all placeholder-slate-600 font-medium min-h-[150px]"
                                placeholder="Describe the project objectives"
                                rows="4"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* GitHub Link */}
                            <div className="space-y-3 md:col-span-1">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1">
                                    Repository Link (GitHub)
                                </label>
                                <input
                                    type="url"
                                    value={formData.github_link}
                                    onChange={(e) => setFormData({ ...formData, github_link: e.target.value })}
                                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:neon-border-magenta focus:outline-none text-white transition-all placeholder-slate-600 font-medium text-sm"
                                    placeholder="https://github.com/smirror/repo"
                                />
                            </div>

                            {/* Class Dropdown */}
                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1">
                                    Project Category
                                </label>
                                <select
                                    value={formData.class_id}
                                    onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                                    className="w-full px-6 py-4 bg-slate-900/90 border border-white/10 rounded-2xl focus:neon-border-magenta focus:outline-none text-white transition-all cursor-pointer appearance-none font-medium text-sm"
                                >
                                    <option value="" className="bg-slate-900 text-slate-500 font-bold">UNCATEGORIZED</option>
                                    {classes.map((cls) => (
                                        <option key={cls.id} value={cls.id} className="bg-slate-900">
                                            {cls.name.toUpperCase()} {cls.track ? `- ${cls.track.toUpperCase()}` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Cohort Dropdown */}
                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1">
                                    Assigned Team
                                </label>
                                <select
                                    value={formData.cohort_id}
                                    onChange={(e) => setFormData({ ...formData, cohort_id: e.target.value })}
                                    className="w-full px-6 py-4 bg-slate-900/90 border border-white/10 rounded-2xl focus:neon-border-magenta focus:outline-none text-white transition-all cursor-pointer appearance-none font-medium text-sm"
                                >
                                    <option value="" className="bg-slate-900 text-slate-500 font-bold">GENERAL ACCESS</option>
                                    {cohorts.map((cohort) => (
                                        <option key={cohort.id} value={cohort.id} className="bg-slate-900">
                                            {cohort.name.toUpperCase()}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Members */}
                        <div className="pt-6 border-t border-white/5">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1 mb-4">
                                Personnel Invitations
                            </label>

                            {error && (
                                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold uppercase tracking-wider animate-shake">
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-4 mb-8">
                                <div className="relative group flex-1">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-holo-magenta transition-colors" size={18} />
                                    <input
                                        type="email"
                                        value={memberEmail}
                                        onChange={(e) => setMemberEmail(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddMember();
                                            }
                                        }}
                                        placeholder="email@example.com"
                                        className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:neon-border-magenta focus:outline-none text-white transition-all placeholder-slate-600 font-medium"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAddMember}
                                    className="px-8 bg-holo-magenta text-deep-950 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:shadow-neon-magenta transition-all flex items-center gap-2"
                                >
                                    <Plus size={16} />
                                    Invite
                                </button>
                            </div>

                            {/* Member List */}
                            {members.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {members.map((member, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10 group/item hover:border-holo-magenta/30 transition-all"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-holo-magenta/10 border border-holo-magenta/20 text-holo-magenta rounded-full flex-center font-black italic text-xs">
                                                    {member.name?.charAt(0) || 'M'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white uppercase tracking-tighter italic">{member.name}</p>
                                                    <p className="text-[10px] text-slate-500 font-medium">{member.email}</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveMember(index)}
                                                className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                title="Remove Member"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-6 pt-10 border-t border-white/5">
                            <button
                                type="button"
                                onClick={() => navigate(`/projects/${id}`)}
                                className="flex-1 py-5 bg-white/5 text-slate-500 font-black text-[10px] uppercase tracking-widest rounded-2xl border border-white/5 hover:bg-white/10 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 btn-holo btn-holo-magenta py-5 text-sm"
                            >
                                Save Project Changes
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default EditProject;
