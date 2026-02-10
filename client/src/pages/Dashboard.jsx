import { useState, useEffect } from 'react';
import api from '../utils/api';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Activity, AlertTriangle, Zap, Download, CheckCircle, TrendingUp, AlertCircle, BookOpen, Target, Flame, Brain, Clock } from 'lucide-react';
import MoodCharacter from '../components/MoodCharacter';

const Dashboard = () => {
    const [logs, setLogs] = useState([]);
    const [analysis, setAnalysis] = useState(null);
    const [recommendations, setRecommendations] = useState(null);
    const [userRole, setUserRole] = useState('Student'); // Default
    const [userGender, setUserGender] = useState('Male'); // Default
    const [userPreferences, setUserPreferences] = useState({ theme: 'light', animations: true });

    // --- NEW: Productivity Feature States ---
    const [microGoal, setMicroGoal] = useState(() => {
        const saved = localStorage.getItem('dailyMicroGoal');
        if (saved) {
            const parsed = JSON.parse(saved);
            const today = new Date().toDateString();
            if (parsed.date === today) return parsed;
        }
        return { text: '', completed: false, skipped: false, date: new Date().toDateString() };
    });

    // Student specific states
    const [plannedStudyHours, setPlannedStudyHours] = useState(() => localStorage.getItem('plannedStudyHours') || 0);
    const [syllabusProgress, setSyllabusProgress] = useState(() => localStorage.getItem('syllabusProgress') || 0);

    // Save to local storage whenever they change
    useEffect(() => {
        localStorage.setItem('plannedStudyHours', plannedStudyHours);
    }, [plannedStudyHours]);

    useEffect(() => {
        localStorage.setItem('syllabusProgress', syllabusProgress);
    }, [syllabusProgress]);

    useEffect(() => {
        localStorage.setItem('dailyMicroGoal', JSON.stringify(microGoal));
    }, [microGoal]);

    useEffect(() => {
        fetchUserData();
        fetchLogs();
    }, []);

    const fetchUserData = async () => {
        try {
            const res = await api.get('/auth/me');
            setUserRole(res.data.role);
            setUserGender(res.data.gender || 'Male');
            setUserPreferences(res.data.preferences || { theme: 'light', animations: true });
        } catch (err) {
            console.error("Error fetching user data", err);
        }
    };

    const fetchLogs = async () => {
        try {
            const res = await api.get('/routines');
            setLogs(res.data);
            if (res.data.length > 0) {
                // Defer analysis until role is fetched? Or just pass state.
                // We'll call it here but we might need to rely on the state being set.
                // Better: pass the fetched role if available, or current state.
                analyzeLatest(res.data[0]);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Use effect to re-analyze if role changes? usually fetchLogs happens once.
    // Let's modify analyzeLatest to use the state directly or pass it.

    useEffect(() => {
        if (logs.length > 0 && userRole) {
            analyzeLatest(logs[0]);
        }
    }, [userRole, logs]); // Re-run when role is loaded

    const analyzeLatest = async (latestLog) => {
        try {
            // Direct call to AI service
            const res = await axios.post('http://localhost:8000/analyze', {
                sleepHours: latestLog.sleepHours,
                studyHours: latestLog.studyHours,
                screenTime: latestLog.screenTime,
                mood: latestLog.mood,
                role: userRole
            });
            setAnalysis(res.data);

            const recRes = await axios.post('http://localhost:8000/recommend', {
                sleepHours: latestLog.sleepHours,
                studyHours: latestLog.studyHours,
                screenTime: latestLog.screenTime,
                mood: latestLog.mood,
                role: userRole
            });
            setRecommendations(recRes.data.recommendations);

        } catch (err) {
            console.error("AI Service Error:", err);
        }
    };



    // Format data for charts
    const chartData = logs.slice(0, 7).reverse().map(log => ({
        date: new Date(log.date).toLocaleDateString(),
        productivity: (log.studyHours * 10) - (log.screenTime * 2) + (log.sleepHours * 2), // Rough calc for chart visualization
        mood: log.mood,
        sleep: log.sleepHours,
        study: log.studyHours
    }));

    // --- Advanced Analysis Helpers ---
    const calculateWeeklyStats = () => {
        if (logs.length === 0) return null;
        const weekLogs = logs.slice(0, 7);
        const scores = weekLogs.map(l => (l.studyHours * 10) - (l.screenTime * 2) + (l.sleepHours * 2));
        return {
            avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
            high: Math.max(...scores),
            low: Math.min(...scores)
        };
    };

    const analyzeConsistency = () => {
        if (logs.length < 2) return { status: 'Not enough data', color: 'text-gray-500' };
        const weekLogs = logs.slice(0, 7);

        // Calculate variance for sleep
        const sleepMean = weekLogs.reduce((a, b) => a + b.sleepHours, 0) / weekLogs.length;
        const sleepVar = weekLogs.reduce((a, b) => a + Math.pow(b.sleepHours - sleepMean, 2), 0) / weekLogs.length;

        return sleepVar < 1.5 ? { status: 'Consistent', color: 'text-green-600' } : { status: 'Irregular', color: 'text-orange-600' };
    };

    const analyzeMoodCorrelation = () => {
        if (logs.length < 3) return null;
        const weekLogs = logs.slice(0, 7);
        const avgScreen = weekLogs.reduce((a, b) => a + b.screenTime, 0) / weekLogs.length;
        const avgMood = weekLogs.reduce((a, b) => a + b.mood, 0) / weekLogs.length;

        if (avgScreen > 4 && avgMood < 3) return "High screen time may be lowering your mood.";
        if (avgScreen < 3 && avgMood > 3.5) return "Low screen time correlates with better mood.";
        return "No strong mood correlation detected.";
    };

    // --- STUDENT SPECIFIC HELPERS ---

    const calculateStudyStreak = () => {
        let streak = 0;
        // logs are typically recent-first or check dates. Assumes desc order by date
        for (let i = 0; i < logs.length; i++) {
            if (logs[i].studyHours > 0) {
                streak++;
            } else {
                break;
            }
        }
        return streak;
    };

    const calculateExamReadiness = () => {
        if (logs.length < 3) return { status: 'Calculating...', color: 'text-gray-500', value: 0 };
        const weekLogs = logs.slice(0, 7);
        const avgStudy = weekLogs.reduce((a, b) => a + b.studyHours, 0) / weekLogs.length;
        const avgSleep = weekLogs.reduce((a, b) => a + b.sleepHours, 0) / weekLogs.length;

        // Simple heuristic
        if (avgStudy > 4 && avgSleep > 6.5) return { status: 'High Readiness', color: 'text-green-600', value: 90 };
        if (avgStudy > 2 && avgSleep > 6) return { status: 'On Track', color: 'text-blue-600', value: 70 };
        if (avgStudy > 1) return { status: 'Moderate', color: 'text-orange-500', value: 50 };
        return { status: 'Needs Focus', color: 'text-red-500', value: 30 };
    };

    const analyzeDistraction = () => {
        if (logs.length < 3) return null;
        const weekLogs = logs.slice(0, 7);
        const avgScreen = weekLogs.reduce((a, b) => a + b.screenTime, 0) / weekLogs.length;
        const avgStudy = weekLogs.reduce((a, b) => a + b.studyHours, 0) / weekLogs.length;

        if (avgScreen > 4 && avgStudy < 3) return "High screen time might be impacting study focus.";
        return "Good balance between screen time and study.";
    };

    const isRoutineMissed = () => {
        if (logs.length === 0) return true;
        const today = new Date().toDateString();
        const lastLogDate = new Date(logs[0].date).toDateString();
        return today !== lastLogDate;
    };

    const downloadReport = () => {
        const stats = calculateWeeklyStats() || { avg: 0, high: 0, low: 0 };
        const consistency = analyzeConsistency();
        const moodInsight = analyzeMoodCorrelation() || "N/A";

        const text = `
DIGITAL TWIN - WEEKLY PRODUCTIVITY REPORT
=========================================
Date: ${new Date().toLocaleDateString()}

SUMMARY STATS
-------------
Average Score: ${stats.avg}/100
Highest Score: ${stats.high}
Lowest Score:  ${stats.low}

ROUTINE ANALYSIS
----------------
Consistency:   ${consistency.status}
Mood Insight:  ${moodInsight}

AI RECOMMENDATIONS
------------------
${recommendations || "No recommendations generated."}

LOG HISTORY (Last 7 Entries)
----------------------------
${logs.slice(0, 7).map(l => `${new Date(l.date).toLocaleDateString()}: Sleep ${l.sleepHours}h | Study ${l.studyHours}h | Prod ${((l.studyHours * 10) - (l.screenTime * 2) + (l.sleepHours * 2))}`).join('\n')}
        `;

        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Productivity_Report_${new Date().toLocaleDateString().replace(/\//g, '-')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    // --- NEW: Helper Functions for Enhancements ---
    const getCharacterMessage = () => {
        if (logs.length === 0) return "Hi! Start by logging your routine today.";
        const latest = logs[0];

        if (latest.mood <= 2) {
            return "It's okay to have low energy. Try a 5-minute breather or a small stretch.";
        }
        if (latest.screenTime > 5) {
            return "Taking a break from screens might help clear your mind.";
        }
        if (isStudent && latest.studyHours > 4) {
            return "Excellent focus! Remember to hydrate and rest your eyes.";
        }
        if (latest.mood >= 4) {
            return "You're radiating positive energy! Keep up this great momentum.";
        }
        return "You're doing great. Stay consistent and focus on one thing at a time.";
    };

    const getMoodTimelineData = () => {
        if (logs.length === 0) return null;
        // Last 5 days
        return logs.slice(0, 5).reverse();
    };

    const handleGoalAction = (action) => {
        if (action === 'complete') setMicroGoal({ ...microGoal, completed: true, skipped: false });
        if (action === 'skip') setMicroGoal({ ...microGoal, completed: false, skipped: true });
        if (action === 'reset') setMicroGoal({ ...microGoal, text: '', completed: false, skipped: false });
    };

    const weeklyStats = calculateWeeklyStats();
    const consistency = analyzeConsistency();
    const moodInsight = analyzeMoodCorrelation();

    // Student specific derived state
    const studyStreak = calculateStudyStreak();
    const examReadiness = calculateExamReadiness();
    const distractionInsight = analyzeDistraction();
    const isStudent = userRole === 'Student' || userRole === 'STUDENT';


    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {isStudent ? "Student Dashboard" : "Dashboard"}
                </h2>
                {isStudent && (
                    <div className="flex items-center space-x-2 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full">
                        <Flame className="w-5 h-5 text-orange-500" />
                        <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">{studyStreak} Day Streak</span>
                    </div>
                )}
            </div>

            {/* --- STUDENT SPECIFIC WIDGETS --- */}
            {isStudent && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Study Planner */}
                    <div className="glass-card p-6 border-t-4 border-indigo-500">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Study Planner</h3>
                            <Target className="h-5 w-5 text-indigo-500" />
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-600 dark:text-gray-300 flex justify-between">
                                    <span>Planned for Today: {plannedStudyHours}h</span>
                                </label>
                                <input
                                    type="range"
                                    min="0" max="12" step="0.5"
                                    value={plannedStudyHours}
                                    onChange={(e) => setPlannedStudyHours(e.target.value)}
                                    className="w-full mt-2"
                                />
                            </div>
                            <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                                <div className="text-center">
                                    <div className="text-xs text-gray-500 uppercase">Planned</div>
                                    <div className="text-xl font-bold text-indigo-600">{plannedStudyHours}h</div>
                                </div>
                                <div className="text-gray-400">vs</div>
                                <div className="text-center">
                                    <div className="text-xs text-gray-500 uppercase">Actual</div>
                                    <div className={`text-xl font-bold ${logs.length > 0 && logs[0].studyHours >= plannedStudyHours ? 'text-green-500' : 'text-orange-500'}`}>
                                        {logs.length > 0 ? logs[0].studyHours : 0}h
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Syllabus Tracker */}
                    <div className="glass-card p-6 border-t-4 border-teal-500">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Syllabus Progress</h3>
                            <BookOpen className="h-5 w-5 text-teal-500" />
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="relative w-16 h-16 flex-shrink-0">
                                <svg className="w-full h-full" viewBox="0 0 36 36">
                                    <path
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="#eee"
                                        strokeWidth="4"
                                    />
                                    <path
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="#14b8a6"
                                        strokeWidth="4"
                                        strokeDasharray={`${syllabusProgress}, 100`}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-teal-700">
                                    {syllabusProgress}%
                                </div>
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-gray-500">Update Progress</label>
                                <input
                                    type="number"
                                    min="0" max="100"
                                    value={syllabusProgress}
                                    onChange={(e) => setSyllabusProgress(Number(e.target.value))}
                                    className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 mt-1"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Productivity Score Card */}
                {/* Focus Score (renamed from Productivity for Students) */}
                <div className={`glass-card p-6 ${isStudent ? 'border-t-4 border-cyan-500' : ''}`}>
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {isStudent ? "Focus Score" : "Productivity Score"}
                        </h3>
                        {isStudent ? <Brain className="h-6 w-6 text-cyan-500" /> : <Zap className="h-6 w-6 text-yellow-500" />}
                    </div>
                    <div className="mt-2 flex items-baseline">
                        <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                            {analysis ? analysis.productivity_score : '-'}
                        </span>
                        <span className="ml-1 text-sm text-gray-500">/100</span>
                    </div>
                </div>

                {/* Burnout Risk Card */}
                {/* Burnout Risk or Exam Readiness */}
                <div className={`glass-card p-6 ${isStudent ? 'border-t-4 border-blue-500' : ''}`}>
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {isStudent ? "Exam Readiness" : "Burnout Risk"}
                        </h3>
                        {isStudent ? (
                            <Activity className={`h-6 w-6 ${examReadiness.color}`} />
                        ) : (
                            <AlertTriangle className={`h-6 w-6 ${analysis?.burnout_risk === 'High' ? 'text-red-500' : analysis?.burnout_risk === 'Medium' ? 'text-orange-500' : 'text-green-500'}`} />
                        )}

                    </div>
                    <div className="mt-2">
                        {isStudent ? (
                            <span className={`px-2 py-1 text-sm font-semibold rounded-full bg-opacity-20 ${examReadiness.color.replace('text-', 'bg-').replace('600', '100').replace('500', '100')} ${examReadiness.color}`}>
                                {examReadiness.status}
                            </span>
                        ) : (
                            <span className={`px-2 py-1 text-sm font-semibold rounded-full ${analysis?.burnout_risk === 'High' ? 'bg-red-100 text-red-800' :
                                analysis?.burnout_risk === 'Medium' ? 'bg-orange-100 text-orange-800' :
                                    'bg-green-100 text-green-800'
                                }`}>
                                {analysis ? analysis.burnout_risk : 'Calculating...'}
                            </span>
                        )}

                    </div>
                </div>

                {/* Latest Mood Card */}
                <div className="glass-card p-6 flex flex-col items-center justify-between text-center">
                    <div className="w-full flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Current Mood</h3>
                        <Activity className="h-6 w-6 text-primary" />
                    </div>

                    <div className="flex-1 flex items-center justify-center">
                        <MoodCharacter
                            role={userRole}
                            gender={userGender}
                            mood={logs.length > 0 ? logs[0].mood : 3}
                            animationsEnabled={userPreferences.animations}
                            message={getCharacterMessage()}
                        />
                    </div>

                    <div className="mt-4 w-full border-t border-gray-100 dark:border-gray-800 pt-3">
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Mood Trend (Last 5 Days)</p>
                        <div className="flex justify-between items-center px-2">
                            {getMoodTimelineData() ? getMoodTimelineData().map((log, idx) => (
                                <div key={idx} className="flex flex-col items-center">
                                    <div className={`w-3 h-3 rounded-full mb-1 ${log.mood <= 2 ? 'bg-red-400' :
                                            log.mood === 3 ? 'bg-blue-400' :
                                                'bg-green-400'
                                        } ${idx === getMoodTimelineData().length - 1 ? 'ring-2 ring-primary ring-offset-2' : ''}`}></div>
                                    <span className="text-[8px] text-gray-400">{new Date(log.date).toLocaleDateString(undefined, { weekday: 'narrow' })}</span>
                                </div>
                            )) : (
                                <p className="text-[10px] text-gray-400 italic">Not enough data to display mood trend.</p>
                            )}
                        </div>
                    </div>

                    <div className="mt-4">
                        <span className="text-sm font-medium text-gray-500">
                            Level: <span className="text-gray-900 dark:text-white font-bold">{logs.length > 0 ? logs[0].mood : '-'}</span> / 5
                        </span>
                    </div>
                </div>
            </div>

            {/* --- NEW: Daily Micro-Goal Widget --- */}
            <div className="glass-card p-6 border-l-4 border-indigo-500">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                        <Target className="mr-2 w-5 h-5 text-indigo-500" /> Daily Micro-Goal
                    </h3>
                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">{new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                </div>

                {!microGoal.text ? (
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            placeholder="Set a small goal for today..."
                            className="flex-1 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.target.value.trim()) {
                                    setMicroGoal({ ...microGoal, text: e.target.value.trim(), date: new Date().toDateString() });
                                }
                            }}
                        />
                        <button
                            className="btn-primary px-4 py-2 text-sm"
                            onClick={(e) => {
                                const input = e.currentTarget.previousSibling;
                                if (input.value.trim()) {
                                    setMicroGoal({ ...microGoal, text: input.value.trim(), date: new Date().toDateString() });
                                }
                            }}
                        >Set</button>
                    </div>
                ) : (
                    <div className="flex items-center justify-between bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                        <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${microGoal.completed ? 'bg-green-100 text-green-600' : microGoal.skipped ? 'bg-gray-200 text-gray-500' : 'bg-white dark:bg-gray-800 text-indigo-600 shadow-sm'}`}>
                                {microGoal.completed ? <CheckCircle className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                            </div>
                            <div>
                                <p className={`font-semibold ${microGoal.completed ? 'text-green-700 dark:text-green-400 line-through' : microGoal.skipped ? 'text-gray-400 italic' : 'text-indigo-900 dark:text-indigo-100'}`}>
                                    {microGoal.text}
                                </p>
                                <p className="text-[10px] text-gray-500">{microGoal.completed ? 'Goal Completed!' : microGoal.skipped ? 'Goal Skipped' : 'Focused on goal'}</p>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            {!microGoal.completed && !microGoal.skipped && (
                                <>
                                    <button onClick={() => handleGoalAction('complete')} className="p-2 hover:bg-green-100 text-green-600 rounded-lg transition-colors" title="Complete"><CheckCircle className="w-5 h-5" /></button>
                                    <button onClick={() => handleGoalAction('skip')} className="p-2 hover:bg-gray-100 text-gray-400 rounded-lg transition-colors" title="Skip"><Zap className="w-5 h-5" /></button>
                                </>
                            )}
                            {(microGoal.completed || microGoal.skipped) && (
                                <button onClick={() => handleGoalAction('reset')} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">New Goal</button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* --- NEW: Missed Routine Banner --- */}
            {isRoutineMissed() && (
                <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-md flex items-center justify-between">
                    <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-orange-400 mr-2" />
                        <p className="text-sm text-orange-700">
                            You haven't logged your routine for today yet. Keep your Digital Twin accurate!
                        </p>
                    </div>
                </div>
            )}

            {/* --- NEW: Advanced Analytics Section --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Weekly Summary */}
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Weekly Performance</h3>
                        <TrendingUp className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center divide-x divide-gray-200">
                        <div>
                            <div className="text-xs text-gray-500 uppercase">Avg</div>
                            <div className="text-xl font-bold text-gray-900 dark:text-white">{weeklyStats?.avg || '-'}</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 uppercase">High</div>
                            <div className="text-xl font-bold text-green-600 dark:text-green-400">{weeklyStats?.high || '-'}</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 uppercase">Low</div>
                            <div className="text-xl font-bold text-red-500 dark:text-red-400">{weeklyStats?.low || '-'}</div>
                        </div>
                    </div>
                </div>

                {/* Insights (Consistency & Mood) */}
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {isStudent ? "Study Insights" : "Routine Intelligence"}
                        </h3>
                        {isStudent ? <Clock className="h-5 w-5 text-indigo-400" /> : <CheckCircle className="h-5 w-5 text-gray-400" />}
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Sleep Consistency:</span>
                            <span className={`font-semibold ${consistency.color}`}>{consistency.status}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Mood Correlation:</span>
                        </div>
                        {isStudent && (
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">Distraction Impact:</span>
                            </div>
                        )}
                        <p className="text-xs text-gray-500 italic bg-gray-50 p-2 rounded">
                            {isStudent ? `"${distractionInsight || 'Log more data to reveal distraction patterns.'}"` : `"${moodInsight || 'Need more data to analyze mood patterns.'}"`}
                        </p>
                    </div>
                </div>
            </div>

            {/* Export and Charts */}
            <div className="flex justify-end">
                <button
                    onClick={downloadReport}
                    className="flex items-center space-x-2 text-sm text-primary hover:text-indigo-800 font-medium transition-colors"
                >
                    <Download className="w-4 h-4" />
                    <span>Export Weekly Report</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Main Chart */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Weekly Trends</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Line type="monotone" dataKey="sleep" stroke="#4F46E5" strokeWidth={2} dot={{ r: 4 }} name="Sleep (h)" />
                                <Line type="monotone" dataKey="study" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} name="Study (h)" />
                                <Line type="monotone" dataKey="mood" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 4 }} name="Mood" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recommendations */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 gradient-text">AI Insights</h3>
                    <div className="prose prose-sm max-w-none text-gray-600 dark:text-gray-300">
                        {recommendations ? (
                            <div className="whitespace-pre-line">{recommendations}</div>
                        ) : (
                            <p>Log data to get personalized AI recommendations.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
