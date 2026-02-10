import { Link, useNavigate } from 'react-router-dom';

import { Activity, LayoutDashboard, LogOut, PlusCircle, BrainCircuit, Sun, Moon, User } from 'lucide-react';

const Navbar = ({ isAuthenticated, onLogout, darkMode, toggleTheme }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        onLogout();
        navigate('/login');
    };

    return (
        <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <Activity className="h-8 w-8 text-primary" />
                            <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">Digital Twin</span>
                        </Link>
                        {isAuthenticated && (
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                <Link to="/" className="border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                    <LayoutDashboard className="w-4 h-4 mr-2" />
                                    Dashboard
                                </Link>
                                <Link to="/input" className="border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                    <PlusCircle className="w-4 h-4 mr-2" />
                                    Log Data
                                </Link>
                                <Link to="/simulation" className="border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                    <BrainCircuit className="w-4 h-4 mr-2" />
                                    Simulation
                                </Link>
                                <Link to="/profile" className="border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                    <User className="w-4 h-4 mr-2" />
                                    Profile
                                </Link>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center">
                        {/* Dark Mode Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                            aria-label="Toggle Dark Mode"
                        >
                            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

                        {isAuthenticated ? (
                            <button
                                onClick={handleLogout}
                                className="ml-4 px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout
                            </button>
                        ) : (
                            <div className="space-x-4">
                                <Link to="/login" className="text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium">Login</Link>
                                <Link to="/register" className="text-primary hover:text-indigo-700 font-medium">Register</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
