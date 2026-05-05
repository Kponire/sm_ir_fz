'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  RiLeafLine,
  RiDropLine,
  RiLineChartLine,
  RiShieldCheckLine,
  RiWifiLine,
} from 'react-icons/ri';

const pillars = [
  { icon: RiDropLine, label: 'Smart Irrigation', desc: 'Soil-moisture-driven watering that eliminates waste.' },
  { icon: RiLeafLine, label: 'NPK Automation', desc: 'Precision fertigation calibrated to crop growth stages.' },
  { icon: RiLineChartLine, label: 'Live Analytics', desc: 'Dashboards with sensor telemetry updated every 30 s.' },
  { icon: RiWifiLine, label: 'IoT-Connected', desc: 'ESP8266 edge nodes relay data over WiFi in real time.' },
  { icon: RiShieldCheckLine, label: 'Resilient & Safe', desc: 'Rule-based guards prevent over-irrigation and pump dry-run.' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.75, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const fadeLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 1, ease: [0.22, 1, 0.36, 1] } },
};

const fadeRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 1, ease: [0.22, 1, 0.36, 1] } },
};

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section
      id="about"
      ref={sectionRef}
      style={{
        backgroundColor: '#0a0a0a',
        padding: '4rem 1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient blob top-right */}
      <div style={{
        position: 'absolute', top: '-120px', right: '-120px',
        width: '480px', height: '480px', borderRadius: '50%',
        backgroundColor: 'rgba(70,169,8,0.05)',
        filter: 'blur(80px)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Section label */}
        <motion.div
          initial="hidden" animate={inView ? 'visible' : 'hidden'}
          variants={fadeUp} custom={0}
          style={{ textAlign: 'center', marginBottom: '1rem' }}
        >
          <span style={{
            fontSize: '0.95rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            color: '#46A908',
          }}>
            About the System
          </span>
        </motion.div>

        {/* Section title */}
        <motion.div
          initial="hidden" animate={inView ? 'visible' : 'hidden'}
          variants={fadeUp} custom={1}
          style={{
            fontSize: 'clamp(2rem, 4.5vw, 3.0rem)',
            fontWeight: 600,
            color: '#ffffff',
            textAlign: 'center',
            letterSpacing: '-0.02em',
            marginBottom: '1rem',
            lineHeight: 1.1,
          }}
        >
          Built for the Modern Farm
        </motion.div>

        <motion.p
          initial="hidden" animate={inView ? 'visible' : 'hidden'}
          variants={fadeUp} custom={2}
          style={{
            fontSize: '1.05rem',
            color: 'rgba(240,240,240,0.5)',
            textAlign: 'center',
            maxWidth: '520px',
            margin: '0 auto 3rem',
            lineHeight: 1.75,
            fontWeight: 300,
          }}
        >
          Marrying edge hardware with cloud intelligence to give every farmer
          the same precision tools used by industrial agri-tech operations.
        </motion.p>

        {/* Two-column layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '4rem',
          alignItems: 'center',
        }}>

          {/* LEFT — visual */}
          <motion.div
            initial="hidden" animate={inView ? 'visible' : 'hidden'}
            variants={fadeLeft}
            style={{ 
              position: 'relative', 
              height: "100%", 
              display: 'flex',
              flexDirection: 'column' 
            }}
          >
            {/* Main card */}
            <div style={{
              borderRadius: '20px',
              overflow: 'hidden',
              border: '1px solid rgba(70,169,8,0.18)',
              backgroundColor: '#111',
              position: 'relative',
              flex: 1, 
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Image area */}
              <div style={{
                width: '100%',
                flex: 1, 
                backgroundColor: '#141414',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <img
                  src="https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=800&q=80"
                  alt="Smart farm irrigation system"
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    // 4. objectFit: 'cover' is key here to keep the image looking good
                    objectFit: 'cover', 
                    filter: 'brightness(0.75) saturate(0.8)' 
                  }}
                />
                {/* Overlay accent */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(135deg, rgba(70,169,8,0.15) 0%, transparent 60%)',
                }} />
              </div>

              {/* Floating metric — bottom-right */}
              <motion.div
                initial={{ opacity: 0, scale: 0.7, x: 20 }}
                animate={inView ? { opacity: 1, scale: 1, x: 0 } : {}}
                transition={{ delay: 0.65, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  position: 'absolute',
                  bottom: '4.5rem', right: '1.25rem',
                  backgroundColor: 'rgba(10,10,10,0.88)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  padding: '0.75rem 1.2rem',
                  textAlign: 'right',
                }}
              >
                <div style={{ fontFamily: '"Syne", sans-serif', fontSize: '1.6rem', fontWeight: 800, color: '#46A908', lineHeight: 1 }}>
                  38%
                </div>
                <div style={{ fontSize: '0.72rem', color: '#666', marginTop: '3px' }}>
                  avg water saved
                </div>
              </motion.div>

              {/* Bottom info bar */}
              <div style={{
                padding: '1rem 1.25rem',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.78rem', color: '#555' }}>
                  Croppeak_ng Field Installation
                </span>
                <span style={{
                  fontSize: '0.7rem',
                  color: '#91D956',
                  padding: '3px 10px',
                  borderRadius: '100px',
                  fontWeight: 500,
                }}>
                  v2.3.1
                </span>
              </div>
            </div>

            {/* Decorative corner accent */}
            <div style={{
              position: 'absolute',
              bottom: '-24px', left: '-24px',
              width: '80px', height: '80px',
              border: '2px solid rgba(70,169,8,0.2)',
              borderRadius: '12px',
              zIndex: -1,
            }} />
          </motion.div>

          {/* RIGHT — text + pillars */}
          <motion.div
            initial="hidden" animate={inView ? 'visible' : 'hidden'}
            variants={fadeRight}
          >
            <h3 style={{
              fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.2,
              marginBottom: '1.2rem',
              letterSpacing: '-0.01em',
            }}>
              A complete precision agriculture<br />
              <span style={{ color: '#46A908' }}>intelligence layer</span>
            </h3>

            <p style={{
              fontSize: '1rem',
              color: 'rgba(240,240,240,0.55)',
              lineHeight: 1.8,
              marginBottom: '1.5rem',
              fontWeight: 300,
            }}>
              Croppeak_ng connects low-cost ESP8266 microcontrollers and analog soil sensors
              to a cloud-hosted management dashboard. Farmers get real-time visibility,
              automated decision-making, and historical analytics without expensive
              proprietary hardware.
            </p>

            {/* Pillars list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pillars.map(({ icon: Icon, label, desc }, i) => (
                <motion.div
                  key={label}
                  initial="hidden" animate={inView ? 'visible' : 'hidden'}
                  variants={fadeUp} custom={i + 3}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    //padding: '0.85rem 1rem',
                    borderRadius: '12px',
                    //border: '1px solid rgba(255,255,255,0.05)',
                    //backgroundColor: 'rgba(255,255,255,0.02)',
                    transition: 'all 0.25s ease',
                    cursor: 'default',
                  }}
                >
                  <div>
                    <div style={{
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: '#e8e8e8',
                      marginBottom: '3px',
                    }}>
                      {label}
                    </div>
                    <div style={{
                      fontSize: '0.82rem',
                      color: '#5a5a5a',
                      lineHeight: 1.5,
                    }}>
                      {desc}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%,100%{ box-shadow: 0 0 6px #46A908; }
          50%{ box-shadow: 0 0 14px #46A908; }
        }
      `}</style>
    </section>
  );
}