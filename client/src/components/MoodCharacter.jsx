import React from 'react';

/**
 * MoodCharacter Component
 * Renders a high-quality animated SVG character based on user role, gender, and mood level.
 * 
 * @param {string} role - 'Student' or 'Professional'
 * @param {string} gender - 'Male' or 'Female'
 * @param {number} mood - 1 to 5
 * @param {boolean} animationsEnabled - toggle for animations
 */
const MoodCharacter = ({ role, gender, mood, animationsEnabled = true, message = "" }) => {
    const isStudent = role?.toLowerCase() === 'student';
    const isMale = gender?.toLowerCase() === 'male';

    // Animation class based on mood
    const getAnimationClass = () => {
        if (!animationsEnabled) return '';
        if (mood <= 2) return 'animate-mood-low';
        if (mood === 3) return 'animate-mood-neutral';
        return 'animate-mood-high';
    };

    // Palette Configuration
    const palette = {
        skin: '#FFDBAC',
        hair: isMale ? '#4B2C20' : '#8D5524',
        accent: isStudent ? '#4F46E5' : '#0F172A', // Indigo for student, Slate for professional
        clothesPrimary: isStudent ? '#6366F1' : '#334155',
        clothesSecondary: isStudent ? '#C7D2FE' : '#94A3B8',
        accessory: '#FBBF24', // Gold for books/laptop highlights
    };

    // Render Face based on mood
    const renderFace = () => {
        const eyesY = 32;
        const mouthY = mood <= 2 ? 44 : mood === 3 ? 42 : 40;

        return (
            <g className="character-face">
                {/* Eyes */}
                <g className="eyes">
                    {mood <= 2 ? (
                        <>
                            <path d="M52 32Q54 30 56 32" stroke="#000" strokeWidth="1.5" fill="none" />
                            <path d="M64 32Q66 30 68 32" stroke="#000" strokeWidth="1.5" fill="none" />
                        </>
                    ) : (
                        <>
                            <circle cx="54" cy={eyesY} r="2.5" fill="#000" />
                            <circle cx="66" cy={eyesY} r="2.5" fill="#000" />
                        </>
                    )}
                </g>

                {/* Mouth */}
                <g className="mouth">
                    {mood <= 2 ? (
                        <path d="M54 44Q60 40 66 44" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round" />
                    ) : mood === 3 ? (
                        <path d="M56 42H64" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round" />
                    ) : (
                        <path d="M54 40Q60 46 66 40" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round" />
                    )}
                </g>

                {/* Cheeks for high mood */}
                {mood >= 4 && (
                    <>
                        <circle cx="50" cy="38" r="3" fill="#FB7185" opacity="0.4" />
                        <circle cx="70" cy="38" r="3" fill="#FB7185" opacity="0.4" />
                    </>
                )}
            </g>
        );
    };

    const renderCharacter = () => {
        if (isStudent) {
            return isMale ? renderStudentBoy() : renderStudentGirl();
        } else {
            return isMale ? renderProfessionalMan() : renderProfessionalWoman();
        }
    };

    const renderStudentBoy = () => (
        <g>
            {/* Hair - Short/Hoodie combo */}
            <path d="M40 30C40 15 80 15 80 30" stroke={palette.hair} strokeWidth="8" fill="none" />
            <circle cx="60" cy="35" r="22" fill={palette.skin} />
            <path d="M45 20Q60 10 75 20" fill={palette.clothesPrimary} /> {/* Hoodie cap */}

            {/* Body - Hoodie */}
            <rect x="35" y="55" width="50" height="55" rx="12" fill={palette.clothesPrimary} />
            <rect x="45" y="80" width="30" height="20" rx="4" fill={palette.clothesSecondary} opacity="0.5" /> {/* Pocket */}

            {/* Backpack strap */}
            <path d="M40 55V110" stroke="#3730A3" strokeWidth="5" strokeLinecap="round" />
            <path d="M80 55V110" stroke="#3730A3" strokeWidth="5" strokeLinecap="round" />

            {renderFace()}
        </g>
    );

    const renderStudentGirl = () => (
        <g>
            {/* Hair - Long with ponytail/bow hint */}
            <path d="M35 30Q35 10 60 10Q85 10 85 30V60" stroke={palette.hair} strokeWidth="6" fill="none" />
            <circle cx="60" cy="35" r="22" fill={palette.skin} />

            {/* Body - Academic Top */}
            <rect x="35" y="55" width="50" height="55" rx="15" fill={palette.clothesSecondary} />
            <path d="M35 55L60 70L85 55" fill={palette.clothesPrimary} opacity="0.3" />

            {/* Notebook in hand */}
            <rect x="75" y="75" width="20" height="25" rx="2" fill="#FEF3C7" stroke="#D97706" strokeWidth="1" />
            <path d="M78 80H92M78 85H92M78 90H92" stroke="#F59E0B" strokeWidth="1" />

            {renderFace()}
        </g>
    );

    const renderProfessionalMan = () => (
        <g>
            {/* Hair - Clean cut */}
            <path d="M40 25Q60 15 80 25" stroke={palette.hair} strokeWidth="6" fill="none" />
            <circle cx="60" cy="35" r="20" fill={palette.skin} />

            {/* Body - Shirt & Suit */}
            <rect x="35" y="55" width="50" height="55" rx="5" fill={palette.clothesPrimary} />
            <path d="M50 55L60 75L70 55" fill="#FFF" /> {/* Shirt triangle */}
            <path d="M60 55L63 68L60 75L57 68L60 55Z" fill="#B91C1C" /> {/* Tie */}

            {/* Folder/Briefcase */}
            <rect x="75" y="80" width="25" height="18" rx="2" fill="#475569" />
            <rect x="82" y="76" width="10" height="4" rx="1" fill="#1E293B" />

            {renderFace()}
        </g>
    );

    const renderProfessionalWoman = () => (
        <g>
            {/* Hair - Stylish Bob/Professional cut */}
            <path d="M38 25Q60 12 82 25" stroke={palette.hair} strokeWidth="10" fill="none" />
            <path d="M38 25V55M82 25V55" stroke={palette.hair} strokeWidth="8" fill="none" />
            <circle cx="60" cy="35" r="20" fill={palette.skin} />

            {/* Body - Blazer */}
            <rect x="35" y="55" width="50" height="55" rx="8" fill={palette.clothesPrimary} />
            <path d="M45 55L60 85L75 55" fill="#FFF" opacity="0.9" /> {/* Inner top */}

            {/* Laptop hint */}
            <rect x="72" y="75" width="30" height="22" rx="2" fill="#94A3B8" />
            <circle cx="87" cy="86" r="3" fill="#F1F5F9" opacity="0.5" />

            {renderFace()}
        </g>
    );

    return (
        <div className={`relative flex flex-col items-center justify-center p-4 transition-all duration-500 ${getAnimationClass()}`}>
            {/* Thought Bubble */}
            {message && animationsEnabled && (
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-48 animate-bounce-slow">
                    <div className="bg-white dark:bg-gray-800 border-2 border-indigo-200 dark:border-indigo-900 rounded-2xl p-3 shadow-lg relative">
                        <p className="text-[10px] font-medium text-gray-700 dark:text-gray-200 leading-tight">
                            {message}
                        </p>
                        {/* Bubble Triangle pointer */}
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-indigo-200 dark:border-t-indigo-900"></div>
                        <div className="absolute -bottom-[6px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[7px] border-t-white dark:border-t-gray-800"></div>
                    </div>
                </div>
            )}

            <svg
                width="140"
                height="140"
                viewBox="0 0 120 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-xl"
            >
                {renderCharacter()}
            </svg>

            {/* Mood Status Label */}
            <div className={`mt-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter transition-colors duration-300 ${mood <= 2 ? 'bg-red-100 text-red-600' :
                mood === 3 ? 'bg-blue-100 text-blue-600' :
                    'bg-green-100 text-green-600'
                }`}>
                {mood <= 2 ? 'Low Energy' : mood === 3 ? 'In Harmony' : 'Highly Productive'}
            </div>

            <style jsx="true">{`
                @keyframes float {
                    0%, 100% { transform: translateY(0) scale(1); }
                    50% { transform: translateY(-8px) scale(1.02); }
                }
                @keyframes blink-eye {
                    0%, 90%, 100% { transform: scaleY(1); }
                    95% { transform: scaleY(0.1); }
                }
                @keyframes subtle-breath {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(0.98); opacity: 0.9; }
                }
                @keyframes droop {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(4px) rotate(1deg); }
                }

                @keyframes bounce-slow {
                    0%, 100% { transform: translate(-50%, 0); }
                    50% { transform: translate(-50%, -4px); }
                }

                .animate-mood-high {
                    animation: float 2.5s ease-in-out infinite;
                }
                .animate-mood-neutral {
                    animation: subtle-breath 4s ease-in-out infinite;
                }
                .animate-mood-low {
                    animation: droop 5s ease-in-out infinite;
                }

                .character-eyes {
                    animation: blink-eye 4s infinite;
                    transform-origin: center;
                }

                svg {
                    transition: filter 0.5s ease;
                }

                .animate-mood-low svg {
                    filter: saturate(0.6) brightness(0.9);
                }

                .animate-mood-high svg {
                    filter: drop-shadow(0 0 8px rgba(34, 197, 94, 0.3));
                }
            `}</style>
        </div>
    );
};

export default MoodCharacter;
