import { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { User, Mail, Shield, Palette, Settings, CheckCircle, Save } from 'lucide-react';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        gender: '',
        preferences: { theme: 'light', animations: true },
        studentSettings: { preferredStudyTime: 'Morning', studyGoal: 4 },
        professionalSettings: { workHoursPerDay: 8, focusLevel: 'Medium' }
    });

    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/auth/me');
            setUser(res.data);
            setFormData({
                name: res.data.name,
                gender: res.data.gender,
                preferences: res.data.preferences || { theme: 'light', animations: true },
                studentSettings: res.data.studentSettings || { preferredStudyTime: 'Morning', studyGoal: 4 },
                professionalSettings: res.data.professionalSettings || { workHoursPerDay: 8, focusLevel: 'Medium' }
            });
            setLoading(false);
        } catch (err) {
            toast.error('Failed to load profile');
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put('/auth/profile', formData);
            toast.success('Profile updated successfully');
            // Sync theme if changed
            if (formData.preferences.theme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Update failed');
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return toast.error('Passwords do not match');
        }
        try {
            await api.post('/auth/change-password', {
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            });
            toast.success('Password changed successfully');
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Password change failed');
        }
    };

    if (loading) return <div className="text-center py-10">Loading Profile...</div>;

    const isStudent = user.role === 'Student' || user.role === 'STUDENT';

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Navigation / Sidebar */}
                <div className="space-y-4">
                    <div className="glass-card p-4 space-y-2">
                        <div className="flex items-center space-x-3 p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-md">
                            <Settings className="w-5 h-5" />
                            <span className="font-medium">Account Settings</span>
                        </div>
                    </div>

                    <div className="glass-card p-6 text-center">
                        <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <User className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{user.name}</h3>
                        <p className="text-sm text-gray-500">{user.role}</p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="md:col-span-2 space-y-8">
                    {/* Basic Info & Preferences */}
                    <section className="glass-card p-6 border-t-4 border-indigo-500">
                        <h3 className="text-xl font-bold mb-6 flex items-center">
                            <User className="mr-2 w-6 h-6 text-indigo-500" /> General Info
                        </h3>
                        <form onSubmit={handleProfileSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Email (Read-only)</label>
                                    <input type="text" value={user.email} disabled className="w-full bg-gray-100 dark:bg-gray-800 opacity-60 rounded-lg cursor-not-allowed" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Gender</label>
                                    <select
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-lg"
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Role</label>
                                    <input type="text" value={user.role} disabled className="w-full bg-gray-100 dark:bg-gray-800 opacity-60 rounded-lg cursor-not-allowed" />
                                </div>
                            </div>

                            <hr className="dark:border-gray-700" />

                            <div className="space-y-4">
                                <h4 className="font-bold flex items-center text-gray-700 dark:text-gray-300">
                                    <Palette className="mr-2 w-5 h-5" /> Preferences
                                </h4>
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <span className="text-sm font-medium">Theme Setting</span>
                                    <div className="flex bg-white dark:bg-gray-700 p-1 rounded-md border border-gray-200 dark:border-gray-600">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, preferences: { ...formData.preferences, theme: 'light' } })}
                                            className={`px-3 py-1 text-xs rounded ${formData.preferences.theme === 'light' ? 'bg-white shadow text-indigo-600 font-bold' : 'text-gray-400'}`}
                                        >
                                            Light
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, preferences: { ...formData.preferences, theme: 'dark' } })}
                                            className={`px-3 py-1 text-xs rounded ${formData.preferences.theme === 'dark' ? 'bg-gray-600 shadow text-white font-bold' : 'text-gray-400'}`}
                                        >
                                            Dark
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <span className="text-sm font-medium">Mood Character Animations</span>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, preferences: { ...formData.preferences, animations: !formData.preferences.animations } })}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.preferences.animations ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.preferences.animations ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                            </div>

                            {/* Role Specific Settings */}
                            {isStudent ? (
                                <div className="space-y-4 pt-4">
                                    <h4 className="font-bold border-l-4 border-indigo-400 pl-3">Study Preferences</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1 uppercase">Best Study Time</label>
                                            <select
                                                value={formData.studentSettings.preferredStudyTime}
                                                onChange={(e) => setFormData({ ...formData, studentSettings: { ...formData.studentSettings, preferredStudyTime: e.target.value } })}
                                                className="w-full text-sm rounded-lg"
                                            >
                                                <option value="Morning">Morning</option>
                                                <option value="Afternoon">Afternoon</option>
                                                <option value="Night">Night</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1 uppercase">Daily Goal (Hours)</label>
                                            <input
                                                type="number"
                                                min="1" max="15"
                                                value={formData.studentSettings.studyGoal}
                                                onChange={(e) => setFormData({ ...formData, studentSettings: { ...formData.studentSettings, studyGoal: e.target.value } })}
                                                className="w-full text-sm rounded-lg"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 pt-4">
                                    <h4 className="font-bold border-l-4 border-slate-700 pl-3">Professional Settings</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1 uppercase">Target Work Hours</label>
                                            <input
                                                type="number"
                                                value={formData.professionalSettings.workHoursPerDay}
                                                onChange={(e) => setFormData({ ...formData, professionalSettings: { ...formData.professionalSettings, workHoursPerDay: e.target.value } })}
                                                className="w-full text-sm rounded-lg"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1 uppercase">Focus Density</label>
                                            <select
                                                value={formData.professionalSettings.focusLevel}
                                                onChange={(e) => setFormData({ ...formData, professionalSettings: { ...formData.professionalSettings, focusLevel: e.target.value } })}
                                                className="w-full text-sm rounded-lg"
                                            >
                                                <option value="Low">Low</option>
                                                <option value="Medium">Medium</option>
                                                <option value="High">High</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button type="submit" className="w-full btn-primary py-3 flex items-center justify-center space-x-2">
                                <Save className="w-5 h-5" />
                                <span>Save Changes</span>
                            </button>
                        </form>
                    </section>

                    {/* Security Section */}
                    <section className="glass-card p-6 border-t-4 border-red-500">
                        <h3 className="text-xl font-bold mb-6 flex items-center">
                            <Shield className="mr-2 w-6 h-6 text-red-500" /> Security Settings
                        </h3>
                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Current Password</label>
                                <input
                                    type="password"
                                    required
                                    value={passwordData.oldPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-lg text-sm"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">New Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-lg text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Confirm New Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-lg text-sm"
                                    />
                                </div>
                            </div>
                            <button type="submit" className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors text-sm">
                                Reset Password
                            </button>
                        </form>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Profile;
