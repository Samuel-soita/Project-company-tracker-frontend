import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { projectsAPI } from '../api/projects';
import { classesAPI } from '../api/classes';
import { cohortsAPI } from '../api/cohorts';
import { membersAPI } from '../api/members';
import { useAuth } from '../context/AuthContext';

const CreateProjectModal = ({ onClose, onSuccess, project = null }) => {
    const isEdit = !!project;
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        name: project?.name || '',
        description: project?.description || '',
        github_link: project?.github_link || '',
        class_id: project?.class_id || '',
        cohort_id: project?.cohort_id || '',
    });

    const [members, setMembers] = useState([]);
    const [memberEmail, setMemberEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [classes, setClasses] = useState([]);
    const [cohorts, setCohorts] = useState([]);

    useEffect(() => {
        fetchClassesAndCohorts();
        // Load existing members when editing
        if (isEdit && project?.members) {
            const existingMembers = project.members.map(member => ({
                email: member.email,
                name: member.name,
                status: member.status
            }));
            setMembers(existingMembers);
        }
    }, [isEdit, project?.members]);

    const fetchClassesAndCohorts = async () => {
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
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleAddMember = () => {
        if (!memberEmail.trim()) return;

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(memberEmail.trim())) {
            setError('Please enter a valid email address');
            return;
        }

        const newMember = {
            email: memberEmail.trim(),
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
        setError('');

        // Validate required fields
        if (!formData.class_id) {
            setError('Please select a project type');
            return;
        }
        if (!formData.cohort_id) {
            setError('Please select a team');
            return;
        }

        setLoading(true);

        try {
            const projectData = {
                ...formData,
                class_id: parseInt(formData.class_id),
                cohort_id: parseInt(formData.cohort_id),
            };

            let createdProject;
            if (isEdit) {
                await projectsAPI.update(project.id, projectData);
                createdProject = project;
            } else {
                // Create the project first
                createdProject = await projectsAPI.create(projectData);

                // Then send email invitations to members
                if (members.length > 0) {
                    const invitationPromises = members.map((member) =>
                        membersAPI.invite(createdProject.id, member.email, 'collaborator')
                    );

                    // Send all invitations in parallel
                    await Promise.allSettled(invitationPromises);
                }
            }

            onSuccess();
        } catch (err) {
            setError(err.message || 'Failed to save project');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-deep-950/80 backdrop-blur-xl flex items-center justify-center p-4 z-[100] animate-in fade-in zoom-in duration-300">
            <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto border-holo-cyan/20 shadow-neon-cyan/20">
                <div className="sticky top-0 bg-deep-950/40 backdrop-blur-md border-b border-white/5 px-10 py-6 flex justify-between items-center z-10">
                    <h2 className="text-3xl font-black neon-text-cyan uppercase tracking-tighter italic">
                        {isEdit ? 'Modify' : 'Initialize'} <span className="text-white">Project</span>
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-8">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs font-bold uppercase tracking-widest animate-pulse">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-8">
                            {/* Project Name */}
                            <div>
                                <label htmlFor="project-name" className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">
                                    Project Name <span className="text-holo-cyan">*</span>
                                </label>
                                <input
                                    id="project-name"
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:neon-border-cyan transition-all placeholder-slate-600 font-bold"
                                    placeholder="SYSTEM-X"
                                />
                            </div>

                            {/* GitHub Link */}
                            <div>
                                <label htmlFor="github-link" className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">
                                    Repository Link (GitHub)
                                </label>
                                <input
                                    id="github-link"
                                    type="url"
                                    name="github_link"
                                    value={formData.github_link}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:neon-border-cyan transition-all placeholder-slate-600"
                                    placeholder="https://github.com/..."
                                />
                            </div>
                        </div>

                        {/* Project Description */}
                        <div>
                            <label htmlFor="project-description" className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">
                                Project Description
                            </label>
                            <textarea
                                id="project-description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={5}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:neon-border-cyan transition-all placeholder-slate-600 resize-none leading-relaxed"
                                placeholder="Describe system objectives..."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Project Type Dropdown */}
                        <div>
                            <label htmlFor="project-type" className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">
                                Project Category
                            </label>
                            <select
                                id="project-type"
                                name="class_id"
                                value={formData.class_id}
                                onChange={handleChange}
                                className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:neon-border-cyan transition-all appearance-none cursor-pointer"
                            >
                                <option value="" className="bg-slate-900 text-slate-500 font-bold">Select Category...</option>
                                {classes.map((cls) => (
                                    <option key={cls.id} value={cls.id}>
                                        {cls.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Team Dropdown */}
                        <div>
                            <label htmlFor="team" className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">
                                Assigned Team
                            </label>
                            <select
                                id="team"
                                name="cohort_id"
                                value={formData.cohort_id}
                                onChange={handleChange}
                                className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:neon-border-cyan transition-all appearance-none cursor-pointer"
                            >
                                <option value="" className="bg-slate-900 text-slate-500 font-bold">Select Team...</option>
                                {cohorts.map((cohort) => (
                                    <option key={cohort.id} value={cohort.id}>
                                        {cohort.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Project Owner (readonly) */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">
                                Project Manager
                            </label>
                            <div className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-slate-400 font-bold text-sm truncate">
                                {user?.name || user?.email || 'You'}
                            </div>
                        </div>
                    </div>

                    {/* Members Email Input */}
                    <div className="space-y-6">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                            {isEdit ? 'Current Team Members' : 'Invite Team Members'}
                        </label>

                        {!isEdit && (
                            <div className="flex gap-4">
                                <input
                                    type="email"
                                    value={memberEmail}
                                    onChange={(e) => setMemberEmail(e.target.value)}
                                    placeholder="operator@matrix.net"
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:neon-border-cyan transition-all placeholder-slate-600"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddMember();
                                        }
                                    }}
                                />

                                <button
                                    type="button"
                                    onClick={handleAddMember}
                                    className="p-3 bg-holo-cyan text-deep-950 rounded-xl hover:shadow-neon-cyan transition-all active:scale-95"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        )}

                        {members.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {members.map((member, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5 group hover:border-holo-cyan/30 transition-all"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3">
                                                <p className="font-bold text-sm text-white truncate">{member.name || member.email}</p>
                                                {member.status && (
                                                    <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${member.status === 'accepted'
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : 'bg-yellow-500/20 text-yellow-400'
                                                        }`}>
                                                        {member.status}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">
                                                {isEdit ? member.email : 'Link Pending'}
                                            </p>
                                        </div>
                                        {!isEdit && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveMember(index)}
                                                className="p-2 text-slate-500 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 bg-white/5 text-slate-400 font-black rounded-2xl hover:bg-white/10 transition-all uppercase tracking-[0.2em] text-[10px] border border-white/5"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] btn-holo py-4 shadow-neon-cyan/20"
                        >
                            {loading ? (
                                <div className="flex-center gap-3 uppercase">
                                    <div className="w-4 h-4 border-2 border-deep-950/30 border-t-deep-950 rounded-full animate-spin" />
                                    Synchronizing...
                                </div>
                            ) : isEdit ? (
                                'Save Internal Changes'
                            ) : (
                                'Establish Project'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProjectModal;

