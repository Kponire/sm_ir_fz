'use client';

import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { TextInput, Textarea, Button, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  RiMailLine,
  RiGithubLine,
  RiTwitterXLine,
  RiLinkedinBoxLine,
  RiSendPlane2Line,
  RiArrowRightLine,
  RiMapPinLine,
  RiPhoneLine,
} from 'react-icons/ri';

const contactInfo = [
  { icon: RiMailLine, label: 'Email', value: 'hello@apims.io', href: 'mailto:hello@apims.io' },
  { icon: RiPhoneLine, label: 'Phone', value: '+234 800 000 0000', href: 'tel:+2348000000000' },
  { icon: RiMapPinLine, label: 'Location', value: 'Lagos, Nigeria', href: '#' },
];

const socials = [
  { icon: RiGithubLine, href: 'https://github.com', label: 'GitHub' },
  { icon: RiTwitterXLine, href: 'https://twitter.com', label: 'X' },
  { icon: RiLinkedinBoxLine, href: 'https://linkedin.com', label: 'LinkedIn' },
];

export default function ContactSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      id="contact"
      ref={ref}
      style={{
        backgroundColor: '#fff',
        padding: '4rem 1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top separator */}
      <div style={{
        position: 'absolute', top: 0, left: '10%', right: '10%',
        height: '1px', backgroundColor: 'rgba(255,255,255,0.05)',
      }} />

      {/* Ambient glows */}
      <div style={{
        position: 'absolute', top: '20%', left: '-150px',
        width: '500px', height: '500px', borderRadius: '50%',
        backgroundColor: 'rgba(70,169,8,0.04)',
        filter: 'blur(100px)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-100px', right: '-100px',
        width: '400px', height: '400px', borderRadius: '50%',
        backgroundColor: 'rgba(145,217,86,0.03)',
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
            fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase',
            color: '#46A908', display: 'block', marginBottom: '1rem',
          }}>
            Get in Touch
          </span>
          <div style={{
            fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
            fontWeight: 600, color: '#080808',
            letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '1rem',
          }}>
            Let's Talk Precision Farming
          </div>
          <p style={{
            fontSize: '1rem', color: '#080808',
            maxWidth: '560px', margin: '0 auto', lineHeight: 1.75, fontWeight: 300,
          }}>
            Have a question, partnership inquiry, or just want to see Croppeak_ng
            in action on your farm? We'd love to hear from you.
          </p>
        </motion.div>

        {/* Two column grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '3rem',
          alignItems: 'start',
        }}>

          {/* LEFT — info */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <h3 style={{
              fontFamily: '"Syne", sans-serif',
              fontSize: '1.5rem', fontWeight: 700,
              color: '#080808', marginBottom: '0.75rem', letterSpacing: '-0.01em',
            }}>
              Reach the Team
            </h3>
            <p style={{
              fontSize: '0.9rem', color: '#080808',
              lineHeight: 1.75, marginBottom: '2.5rem', fontWeight: 300,
        
            }}>
              We respond to all inquiries within one business day.
              For urgent technical issues, use our direct line.
            </p>

            {/* Contact info items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
              {contactInfo.map(({ icon: Icon, label, value, href }, i) => (
                <motion.a
                  key={label}
                  href={href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: i * 0.1 + 0.2 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    textDecoration: 'none',
                    transition: 'all 0.25s ease',
                  }}
                >

                    <Icon size={20} color="#080808" />
                  <div>
                    <div style={{
                      fontSize: '0.72rem', color: '#555',
                      textTransform: 'uppercase', marginBottom: '2px',
                    }}>
                      {label}
                    </div>
                    <div style={{
                      fontSize: '0.9rem', color: '#080808', fontWeight: 500,
                    }}>
                      {value}
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>

            {/* Socials */}
            <div>
              <p style={{
                fontSize: '0.72rem', color: '#444',
                textTransform: 'uppercase', marginBottom: '0.85rem',
              }}>
                Follow the Project
              </p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {socials.map(({ icon: Icon, href, label }) => (
                  <motion.a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, borderColor: 'rgba(70,169,8,0.5)' }}
                    whileTap={{ scale: 0.95 }}
                    title={label}
                    style={{
                      width: 42, height: 42, borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.08)',
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#666', textDecoration: 'none',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e: React.MouseEvent<HTMLElement>)=> { (e.currentTarget as HTMLElement).style.color = '#46A908'; }}
                    onMouseLeave={(e: React.MouseEvent<HTMLElement>)=> { (e.currentTarget as HTMLElement).style.color = '#666'; }}
                  >
                    <Icon size={18} />
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* RIGHT — form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            /* style={{
              backgroundColor: '#111',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '20px',
              padding: '2rem',
            }} */
          >
            <img src="contact_2.jpg" alt="Contact" style={{
                width: "100%"
              }}/>
          </motion.div>
        </div>
      </div>
    </section>
  );
}