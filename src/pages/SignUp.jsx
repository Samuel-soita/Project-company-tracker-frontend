import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock } from 'lucide-react';

const SignUp = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirm_password: '',
        role: 'Employee',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirm_password) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            // eslint-disable-next-line no-unused-vars
            const { confirm_password, ...registrationData } = formData;
            await register(registrationData);
            navigate('/login', {
                state: { message: 'Registration successful! Please login.' },
            });
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-[-10%] right-[-10%] w-[45%] h-[45%] bg-holo-magenta/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[45%] h-[45%] bg-holo-cyan/10 rounded-full blur-[120px] animate-pulse-slow" />

            <div className="glass-card p-10 w-full max-w-lg relative z-10 animate-in fade-in zoom-in duration-700">
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-black neon-text-magenta tracking-tighter uppercase italic mb-2">
                        Smirror <span className="text-white">Limited</span>
                    </h2>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Employee Registration</p>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold uppercase tracking-wider animate-shake">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-holo-magenta transition-colors" size={16} />
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Agent Smith"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:neon-border-magenta focus:outline-none text-white transition-all placeholder-slate-600 text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-holo-magenta transition-colors" size={16} />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="agent@matrix.net"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:neon-border-magenta focus:outline-none text-white transition-all placeholder-slate-600 text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-holo-magenta transition-colors" size={16} />
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:neon-border-magenta focus:outline-none text-white transition-all placeholder-slate-600 text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Confirm Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-holo-magenta transition-colors" size={16} />
                                <input
                                    type="password"
                                    name="confirm_password"
                                    placeholder="••••••••"
                                    value={formData.confirm_password}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:neon-border-magenta focus:outline-none text-white transition-all placeholder-slate-600 text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Company Role</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full py-3 px-4 bg-slate-900/90 border border-white/10 rounded-xl focus:neon-border-magenta focus:outline-none text-white transition-all cursor-pointer appearance-none text-sm font-bold"
                        >
                            <option value="Employee" className="bg-slate-900">Employee</option>
                            <option value="Manager" className="bg-slate-900">Manager</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-holo btn-holo-magenta py-4 text-sm mt-4"
                    >
                        {loading ? 'Processing...' : 'Create Account'}
                    </button>
                </form>

                <p className="text-center text-slate-500 text-[11px] font-bold uppercase tracking-wider mt-12 pt-8 border-t border-white/5">
                    Already have an account?{' '}
                    <Link to="/login" className="text-holo-magenta hover:neon-text-cyan transition-all ml-2">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SignUp;
