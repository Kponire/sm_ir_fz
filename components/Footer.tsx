'use client';

import { motion } from 'framer-motion';
import {
  RiLeafLine,
  RiGithubLine,
  RiTwitterXLine,
  RiLinkedinBoxLine,
  RiArrowUpLine,
} from 'react-icons/ri';

const footerLinks = {
  Product: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Mobile App', href: '#download' },
    { label: 'API Docs', href: '/docs' },
    { label: 'Changelog', href: '/changelog' },
  ],
  Company: [
    { label: 'About', href: '#about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact', href: '#contact' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Use', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
  ],
};

const socials = [
  { icon: RiGithubLine, href: 'https://github.com', label: 'GitHub' },
  { icon: RiTwitterXLine, href: 'https://twitter.com', label: 'X' },
  { icon: RiLinkedinBoxLine, href: 'https://linkedin.com', label: 'LinkedIn' },
];

export default function Footer() {
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer style={{
      backgroundColor: '#060606',
      borderTop: '1px solid rgba(255,255,255,0.05)',
      padding: '4rem 1.5rem 4rem',
      position: 'relative',
    }}>
      {/* Subtle top glow */}
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '400px', height: '1px',
        backgroundColor: 'rgba(70,169,8,0.3)',
        filter: 'blur(6px)',
      }} />

      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Main grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr repeat(3, 1fr)',
          gap: '3rem',
          //marginBottom: '4rem',
        }}
          className="footer-grid"
        >
          {/* Brand column */}
          <div>
            <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '1.25rem' }}>
              <img src="logo.png" alt="Company Logo" style={{
                width: 46, height: 46,
              }}/>
              <span style={{
                fontFamily: '"Syne", sans-serif',
                fontWeight: 700, fontSize: '1rem',
                color: '#f0f0f0', letterSpacing: '0.04em',
              }}>
                Croppeak_ng
              </span>
            </a>

            <p style={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '0.875rem', color: '#f0f0f0',
              lineHeight: 1.75, maxWidth: '260px',
              fontWeight: 300, marginBottom: '1.45rem',
            }}>
              Automated Precision Irrigation &amp; Nutrient Management System.
              Built for the modern farmer.
            </p>

            {/* Socials */}
            <div style={{ display: 'flex', gap: '1.65rem' }}>
              {socials.map(({ icon: Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  title={label}
                  style={{
                    color: '#444', textDecoration: 'none',
                    transition: 'color 0.2s, border-color 0.2s',
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLElement>) => {
                    (e.currentTarget as HTMLElement).style.color = '#46A908';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(70,169,8,0.3)';
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLElement>) => {
                    (e.currentTarget as HTMLElement).style.color = '#444';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
                  }}
                >
                  <Icon size={26} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 style={{
                fontSize: '0.72rem', fontWeight: 700,
                color: '#fff', textTransform: 'uppercase',
                letterSpacing: '0.14em', marginBottom: '1.25rem',
              }}>
                {category}
              </h4>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      style={{     
                        fontSize: '0.875rem', color: '#f0f0f0',
                        textDecoration: 'none', fontWeight: 400,
                        transition: 'color 0.2s',
                      }}
                      onMouseEnter={(e: React.MouseEvent<HTMLElement>) => { (e.currentTarget as HTMLElement).style.color = '#91D956'; }}
                      onMouseLeave={(e: React.MouseEvent<HTMLElement>) => { (e.currentTarget as HTMLElement).style.color = '#f0f0f0'; }}
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        {/* <div style={{
          borderTop: '1px solid rgba(255,255,255,0.04)',
          paddingTop: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <p style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '0.78rem', color: '#2a2a2a', margin: 0,
          }}>
            © {new Date().getFullYear()} APIMS. All rights reserved. Built with precision.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                backgroundColor: '#46A908',
                boxShadow: '0 0 8px #46A908',
              }} />
              <span style={{
                fontSize: '0.72rem', color: '#2a2a2a',
              }}>
                All systems operational
              </span>
            </div>

            <motion.button
              onClick={scrollTop}
              whileHover={{ scale: 1.08, borderColor: 'rgba(70,169,8,0.4)' }}
              whileTap={{ scale: 0.95 }}
              style={{
                width: 36, height: 36, borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.07)',
                backgroundColor: 'rgba(255,255,255,0.02)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#444',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLElement>) => { (e.currentTarget as HTMLElement).style.color = '#46A908'; }}
              onMouseLeave={(e: React.MouseEvent<HTMLElement>) => { (e.currentTarget as HTMLElement).style.color = '#444'; }}
              title="Back to top"
            >
              <RiArrowUpLine size={16} />
            </motion.button>
          </div>
        </div> */}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 560px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}