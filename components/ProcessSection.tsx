'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  RiSensorLine,
  RiServerLine,
  RiBrainLine,
  RiRemoteControlLine,
  RiBarChartBoxLine,
  RiNotification3Line,
} from 'react-icons/ri';

const steps = [
  {
    number: '01',
    icon: RiSensorLine,
    title: 'Sensor Data Collection',
    subtitle: 'Edge Hardware Layer',
    description: 'ESP8266-based nodes measure soil moisture, temperature, and rain detection. Data is dispatched via WiFi.',
    detail: 'DHT22 · Capacitive Probe',
    color: '#46A908',
  },
  {
    number: '02',
    icon: RiServerLine,
    title: 'Real-Time Ingestion',
    subtitle: 'Appwrite BaaS',
    description: 'Telemetry lands in Appwrite\'s database within milliseconds with live subscription updates.',
    detail: 'Sub-100ms Latency',
    color: '#91D956',
  },
  {
    number: '03',
    icon: RiBrainLine,
    title: 'Decision Engine',
    subtitle: 'Rule Processing',
    description: 'The engine evaluates moisture thresholds and weather to calculate optimal irrigation strategy.',
    detail: 'Threshold Rules',
    color: '#46A908',
  },
  {
    number: '04',
    icon: RiRemoteControlLine,
    title: 'Actuator Commands',
    subtitle: 'Remote Control',
    description: 'Commands trigger relay-driven pumps and valves, then report back execution status.',
    detail: 'Relay Modules',
    color: '#91D956',
  },
  {
    number: '05',
    icon: RiBarChartBoxLine,
    title: 'Analytics',
    subtitle: 'Insights Dashboard',
    description: 'Historical data is aggregated into reports to track water usage and crop health trends.',
    detail: 'Interactive Charts',
    color: '#46A908',
  },
  {
    number: '06',
    icon: RiNotification3Line,
    title: 'Alerts',
    subtitle: 'Proactive Monitoring',
    description: 'Critical events trigger push notifications in real time so farmers can act fast from the field.',
    detail: 'FCM Push',
    color: '#91D956',
  },
];

export default function HorizontalProcess() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section

      id="process"

      ref={ref}

      style={{

        backgroundColor: '#080808',

        padding: '4rem 1.5rem',

        position: 'relative',

        overflow: 'hidden',

      }}

    >

      {/* Background grid */}

      <div style={{

        position: 'absolute', inset: 0, pointerEvents: 'none',

        backgroundImage: `

          linear-gradient(rgba(70,169,8,0.03) 1px, transparent 1px),

          linear-gradient(90deg, rgba(70,169,8,0.03) 1px, transparent 1px)

        `,

        backgroundSize: '80px 80px',

      }} />



      {/* Ambient glow bottom-left */}

      <div style={{

        position: 'absolute', bottom: '-100px', left: '-100px',

        width: '500px', height: '500px', borderRadius: '50%',

        backgroundColor: 'rgba(70,169,8,0.04)',

        filter: 'blur(100px)', pointerEvents: 'none',

      }} />



      <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>



        {/* Header */}

        <motion.div

          initial={{ opacity: 0, y: 30 }}

          animate={inView ? { opacity: 1, y: 0 } : {}}

          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}

          style={{ textAlign: 'center', marginBottom: '3rem' }}

        >

          <span style={{

            fontSize: '0.75rem',

            fontWeight: 600,

            textTransform: 'uppercase',

            color: '#46A908',

            display: 'block',

            marginBottom: '1rem',

          }}>

            How It Works

          </span>

          <div style={{

            fontSize: 'clamp(2rem, 4.5vw, 2.5rem)',

            fontWeight: 600,

            color: '#ffffff',

            letterSpacing: '-0.02em',

            lineHeight: 1.1,

            marginBottom: '1.2rem',

          }}>

            From Soil Sensor to Smart Action

          </div>

          <p style={{

            fontFamily: '"DM Sans", sans-serif',

            fontSize: '1rem',

            color: 'rgba(240,240,240,0.45)',

            maxWidth: '480px',

            margin: '0 auto',

            lineHeight: 1.75,

            fontWeight: 300,

          }}>

            Six tightly integrated layers working in concert hardware

            to cloud to insight to action.

          </p>

        </motion.div>

        {/* Timeline Grid */}
        <div className="horizontal-timeline-grid">
          {steps.map((step, i) => (
            <div key={step.number} className="timeline-item">          
              <StepCard step={step} index={i} inView={inView} />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .horizontal-timeline-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 4rem 2rem;
          position: relative;
        }

        .timeline-item {
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .horizontal-connector {
          position: absolute;
          top: 24px; /* Align with icon center */
          left: calc(50% + 24px);
          right: calc(-50% + 24px);
          height: 1px;
          background: linear-gradient(90deg, rgba(70,169,8,0.4), transparent);
          z-index: 0;
        }

        @media (max-width: 1024px) {
          .horizontal-timeline-grid { grid-template-columns: repeat(2, 1fr); }
          .horizontal-connector { display: none; }
        }

        @media (max-width: 640px) {
          .horizontal-timeline-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  );
}

function StepCard({ step, index, inView }: any) {
  const Icon = step.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      style={{ position: 'relative', zIndex: 1 }}
    >
      {/* Icon Circle */}
      {/* <div style={{
        width: 48, height: 48,
        borderRadius: '12px',
        backgroundColor: '#111',
        border: `1px solid ${step.color}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '1.5rem',
        boxShadow: `0 0 20px ${step.color}15`,
      }}>
        <Icon size={22} color={step.color} />
      </div> */}

      {/* Content */}
      <div style={{
        backgroundColor: '#111',
        padding: '1.5rem',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.05)',
        height: '100%'
      }}>
        <div style={{ fontSize: '0.65rem', color: step.color, fontWeight: 700, marginBottom: '0.5rem' }}>
          STEP {step.number} :- {step.subtitle}
        </div>
        <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.75rem' }}>{step.title}</h3>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1rem' }}>
          {step.description}
        </p>
        <div style={{ fontSize: '0.7rem', color: 'rgba(70,169,8,0.6)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
          {step.detail}
        </div>
      </div>
    </motion.div>
  );
}