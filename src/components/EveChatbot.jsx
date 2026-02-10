import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRandomMessage, getRandomGreeting } from '../utils/chatMessages';
import './EveChatbot.css';

export default function EveChatbot() {
    const [showBubble, setShowBubble] = useState(false);
    const [currentMessage, setCurrentMessage] = useState(getRandomGreeting());
    const [botState, setBotState] = useState('IDLE'); // IDLE, HAPPY, FLYING, RUNNING, SLEEPING

    // Timers
    const cycleTimerRef = useRef(null);
    const behaviorTimerRef = useRef(null);

    // 1. Auto-Suggestion Cycle (Every 2 mins)
    useEffect(() => {
        const triggerSuggestion = () => {
            const msg = getRandomMessage();
            setCurrentMessage(msg.text);
            setBotState('HAPPY');
            handleShowBubble();
            setTimeout(() => setBotState('IDLE'), 4000);
        };
        cycleTimerRef.current = setInterval(triggerSuggestion, 120000);
        setTimeout(() => handleShowBubble(), 1000);
        return () => clearInterval(cycleTimerRef.current);
    }, []);

    // 2. Random Cute Behavior Cycle
    useEffect(() => {
        const triggerBehavior = () => {
            const rand = Math.random();
            let nextState = 'IDLE';
            let duration = 4000;

            if (rand < 0.25) {
                nextState = 'FLYING'; // 25% - Fly a plane!
                duration = 6000;
            } else if (rand < 0.45) {
                nextState = 'RUNNING'; // 20% - Run around
                duration = 5000;
            } else if (rand < 0.60) {
                nextState = 'SLEEPING'; // 15% - Nap
                duration = 8000;
            } else if (rand < 0.70) {
                nextState = 'HAPPY'; // 10% - Jump for joy
                duration = 3000;
            } else {
                nextState = 'IDLE';
            }

            setBotState(nextState);
            behaviorTimerRef.current = setTimeout(triggerBehavior, duration + 2000); // Wait a bit between states
        };

        behaviorTimerRef.current = setTimeout(triggerBehavior, 5000);
        return () => clearTimeout(behaviorTimerRef.current);
    }, []);

    const handleShowBubble = () => {
        if (botState === 'SLEEPING') setBotState('IDLE');
        setShowBubble(true);
        setTimeout(() => setShowBubble(false), 6000);
    };

    const handleBotClick = () => {
        handleShowBubble();
        setBotState('HAPPY');
        setTimeout(() => setBotState('IDLE'), 2000);
    };

    // Animation Variants
    const containerVariants = {
        IDLE: { y: [0, -6, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } },
        HAPPY: { y: [0, -15, 0], scale: [1, 1.1, 1], transition: { duration: 0.5, repeat: 2 } },
        FLYING: {
            x: [0, -20, 20, -10, 0],
            y: [0, -30, -10, -20, 0],
            rotate: [0, -5, 5, -3, 0],
            transition: { duration: 6, ease: "easeInOut" }
        },
        RUNNING: {
            x: [0, -30, 30, -10, 0],
            transition: { duration: 4, ease: "linear" }
        },
        SLEEPING: { y: 10, rotate: 5, filter: "brightness(0.9)" },
    };

    const eyeVariants = {
        IDLE: { scaleY: 1 },
        HAPPY: { scaleY: 1.2 },
        SLEEPING: { scaleY: 0.1 },
        RUNNING: { scale: 1.1 },
        FLYING: { scale: 1.2 } // Wide eyed wonder
    };

    // Propeller spin
    const propVariants = {
        FLYING: { rotate: 360, transition: { duration: 0.1, repeat: Infinity, ease: "linear" } }
    };

    const mouthVariants = {
        IDLE: { d: "M38 52 Q50 56 62 52", strokeWidth: 2, opacity: 1, transition: { duration: 0.5 } }, // Gentle smile
        HAPPY: { d: "M38 50 Q50 65 62 50", strokeWidth: 3, opacity: 1, transition: { duration: 0.3 } }, // Big smile
        FLYING: { d: "M45 52 Q50 58 55 52", strokeWidth: 3, opacity: 1, transition: { duration: 0.3 } }, // 'O' mouth
        RUNNING: { d: "M42 54 Q50 50 58 54", strokeWidth: 2, opacity: 1, transition: { duration: 0.3 } }, // Wavy mouth
        SLEEPING: { d: "M46 54 Q50 54 54 54", strokeWidth: 2, opacity: 0.6, transition: { duration: 1 } } // Flat line
    };

    // Blink Logic (Randomized for realism)
    const [blink, setBlink] = useState(false);
    useEffect(() => {
        let timeoutId;
        const triggerBlink = () => {
            setBlink(true);
            setTimeout(() => setBlink(false), 150);
            timeoutId = setTimeout(triggerBlink, Math.random() * 3000 + 2000);
        };
        triggerBlink();
        return () => clearTimeout(timeoutId);
    }, []);

    return (
        <motion.div
            className="eve-container"
            drag
            dragMomentum={false}
            whileDrag={{ scale: 1.1, cursor: 'grabbing' }}
        >
            {/* Chat Bubble */}
            <AnimatePresence>
                {showBubble && (
                    <motion.div
                        className="eve-bubble"
                        initial={{ opacity: 0, scale: 0.5, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 10 }}
                    >
                        <div className="bubble-text">{currentMessage}</div>
                        <div className="bubble-tail" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ZZZ */}
            <AnimatePresence>
                {botState === 'SLEEPING' && (
                    <motion.div
                        initial={{ opacity: 0, y: 0, x: 20 }}
                        animate={{ opacity: [0, 1, 0], y: -30, x: 30 }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ position: 'absolute', top: 0, right: 0, fontSize: '20px', fontWeight: 'bold', color: '#818cf8' }}
                    >
                        Zzz...
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Kawaii Robot Button */}
            <motion.button
                className="eve-character-btn"
                onClick={handleBotClick}
                initial="IDLE"
                animate={botState}
                variants={containerVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Shadow */}
                    <ellipse cx="70" cy="120" rx="30" ry="6" fill="black" fillOpacity="0.2" />

                    {/* PLANE GROUP (Only visible when FLYING) */}
                    <motion.g
                        initial={{ opacity: 0, scale: 0 }}
                        animate={botState === 'FLYING' ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Plane Body */}
                        <path d="M20 90 L120 90 L110 110 L30 110 Z" fill="#ef4444" />
                        <path d="M50 90 L30 70 L90 70 L110 90" fill="#fca5a5" />
                        {/* Wing */}
                        <path d="M60 95 L130 95 L140 105 L50 105 Z" fill="#b91c1c" />
                        {/* Propeller */}
                        <motion.rect x="10" y="80" width="10" height="40" fill="#cbd5e1" variants={propVariants} style={{ originX: "15px", originY: "100px" }} />
                    </motion.g>

                    {/* SUITCASE (Visible when IDLE/HAPPY/THINKING/SLEEPING) */}
                    <motion.g
                        transform="translate(80, 60)"
                        animate={botState === 'FLYING' || botState === 'RUNNING' ? { opacity: 0 } : { opacity: 1 }}
                    >
                        <rect x="0" y="10" width="36" height="45" rx="6" fill="#3b82f6" stroke="#1e40af" strokeWidth="2" />
                        <path d="M10 10 V0 H26 V10" stroke="#1e40af" strokeWidth="3" strokeLinecap="round" fill="none" />
                        <circle cx="8" cy="55" r="4" fill="#1e293b" />
                        <circle cx="28" cy="55" r="4" fill="#1e293b" />
                    </motion.g>

                    {/* ROBOT GROUP */}
                    <motion.g
                        animate={botState === 'FLYING' ? { y: 15, x: 10 } : { y: 0, x: 25 }}
                    >
                        {/* Arms */}
                        <motion.path
                            d="M25 70 Q10 80 20 90"
                            stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round"
                            animate={
                                botState === 'HAPPY' ? { d: "M25 70 Q10 50 20 40" } :
                                    botState === 'FLYING' ? { d: "M25 70 Q5 70 5 60" } : // Arms out flying
                                        botState === 'RUNNING' ? { d: ["M25 70 Q10 80 20 90", "M25 70 Q10 60 20 50"] } : {}
                            }
                            transition={botState === 'RUNNING' ? { duration: 0.3, repeat: Infinity, repeatType: "reverse" } : {}}
                        />
                        <motion.path
                            d="M75 70 Q90 80 80 90"
                            stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round"
                            animate={
                                botState === 'HAPPY' ? { d: "M75 70 Q90 50 80 40" } :
                                    botState === 'FLYING' ? { d: "M75 70 Q95 70 95 60" } :
                                        botState === 'RUNNING' ? { d: ["M75 70 Q90 60 80 50", "M75 70 Q90 80 80 90"] } : {}
                            }
                            transition={botState === 'RUNNING' ? { duration: 0.3, repeat: Infinity, repeatType: "reverse" } : {}}
                        />

                        {/* Torso */}
                        <rect x="30" y="60" width="40" height="35" rx="12" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
                        <circle cx="50" cy="75" r="6" fill="#fb923c" />

                        {/* Head */}
                        <rect x="15" y="15" width="70" height="55" rx="22" fill="#fb923c" />
                        <rect x="15" y="15" width="70" height="55" rx="22" fill="url(#headGradient)" fillOpacity="0.5" />

                        {/* Face Screen */}
                        <rect x="22" y="25" width="56" height="32" rx="14" fill="#0f172a" />

                        {/* Eyes */}
                        <g transform="translate(0, 0)">
                            <motion.ellipse
                                cx="36" cy="41" rx="6" ry="8"
                                fill="#38bdf8"
                                animate={blink || botState === 'SLEEPING' ? { scaleY: 0.1 } : eyeVariants[botState] || { scaleY: 1 }}
                                transition={{ duration: 0.2 }}
                            />
                            <circle cx="38" cy="38" r="2" fill="white" opacity={blink ? 0 : 1} />

                            <motion.ellipse
                                cx="64" cy="41" rx="6" ry="8"
                                fill="#38bdf8"
                                animate={blink || botState === 'SLEEPING' ? { scaleY: 0.1 } : eyeVariants[botState] || { scaleY: 1 }}
                                transition={{ duration: 0.2 }}
                            />
                            <circle cx="66" cy="38" r="2" fill="white" opacity={blink ? 0 : 1} />

                            {/* Mouth */}
                            <motion.path
                                fill="none" stroke="#38bdf8" strokeLinecap="round"
                                animate={botState}
                                variants={mouthVariants}
                            />
                        </g>

                        {/* Antennae */}
                        <line x1="50" y1="15" x2="50" y2="5" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
                        <circle cx="50" cy="5" r="3" fill="#fb923c" />
                    </motion.g>

                    <defs>
                        <linearGradient id="headGradient" x1="15" y1="15" x2="85" y2="70" gradientUnits="userSpaceOnUse">
                            <stop stopColor="white" stopOpacity="0.4" />
                            <stop offset="1" stopColor="white" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                </svg>
            </motion.button>
        </motion.div>
    );
}
