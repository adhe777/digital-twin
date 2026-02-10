import { useState } from 'react';
import axios from 'axios';
import { ArrowRight, RefreshCw, BrainCircuit } from 'lucide-react';

const Simulation = () => {
    const [current, setCurrent] = useState({
        sleepHours: 7,
        studyHours: 6,
        screenTime: 4,
        mood: 3
    });

    const [changes, setChanges] = useState({ ...current });
    const [result, setResult] = useState(null);

    const handleSliderChange = (e) => {
        setChanges({ ...changes, [e.target.name]: Number(e.target.value) });
    };

    const runSimulation = async () => {
        try {
            const res = await axios.post('http://localhost:8000/simulate', {
                current,
                changes
            });
            setResult(res.data);
        } catch (err) {
            console.error(err);
            alert('Simulation failed. Is AI Service running?');
        }
    };

    const reset = () => {
        setChanges({ ...current });
        setResult(null);
    }

    return (
        <div className="space-y-6">
            <div className="glass-card p-8">
                <h2 className="text-2xl font-bold mb-6 gradient-text">What-If Simulation (MVP)</h2>
                <p className="text-gray-600 mb-6">Adjust routine to simulate productivity changes.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Controls */}
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-medium text-gray-700">Sleep Hours</label>
                                <span className="text-sm font-bold text-primary">{changes.sleepHours}h</span>
                            </div>
                            <input
                                type="range"
                                name="sleepHours"
                                min="0"
                                max="12"
                                step="0.5"
                                value={changes.sleepHours}
                                onChange={handleSliderChange}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-medium text-gray-700">Study Hours</label>
                                <span className="text-sm font-bold text-secondary">{changes.studyHours}h</span>
                            </div>
                            <input
                                type="range"
                                name="studyHours"
                                min="0"
                                max="16"
                                step="0.5"
                                value={changes.studyHours}
                                onChange={handleSliderChange}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-medium text-gray-700">Screen Time</label>
                                <span className="text-sm font-bold text-accent">{changes.screenTime}h</span>
                            </div>
                            <input
                                type="range"
                                name="screenTime"
                                min="0"
                                max="16"
                                step="0.5"
                                value={changes.screenTime}
                                onChange={handleSliderChange}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-medium text-gray-700">Mood (1-5)</label>
                                <span className="text-sm font-bold text-gray-900">{changes.mood}/5</span>
                            </div>
                            <input
                                type="range"
                                name="mood"
                                min="1"
                                max="5"
                                value={changes.mood}
                                onChange={handleSliderChange}
                                className="w-full"
                            />
                        </div>

                        <div className="flex space-x-4 pt-4">
                            <button
                                onClick={runSimulation}
                                className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-indigo-700 focus:outline-none"
                            >
                                <ArrowRight className="w-4 h-4 mr-2" />
                                Simulate
                            </button>
                            <button
                                onClick={reset}
                                className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Reset
                            </button>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="bg-gray-50 rounded-xl p-6 flex flex-col justify-center items-center text-center">
                        {!result ? (
                            <div className="text-gray-400">
                                <BrainCircuit className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <p>Adjust values and click Simulate.</p>
                            </div>
                        ) : (
                            <div className="w-full space-y-6 animate-fade-in text-left">
                                <h3 className="text-lg font-bold text-center border-b pb-2">Simulation Results</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Current (Before) - Simplistic View */}
                                    <div className="text-center opacity-70">
                                        <div className="text-xs text-gray-500 uppercase font-semibold">Current</div>
                                        <div className="text-2xl font-bold text-gray-700">
                                            {/* Recalculate roughly for display or pass from backend if avail */}
                                            ~{(current.studyHours * 10) - (current.screenTime * 2) + (current.sleepHours * 2)}
                                        </div>
                                        <div className="text-xs text-gray-500">Score</div>
                                    </div>

                                    {/* New (After) */}
                                    <div className="text-center">
                                        <div className="text-xs text-primary uppercase font-semibold">Simulated</div>
                                        <div className="text-3xl font-extrabold text-primary">
                                            {result.new_score}
                                        </div>
                                        <div className={`text-xs font-bold ${result.improvement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {result.improvement >= 0 ? '+' : ''}{result.improvement}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Risk Level</span>
                                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${result.new_risk === 'High' ? 'bg-red-50 text-red-700 border-red-200' :
                                            result.new_risk === 'Medium' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                'bg-green-50 text-green-700 border-green-200'
                                            }`}>
                                            {result.new_risk}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-600 italic border-t pt-2 mt-2">
                                        "Simulated change based on your new routine inputs."
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Simulation;
