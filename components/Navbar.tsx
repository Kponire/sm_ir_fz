'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { RiLeafLine, RiMenu3Line, RiCloseLine } from 'react-icons/ri';

const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Process', href: '#process' },
  { label: 'Download', href: '#download' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    const unsub = scrollY.on('change', (v) => setScrolled(v > 40));
    return unsub;
  }, [scrollY]);

  const smoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    setOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'static',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '0 2rem',
        transition: 'all 0.4s ease',
        backgroundColor: scrolled ? 'rgba(10,10,10,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(70,169,8,0.12)' : '1px solid transparent',
      }}
    >
      <nav style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '72px',
      }}>
        {/* Logo */}
        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <img src="logo.png" alt="Company Logo" style={{
            width: 46, height: 46,
          }}/>
          <span style={{
            fontFamily: '"Syne", sans-serif',
            fontWeight: 700,
            fontSize: '1rem',
            letterSpacing: '0.02em',
            color: '#f0f0f0',
          }}>
            Croppeak_ng
          </span>
        </a>

        {/* Desktop links */}
        <ul style={{
          display: 'flex', gap: '2.5rem', listStyle: 'none',
          margin: 0, padding: 0,
        }}
          className="nav-desktop"
        >
          {navLinks.map(({ label, href }) => (
            <li key={label}>
              <a
                href={href}
                onClick={(e) => smoothScroll(e, href)}
                style={{
                  color: '#9a9a9a',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontFamily: '"DM Sans", sans-serif',
                  fontWeight: 500,
                  letterSpacing: '0.04em',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLElement>) => (e.currentTarget.style.color = '#46A908')}
                onMouseLeave={(e: React.MouseEvent<HTMLElement>) => (e.currentTarget.style.color = '#9a9a9a')}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <motion.a
            href="/register"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              //backgroundColor: '#46A908',
              color: '#fff',
              padding: '0.35rem 1.4rem',
              border: "2px solid #46A908",
              borderRadius: '28px',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontFamily: '"DM Sans", sans-serif',
              fontWeight: 600,
              letterSpacing: '0.03em',
            }}
            className="nav-cta"
          >
            Get Started
          </motion.a>

          {/* Hamburger */}
          <button
            onClick={() => setOpen(!open)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#f0f0f0', display: 'none', padding: 0,
            }}
            className="nav-hamburger"
          >
            {open ? <RiCloseLine size={24} /> : <RiMenu3Line size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          style={{
            backgroundColor: 'rgba(10,10,10,0.98)',
            borderTop: '1px solid rgba(70,169,8,0.15)',
            padding: '1.5rem 2rem',
          }}
        >
          {navLinks.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              onClick={(e) => smoothScroll(e, href)}
              style={{
                display: 'block',
                padding: '0.875rem 0',
                color: '#d0d0d0',
                textDecoration: 'none',
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '1rem',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {label}
            </a>
          ))}
          <a
            href="/register"
            style={{
              display: 'block',
              marginTop: '1rem',
              backgroundColor: '#46A908',
              color: '#fff',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              textDecoration: 'none',
              textAlign: 'center',
              fontFamily: '"DM Sans", sans-serif',
              fontWeight: 600,
            }}
          >
            Get Started
          </a>
        </motion.div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }
          .nav-cta { display: none !important; }
        }
      `}</style>
    </motion.header>
  );
}