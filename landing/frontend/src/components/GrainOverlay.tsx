import { motion } from 'framer-motion';
import './grain.css';

export function GrainOverlay() {
  return (
    <>
      <div className="grain" aria-hidden />
      <div className="vignette" aria-hidden />
      <div className="mesh-glow mesh-glow--primary" aria-hidden />
      <div className="mesh-glow mesh-glow--secondary" aria-hidden />
    </>
  );
}

export function ScrollIndicator() {
  return (
    <motion.div
      className="scroll-indicator"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2, duration: 1 }}
      aria-hidden
    >
      <span>Scroll to explore</span>
      <motion.div
        className="scroll-line"
        animate={{ scaleY: [0.3, 1, 0.3] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  );
}
