'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { RiArrowRightLine, RiPlayCircleLine } from 'react-icons/ri';

const TYPEWRITER_LINES = [
  'Precision Irrigation.',
  'Intelligent Nutrients.',
  'Automated Growth.',
  'Data-Driven Farming.',
];

function useTypewriter(lines: string[], speed = 65, pause = 1800) {
  const [displayed, setDisplayed] = useState('');
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = lines[lineIdx];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && charIdx < current.length) {
      timeout = setTimeout(() => setCharIdx(c => c + 1), speed);
    } else if (!deleting && charIdx === current.length) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && charIdx > 0) {
      timeout = setTimeout(() => setCharIdx(c => c - 1), speed / 2);
    } else if (deleting && charIdx === 0) {
      setDeleting(false);
      setLineIdx(i => (i + 1) % lines.length);
    }

    setDisplayed(current.slice(0, charIdx));
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, lineIdx, lines, speed, pause]);

  return displayed;
}

export default function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '28%']);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const typed = useTypewriter(TYPEWRITER_LINES);

  return (
    <section
      ref={ref}
      id="hero"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Background farm GIF */}
      {/* <motion.div style={{ y, position: 'absolute', inset: 0, zIndex: 0 }}>
        <img
          src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOXlhMWJlbnVudGZxd2Q4bGt5YjF3OGxtMGpuMzBiNml3Z3ZlcjJsMyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l3q2Z4lMPCfQEXkIw/giphy.gif"
          alt="Farm background"
          style={{
            width: '100%', height: '110%',
            objectFit: 'cover',
            objectPosition: 'center',
            filter: 'brightness(0.28) saturate(0.6)',
          }}
        />
      </motion.div> */}

      {/* Overlay layers */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        backgroundColor: 'rgba(10,10,10,0.55)',
      }} />

      {/* Subtle green grid overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2,
        backgroundImage: `
          linear-gradient(rgba(70,169,8,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(70,169,8,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '64px 64px',
      }} />

      {/* Radial vignette */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 3,
        background: 'radial-gradient(ellipse 70% 60% at 50% 40%, transparent 0%, rgba(10,10,10,0.7) 100%)',
      }} />

      {/* Content */}
      <motion.div
        style={{ opacity, position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 1.5rem', maxWidth: '900px' }}
      >
        
        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          style={{
            //fontFamily: '"Syne", sans-serif',
            fontSize: 'clamp(2.8rem, 7vw, 5.5rem)',
            fontWeight: 700,
            lineHeight: 1.05,
            color: '#ffffff',
            marginBottom: '0.5rem',
            letterSpacing: '-0.02em',
          }}
        >
          The Future of
        </motion.h1>

        {/* Typewriter line */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: '"DM Serif Display", serif',
            fontSize: 'clamp(2.6rem, 6.5vw, 5rem)',
            fontStyle: 'italic',
            color: '#46A908',
            lineHeight: 1.1,
            marginBottom: '1.8rem',
            minHeight: '1.2em',
          }}
        >
          {typed}
          <span style={{
            display: 'inline-block',
            width: '3px',
            height: '0.85em',
            backgroundColor: '#46A908',
            marginLeft: '4px',
            verticalAlign: 'middle',
            animation: 'blink 1s step-end infinite',
          }} />
        </motion.div>

        {/* Sub text */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.65 }}
          style={{
            //fontFamily: '"DM Sans", sans-serif',
            color: 'rgba(240,240,240,0.65)',
            maxWidth: '700px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.75,
            fontWeight: 300,
          }}
        >
          Croppeak_ng delivers real-time IoT intelligence for irrigation scheduling,
          NPK fertigation automation, and crop health monitoring, all from one unified platform.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <motion.a
            href="/register"
            whileHover={{ scale: 1.04, boxShadow: '0 0 30px rgba(70,169,8,0.35)' }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#46A908',
              color: '#fff',
              padding: '0.3rem 3rem',
              borderRadius: '30px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              letterSpacing: '0.02em',
            }}
          >
            Start for Free
            <RiArrowRightLine size={18} />
          </motion.a>

          <motion.a
            href="#about"
            onClick={(e: React.MouseEvent<HTMLAnchorElement>) => { e.preventDefault(); document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' }); }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(255,255,255,0.06)',
              color: '#f0f0f0',
              padding: '0.9rem 2rem',
              borderRadius: '30px',
              textDecoration: 'none',
              fontFamily: '"DM Sans", sans-serif',
              fontWeight: 500,
              fontSize: '1rem',
              border: '1px solid rgba(255,255,255,0.12)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <RiPlayCircleLine size={18} />
            See How It Works
          </motion.a>
        </motion.div>
      </motion.div>

      {/* Dashboard Screenshot */}
      <motion.div
        initial={{ opacity: 0, y: 80, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.2, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'relative',
          zIndex: 10,
          marginTop: '4rem',
          width: '100%',
          maxWidth: '1100px',
          padding: '0 1.5rem',
        }}
      >
        {/* Screenshot frame */}
        <div style={{
          borderRadius: '16px 16px 0 0',
          overflow: 'hidden',
          border: '1px solid rgba(70,169,8,0.25)',
          borderBottom: 'none',
          /* boxShadow: `
            0 -20px 80px rgba(70,169,8,0.12),
            0 0 0 1px rgba(255,255,255,0.05),
            inset 0 1px 0 rgba(255,255,255,0.08)
          `, */
        }}>
          {/* Browser chrome bar */}
          <div style={{
            backgroundColor: '#161616',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['#FF5F57', '#FFBD2E', '#28C840'].map((c, i) => (
                <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: c }} />
              ))}
            </div>
            <div style={{
              flex: 1,
              backgroundColor: '#1e1e1e',
              borderRadius: '6px',
              padding: '4px 12px',
              fontSize: '0.72rem',
              color: '#555',
              fontFamily: '"DM Sans", sans-serif',
              textAlign: 'center',
              maxWidth: '360px',
              margin: '0 auto',
            }}>
              croppeak_ng.dashboard.app
            </div>
          </div>

          {/* Dashboard screenshot image */}
          <div style={{
            backgroundColor: '#111',
            minHeight: '420px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Placeholder dashboard mock — replace with actual screenshot */}
            <img src="hero_dash.png" alt="Hero Dashboard" style={{
                width: "100%", height: "100%",
              }}/>
          </div>
        </div>

        {/* Bottom fade into page */}
        {/* <div style={{
          height: '120px',
          background: 'linear-gradient(to bottom, transparent, #0a0a0a)',
          marginTop: '-1px',
        }} /> */}
      </motion.div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes pulse-green {
          0%,100%{ box-shadow: 0 0 6px #46A908; }
          50%{ box-shadow: 0 0 14px #46A908, 0 0 28px rgba(70,169,8,0.4); }
        }
      `}</style>
    </section>
  );
}

/* Inline dashboard mock — replace <img> src with your actual screenshot */
function DashboardMock() {
  return (
    <div style={{
      width: '100%',
      padding: '1.5rem',
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '1rem',
      fontFamily: '"DM Sans", sans-serif',
    }}>
      {/* Stat cards */}
      {[
        { label: 'Soil Moisture', value: '72%', color: '#46A908' },
        { label: 'Temperature', value: '28.4°C', color: '#f59e0b' },
        { label: 'Tank Level', value: '84%', color: '#3b82f6' },
        { label: 'NPK Index', value: '0.91', color: '#91D956' },
      ].map(({ label, value, color }) => (
        <div key={label} style={{
          backgroundColor: '#1a1a1a',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '10px',
          padding: '1rem',
        }}>
          <div style={{ fontSize: '0.7rem', color: '#666', marginBottom: '6px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color }}>{value}</div>
          <div style={{ marginTop: '8px', height: '3px', backgroundColor: '#222', borderRadius: '2px' }}>
            <div style={{ height: '100%', width: value, backgroundColor: color, borderRadius: '2px', opacity: 0.7 }} />
          </div>
        </div>
      ))}

      {/* Chart placeholder */}
      <div style={{
        gridColumn: 'span 3',
        backgroundColor: '#1a1a1a',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '10px',
        padding: '1rem',
        height: '200px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{ fontSize: '0.7rem', color: '#666', marginBottom: '12px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Irrigation Timeline — Last 7 Days</div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
          {[60, 80, 55, 90, 70, 85, 72].map((h, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{
                width: '100%',
                height: `${h}%`,
                backgroundColor: i === 6 ? '#46A908' : 'rgba(70,169,8,0.25)',
                borderRadius: '4px 4px 0 0',
              }} />
              <div style={{ fontSize: '0.6rem', color: '#444' }}>
                {['M','T','W','T','F','S','S'][i]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status */}
      <div style={{
        backgroundColor: '#1a1a1a',
        border: '1px solid rgba(70,169,8,0.2)',
        borderRadius: '10px',
        padding: '1rem',
        height: '200px',
      }}>
        <div style={{ fontSize: '0.7rem', color: '#666', marginBottom: '12px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>System Status</div>
        {['Pump A', 'Zone B', 'Fertigation', 'Sensor Net'].map((item, i) => (
          <div key={item} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.75rem', color: '#888' }}>{item}</span>
            <span style={{
              fontSize: '0.65rem',
              color: i === 2 ? '#f59e0b' : '#46A908',
              backgroundColor: i === 2 ? 'rgba(245,158,11,0.1)' : 'rgba(70,169,8,0.1)',
              padding: '2px 8px',
              borderRadius: '100px',
            }}>
              {i === 2 ? 'IDLE' : 'ACTIVE'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}