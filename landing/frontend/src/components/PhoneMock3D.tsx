import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { useRef, type MouseEvent } from 'react';
import { PhoneScreen, type PhoneVisual } from './phoneScreens';

type Props = {
  visual: PhoneVisual;
  active: boolean;
  scrollRotate?: MotionValue<number>;
  scrollY?: MotionValue<number>;
};

export function PhoneMock3D({ visual, active, scrollRotate, scrollY }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const tiltX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), {
    stiffness: 140,
    damping: 22,
  });
  const tiltY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), {
    stiffness: 140,
    damping: 22,
  });

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const onLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className="phone-3d"
      style={{
        rotateX: tiltX,
        rotateY: scrollRotate ?? tiltY,
        y: scrollY,
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <motion.div
        className="phone-3d__float"
        animate={active ? { y: [0, -6, 0] } : { y: 0 }}
        transition={
          active
            ? { y: { duration: 6, repeat: Infinity, ease: 'easeInOut' } }
            : { duration: 0.3 }
        }
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="phone-3d__shadow" aria-hidden />

        <div className="phone-3d__device">
          <div className="phone-3d__frame">
            <div className="phone-3d__buttons phone-3d__buttons--left" aria-hidden>
              <span />
              <span />
              <span />
            </div>
            <div className="phone-3d__buttons phone-3d__buttons--right" aria-hidden>
              <span />
            </div>

            <div className="phone-3d__screen-stack">
              <div className="phone-3d__display">
                <PhoneScreen visual={visual} active={active} />
                <div className="phone-3d__island" aria-hidden>
                  <span className="phone-3d__island-cam" />
                </div>
                <div className="phone-3d__glass" aria-hidden />
              </div>
              <div className="phone-3d__home-bar" aria-hidden />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export type { PhoneVisual };
