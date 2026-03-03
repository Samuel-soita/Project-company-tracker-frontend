import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { membersAPI } from '../api/members';
import { useAuth } from '../context/AuthContext';

const InvitationResponse = () => {
    const { projectId, action } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const handleInvitation = async () => {
            // Check if user is logged in
            if (!user) {
                setError('Please log in to respond to this invitation');
                setLoading(false);
                setTimeout(() => navigate('/login'), 2000);
                return;
            }

            try {
                setLoading(true);
                await membersAPI.respond(projectId, action);

                if (action === 'accept') {
                    setMessage(`You have successfully joined the project!`);
                } else {
                    setMessage(`You have declined the invitation.`);
                }

                // Redirect to dashboard after 2 seconds
                setTimeout(() => navigate('/dashboard'), 2000);
            } catch (err) {
                setError(err.message || 'Failed to process invitation');
            } finally {
                setLoading(false);
            }
        };

        handleInvitation();
    }, [projectId, action, user, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-holo-cyan/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-holo-magenta/10 rounded-full blur-[120px] animate-pulse-slow" />

            <div className="glass-card p-12 w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-700 text-center">
                {loading && (
                    <div className="flex-center flex-col gap-8 py-10">
                        <div className="loader-holo"></div>
                        <p className="neon-text-cyan font-black tracking-[0.4em] text-[10px] animate-pulse uppercase">
                            Processing Request...
                        </p>
                    </div>
                )}

                {!loading && message && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-8">
                            {action === 'accept' ? (
                                <div className="w-20 h-20 bg-holo-cyan/10 border border-holo-cyan/20 rounded-3xl mx-auto flex-center shadow-neon-cyan/20 animate-bounce-slow">
                                    <svg className="w-10 h-10 text-holo-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            ) : (
                                <div className="w-20 h-20 bg-holo-magenta/10 border border-holo-magenta/20 rounded-3xl mx-auto flex-center shadow-neon-magenta/20">
                                    <svg className="w-10 h-10 text-holo-magenta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        <h2 className={`text-3xl font-black tracking-tighter uppercase italic mb-4 ${action === 'accept' ? 'neon-text-cyan' : 'neon-text-magenta'}`}>
                            {action === 'accept' ? 'Invitation Accepted' : 'Invitation Declined'}
                        </h2>

                        <p className="text-slate-400 text-sm font-medium mb-10 leading-relaxed">
                            {message}
                        </p>

                        <div className="flex flex-col items-center gap-4">
                            <div className="flex items-center gap-3 text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">
                                <span className="w-2 h-2 bg-holo-cyan rounded-full animate-ping"></span>
                                Redirecting to Project Dashboard
                            </div>
                        </div>
                    </div>
                )}

                {!loading && error && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-3xl mx-auto flex-center mb-8 shadow-red-500/10">
                            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>

                        <h2 className="text-2xl font-black text-red-500 uppercase tracking-tighter italic mb-4">
                            Process Error
                        </h2>

                        <p className="text-slate-400 text-sm font-medium mb-10 leading-relaxed">
                            {error}
                        </p>

                        <button
                            onClick={() => navigate('/login')}
                            className="w-full btn-holo btn-holo-cyan py-5 text-sm"
                        >
                            Return to Login Page
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InvitationResponse;
