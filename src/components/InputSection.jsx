import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EXAMPLE_PROMPTS } from '../utils/helpers';
import './InputSection.css';

export default function InputSection({ onGenerate, onClear, hasData, loading }) {
    const [prompt, setPrompt] = useState('');
    const inputRef = useRef();

    const handleSubmit = () => {
        const text = prompt.trim();
        if (!text) { alert('Please enter your travel preferences'); return; }
        onGenerate(text);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSubmit();
    };

    const handlePdf = () => {
        // trigger browser print — same logic as original
        window.dispatchEvent(new CustomEvent('print-itinerary'));
    };

    return (
        <motion.section
            className="input-section"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <div className="input-wrapper">
                <div className="input-row">
                    <div className="input-field">
                        <div className="input-glow" />
                        <input
                            ref={inputRef}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Describe your dream Sri Lanka trip... (e.g., '5 day cultural triangle tour with tea estates')"
                            disabled={loading}
                        />
                    </div>
                    <div className="btn-group">
                        <motion.button
                            className="btn btn-primary"
                            onClick={handleSubmit}
                            disabled={loading}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.97 }}
                        >
                            <span>{loading ? '⏳' : '✨'}</span>
                            {loading ? 'Generating...' : 'Generate'}
                        </motion.button>

                        <AnimatePresence>
                            {hasData && (
                                <>
                                    <motion.button
                                        className="btn btn-success"
                                        onClick={handlePdf}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                        whileHover={{ y: -2 }}
                                        whileTap={{ scale: 0.97 }}
                                    >
                                        <span>📄</span> PDF
                                    </motion.button>
                                    <motion.button
                                        className="btn btn-danger"
                                        onClick={() => { onClear(); setPrompt(''); }}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                        whileHover={{ y: -2 }}
                                        whileTap={{ scale: 0.97 }}
                                    >
                                        <span>✕</span>
                                    </motion.button>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="examples">
                    {EXAMPLE_PROMPTS.map((ex, i) => (
                        <motion.span
                            key={i}
                            className="example-chip"
                            onClick={() => { setPrompt(ex.prompt); inputRef.current?.focus(); }}
                            whileHover={{ scale: 1.05, backgroundColor: 'var(--primary)', borderColor: 'var(--primary)', color: '#fff' }}
                            whileTap={{ scale: 0.96 }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + i * 0.06 }}
                        >
                            {ex.emoji} {ex.label}
                        </motion.span>
                    ))}
                </div>
            </div>
        </motion.section>
    );
}
