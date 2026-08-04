import { motion } from 'motion/react';
import { useUniverse } from '../../state/UniverseContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import { aboutSlides } from '../../data/aboutSlides';
import { EASE_POP, FONT_SANS, FONT_SERIF } from '../../theme';

interface AboutSceneProps {
  visible: boolean;
}

function pseudoRandomRotation(lineIndex: number): number {
  const rand = Math.sin(lineIndex * 12.9898) * 43758.5453;
  const frac = rand - Math.floor(rand);
  return (frac - 0.5) * 6;
}

export function AboutScene({ visible }: AboutSceneProps) {
  const { state, actions } = useUniverse();
  const isMobile = useIsMobile();
  const slide = aboutSlides[state.aboutSlideIndex];
  const crumbled = state.aboutPhase !== 'idle';
  const n = slide.lines.length;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 35,
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity 0.8s ease',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 60% 55%, rgba(4,5,10,0.15) 0%, rgba(2,3,7,0.6) 60%, rgba(0,0,0,0.82) 100%)',
        }}
      />

      <div
        onClick={actions.advanceAboutSlide}
        style={
          isMobile
            ? {
                position: 'absolute',
                inset: 0,
                overflow: 'hidden',
                zIndex: 1,
                cursor: 'pointer',
              }
            : {
                position: 'absolute',
                right: '30%',
                top: '50%',
                transform: 'translateY(-50%)',
                width: 'min(46vw,520px)',
                height: '78vh',
                borderRadius: 4,
                overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                zIndex: 2,
                cursor: 'pointer',
              }
        }
      >
        <img
          src="/uploads/astrnauta.jpg"
          draggable={false}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: isMobile ? '68% 30%' : '62% 38%',
            display: 'block',
            filter: 'url(#keyBlack) grayscale(1) brightness(0.9) contrast(1.1)',
            opacity: isMobile ? 0.22 : 0.38,
          }}
        />
      </div>

      {state.aboutTextShown && (
        <>
          <div
            style={
              isMobile
                ? {
                    position: 'absolute',
                    left: '50%',
                    top: '46%',
                    transform: 'translate(-50%,-50%)',
                    width: 320,
                    height: 320,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${slide.glow}, transparent 70%)`,
                    filter: 'blur(20px)',
                    opacity: state.aboutTextRevealed ? 0.55 : 0,
                    transition: 'opacity 1.1s ease, background 0.8s ease',
                    pointerEvents: 'none',
                    zIndex: 1,
                  }
                : {
                    position: 'absolute',
                    left: 'calc(5% - 60px)',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 260,
                    height: 260,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${slide.glow}, transparent 70%)`,
                    filter: 'blur(20px)',
                    opacity: state.aboutTextRevealed ? 0.7 : 0,
                    transition: 'opacity 1.1s ease, background 0.8s ease',
                    pointerEvents: 'none',
                    zIndex: 1,
                  }
            }
          />
          <div
            onClick={actions.advanceAboutSlide}
            style={
              isMobile
                ? {
                    position: 'absolute',
                    left: '50%',
                    top: '54%',
                    transform: 'translate(-50%,-50%)',
                    width: 'calc(100% - 48px)',
                    maxWidth: 440,
                    padding: '0 4px',
                    textAlign: 'center',
                    opacity: state.aboutTextRevealed ? 1 : 0,
                    transition: 'opacity 1.1s ease',
                    cursor: 'pointer',
                    zIndex: 2,
                  }
                : {
                    position: 'absolute',
                    left: '5%',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 'min(38vw,420px)',
                    maxWidth: 420,
                    padding: '0 20px',
                    textAlign: 'left',
                    opacity: state.aboutTextRevealed ? 1 : 0,
                    transition: 'opacity 1.1s ease',
                    cursor: 'pointer',
                    zIndex: 2,
                  }
            }
          >
            {slide.lines.map((line, li) => {
              const outDelay = li * 90;
              const inDelay = (n - 1 - li) * 90;
              const delay = state.aboutPhase === 'out' ? outDelay : state.aboutPhase === 'in' ? 0 : inDelay;
              const rot = pseudoRandomRotation(li);
              const mobileSize = Math.round(line.size * 0.72);
              return (
                <motion.div
                  key={li}
                  animate={{
                    opacity: crumbled ? 0 : 1,
                    y: crumbled ? 26 : 0,
                    rotate: crumbled ? rot : 0,
                  }}
                  transition={{ duration: 0.55, ease: EASE_POP, delay: delay / 1000 }}
                  style={{
                    marginTop: li === 0 ? 0 : line.size > 20 ? 24 : 6,
                    fontFamily: line.italic ? FONT_SERIF : FONT_SANS,
                    fontStyle: line.italic ? 'italic' : 'normal',
                    fontSize: isMobile ? mobileSize : line.size,
                    letterSpacing: line.upper ? 2 : 0,
                    textTransform: line.upper ? 'uppercase' : 'none',
                    lineHeight: line.size > 20 && !line.italic ? 1.8 : 1.2,
                    color: line.color,
                    textShadow: line.italic ? `0 0 16px rgba(255,255,255,0.7), 0 0 44px ${slide.glow}` : 'none',
                  }}
                >
                  {line.text}
                </motion.div>
              );
            })}
          </div>

          <a
            href="https://clubdeescritura.com/perfil/85573/kyriez-chaquen/#folder-12496"
            target="_blank"
            rel="noopener"
            title="Kyriez Chaquén"
            style={{
              position: 'fixed',
              right: 22,
              bottom: 64,
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: 'radial-gradient(circle, #cfe6ff 0%, #6fa8ff 55%, transparent 75%)',
              boxShadow: '0 0 8px 3px rgba(120,170,255,0.7), 0 0 16px 6px rgba(120,170,255,0.35)',
              zIndex: 70,
              animation: 'starTwinkle 3.2s ease-in-out infinite',
            }}
          />
          <a
            href="https://clubdeescritura.com/perfil/110806/chaquen/#folder-14377"
            target="_blank"
            rel="noopener"
            title="Chaquén"
            style={{
              position: 'fixed',
              right: 42,
              bottom: 48,
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'radial-gradient(circle, #cfe6ff 0%, #6fa8ff 55%, transparent 75%)',
              boxShadow: '0 0 6px 2px rgba(120,170,255,0.65), 0 0 12px 5px rgba(120,170,255,0.3)',
              zIndex: 70,
              animation: 'starTwinkle 4s ease-in-out infinite 0.6s',
            }}
          />
        </>
      )}
    </div>
  );
}
