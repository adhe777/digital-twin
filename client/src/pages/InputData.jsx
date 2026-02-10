import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Save, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const InputData = () => {
    const [formData, setFormData] = useState({
        sleepHours: '',
        studyHours: '',
        screenTime: '',
        mood: 3
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const { sleepHours, studyHours, screenTime, mood } = formData;

    const validate = () => {
        const newErrors = {};

        if (!sleepHours || Number(sleepHours) < 0 || Number(sleepHours) > 24) {
            newErrors.sleepHours = 'Sleep must be between 0 and 24 hours';
        }
        if (!studyHours || Number(studyHours) < 0 || Number(studyHours) > 24) {
            newErrors.studyHours = 'Study must be between 0 and 24 hours';
        }
        if (!screenTime || Number(screenTime) < 0 || Number(screenTime) > 24) {
            newErrors.screenTime = 'Screen time must be between 0 and 24 hours';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const onChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear error when user types
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    const onSubmit = async e => {
        e.preventDefault();

        if (!validate()) {
            toast.error('Please fix the errors in the form.');
            return;
        }

        setIsSubmitting(true);

        try {
            await api.post('/routines', {
                sleepHours: Number(sleepHours),
                studyHours: Number(studyHours),
                screenTime: Number(screenTime),
                mood: Number(mood)
            });
            toast.success('Routine saved successfully!');
            // Clear form and navigate
            setFormData({ sleepHours: '', studyHours: '', screenTime: '', mood: 3 });
            setTimeout(() => navigate('/'), 1500);
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || err.response?.data?.msg || 'Failed to save data. Please try again.';
            toast.error(msg);

            // If unauthorized, redirect to login
            if (err.response?.status === 401) {
                setTimeout(() => navigate('/login'), 2000);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto glass-card p-8">
            <h2 className="text-2xl font-bold mb-6 gradient-text">Log Routine</h2>
            <form onSubmit={onSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {/* Sleep Hours */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sleep Hours</label>
                        <input
                            type="number"
                            step="0.5"
                            name="sleepHours"
                            value={sleepHours}
                            onChange={onChange}
                            disabled={isSubmitting}
                            className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.sleepHours ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.sleepHours && (
                            <p className="mt-1 text-xs text-red-500 flex items-center">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                {errors.sleepHours}
                            </p>
                        )}
                    </div>

                    {/* Study Hours */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Study/Work Hours</label>
                        <input
                            type="number"
                            step="0.5"
                            name="studyHours"
                            value={studyHours}
                            onChange={onChange}
                            disabled={isSubmitting}
                            className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.studyHours ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.studyHours && (
                            <p className="mt-1 text-xs text-red-500 flex items-center">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                {errors.studyHours}
                            </p>
                        )}
                    </div>

                    {/* Screen Time */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Screen Time (Hours)</label>
                        <input
                            type="number"
                            step="0.5"
                            name="screenTime"
                            value={screenTime}
                            onChange={onChange}
                            disabled={isSubmitting}
                            className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.screenTime ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.screenTime && (
                            <p className="mt-1 text-xs text-red-500 flex items-center">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                {errors.screenTime}
                            </p>
                        )}
                    </div>

                    {/* Mood */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mood (1-5)</label>
                        <div className="flex items-center space-x-4">
                            <input
                                type="range"
                                min="1"
                                max="5"
                                name="mood"
                                value={mood}
                                onChange={onChange}
                                disabled={isSubmitting}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="text-xl font-bold text-primary">{mood}</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Sad/Tired</span>
                            <span>Happy/Active</span>
                        </div>
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                >
                    {isSubmitting ? 'Saving...' : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Routine
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default InputData;
