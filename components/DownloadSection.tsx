'use client';

import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Modal,
  TextInput,
  Checkbox,
  Button,
  Group,
  Text,
  Stack,
  Divider,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  RiAndroidLine,
  RiAppleLine,
  RiDownload2Line,
  RiShieldCheckLine,
  RiCheckLine,
  RiArrowRightLine,
} from 'react-icons/ri';

type Platform = 'android' | 'ios';

const platforms = [
  {
    id: 'android' as Platform,
    icon: RiAndroidLine,
    label: 'Android',
    version: 'v1.0.0',
    size: '24.8 MB',
    requirements: 'Android 8.0+',
    filename: 'apims-v1.0.0.apk',
    downloadUrl: '/downloads/apims-v1.0.0.apk',
    badge: 'APK',
  },
  {
    id: 'ios' as Platform,
    icon: RiAppleLine,
    label: 'iOS',
    version: 'v1.0.0',
    size: '31.2 MB',
    requirements: 'iOS 14.0+',
    filename: 'apims-v1.0.0.ipa',
    downloadUrl: '/downloads/apims-v1.0.0.ipa',
    badge: 'IPA',
  },
];

const highlights = [
  'Full offline sensor cache',
  'Biometric authentication',
  'Real-time push alerts',
  'Dark-only interface',
];

export default function DownloadSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm({
    initialValues: { email: '', agree: false },
    validate: {
      email: (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : 'Enter a valid email address'),
      agree: (v) => (v ? null : 'You must agree to the terms to download'),
    },
  });

  const openModal = (platform: Platform) => {
    setSelectedPlatform(platform);
    setSubmitted(false);
    form.reset();
    setModalOpen(true);
  };

  const handleDownload = async (values: { email: string; agree: boolean }) => {
    setLoading(true);
    // Simulate API call — replace with your actual email capture endpoint
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);

    const plat = platforms.find((p) => p.id === selectedPlatform);
    if (plat) {
      // Trigger download
      const link = document.createElement('a');
      link.href = plat.downloadUrl;
      link.download = plat.filename;
      link.click();
    }

    notifications.show({
      title: 'Download started!',
      message: `Check your browser downloads for ${plat?.filename}`,
      color: 'green',
    });

    setTimeout(() => setModalOpen(false), 2000);
  };

  return (
    <section
      id="download"
      ref={ref}
      style={{
        backgroundColor: '#0a0a0a',
        padding: '4rem 1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top border accent */}
      <div style={{
        position: 'absolute', top: 0, left: '10%', right: '10%',
        height: '1px',
        backgroundColor: 'rgba(70,169,8,0.15)',
      }} />

      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: '30%', right: '-150px',
        width: '600px', height: '600px', borderRadius: '50%',
        backgroundColor: 'rgba(145,217,86,0.04)',
        filter: 'blur(120px)', pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: 'center', marginBottom: '4.5rem' }}
        >
          <span style={{
            fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase',
            color: '#46A908', display: 'block', marginBottom: '1rem',
          }}>
            Mobile Apps
          </span>
          <div style={{
            fontSize: 'clamp(2rem, 4.5vw, 3.0rem)',
            fontWeight: 600, color: '#ffffff',
            letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '1.2rem',
          }}>
            Take Croppeak_ng to the Field
          </div>
          <p style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '1rem', color: 'rgba(240,240,240,0.45)',
            maxWidth: '560px', margin: '0 auto', lineHeight: 1.75, fontWeight: 300,
          }}>
            Monitor your farm, trigger irrigation, and review analytics
            directly from your pocket. Available for Android and iOS.
          </p>
        </motion.div>

        {/* Download cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3.5rem',
        }}>
          {platforms.map((plat, i) => {
            const Icon = plat.icon;
            return (
              <motion.div
                key={plat.id}
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ }}
                style={{
                  backgroundColor: '#111',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '20px',
                  padding: '2rem',
                  cursor: 'default',
                  transition: 'border-color 0.25s',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLElement>) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(70,169,8,0.3)'; }}
                onMouseLeave={(e: React.MouseEvent<HTMLElement>) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; }}
              >
                {/* Corner badge */}
                <div style={{
                  position: 'absolute', top: '1.25rem', right: '1.25rem',
                  padding: '2px 10px',
                  fontSize: '0.7rem', fontWeight: 700,
                  color: '#91D956', letterSpacing: '0.1em',
                }}>
                  {plat.badge}
                </div>

                {/* Icon */}

                  <Icon size={26} color="#46A908" />


                <h3 style={{
                  fontSize: '1.3rem', fontWeight: 700,
                  color: '#f0f0f0', marginBottom: '0.4rem',
                }}>
                  {plat.label}
                </h3>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                  {[plat.version, plat.size, plat.requirements].map((item) => (
                    <span key={item} style={{
                      fontSize: '0.75rem', color: '#4a4a4a', fontWeight: 400,
                    }}>
                      {item}
                    </span>
                  ))}
                </div>

                {/* Feature list */}
                <div style={{ marginBottom: '2rem' }}>
                  {highlights.map((h) => (
                    <div key={h} style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      marginBottom: '6px',
                    }}>
                      <RiCheckLine size={13} color="#46A908" />
                      <span style={{
                        fontSize: '0.82rem', color: 'rgba(240,240,240,0.5)',
                      }}>
                        {h}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Download button */}
                <motion.button
                  whileHover={{  }}
                  whileTap={{  }}
                  onClick={() => openModal(plat.id)}
                  style={{
                    width: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '8px',
                    backgroundColor: '#46A908',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '0.85rem 1.5rem',
                    fontSize: '0.95rem', fontWeight: 600,
                    cursor: 'pointer',
                    letterSpacing: '0.02em',
                  }}
                >
                  <RiDownload2Line size={17} />
                  Download for {plat.label}
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Download Modal */}
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={null}
        centered
        size="md"
        styles={{
          root: {},
          content: {
            backgroundColor: '#111',
            border: '1px solid rgba(70,169,8,0.2)',
            borderRadius: '20px',
            padding: 0,
            overflow: 'hidden',
          },
          body: { padding: 0 },
          header: { display: 'none' },
          overlay: { backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' },
        }}
      >
        {submitted ? (
          /* ── Success state ── */
          <div style={{
            padding: '3rem 2.5rem',
            textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
          }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              style={{
                width: 64, height: 64, borderRadius: '50%',
                backgroundColor: 'rgba(70,169,8,0.12)',
                border: '2px solid #46A908',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1.5rem',
              }}
            >
              <RiCheckLine size={28} color="#46A908" />
            </motion.div>
            <h3 style={{
              fontFamily: "var(--font-nunito)",
              fontSize: '1.4rem', fontWeight: 700,
              color: '#f0f0f0', marginBottom: '0.5rem',
            }}>
              Download Starting
            </h3>
            <p style={{
              fontFamily: "var(--font-nunito)",
              fontSize: '0.9rem', color: '#555', lineHeight: 1.6,
            }}>
              Your file is downloading. Check your browser's download bar.
            </p>
          </div>
        ) : (
          /* ── Form state ── */
          <div>
            {/* Modal header */}
            <div style={{
              padding: '2rem 2.5rem 1.5rem',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', gap: '1rem',
            }}>
              {selectedPlatform && (() => {
                const plat = platforms.find((p) => p.id === selectedPlatform)!;
                const PlatIcon = plat.icon;
                return (
                  <>
                    <div>
                      <h3 style={{
                        fontFamily: "var(--font-nunito)",
                        fontSize: '1.15rem', fontWeight: 700,
                        color: '#f0f0f0', margin: 0, lineHeight: 1.2,
                      }}>
                        Download APIMS for {plat.label}
                      </h3>
                      <p style={{
                        fontFamily: '"DM Sans", sans-serif',
                        fontSize: '0.8rem', color: '#555', margin: '4px 0 0',
                      }}>
                        {plat.version} · {plat.size}
                      </p>
                    </div>
                  </>
                );
              })()}
              {/* Close */}
              <button
                onClick={() => setModalOpen(false)}
                style={{
                  marginLeft: 'auto', background: 'none', border: 'none',
                  color: '#555', cursor: 'pointer', fontSize: '1.2rem',
                  lineHeight: 1, padding: '4px',
                }}
              >
                ✕
              </button>
            </div>

            {/* Form body */}
            <form
              onSubmit={form.onSubmit(handleDownload)}
              style={{ padding: '1.75rem 2.5rem 2rem' }}
            >
              <Stack gap="md">
                <Text
                  style={{
                    fontFamily: "var(--font-nunito)",
                    fontSize: '0.875rem', color: 'rgba(240,240,240,0.5)',
                    lineHeight: 1.65,
                  }}
                >
                  Enter your email to receive release notes and update notifications.
                  Your download will begin immediately after.
                </Text>

                <TextInput
                  label="Email Address"
                  placeholder="you@example.com"
                  required
                  {...form.getInputProps('email')}
                  styles={{
                    label: {
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: '0.82rem', fontWeight: 600,
                      color: '#888', marginBottom: '6px',
                      letterSpacing: '0.04em',
                    },
                    input: {
                      backgroundColor: '#1a1a1a',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '10px',
                      color: '#f0f0f0',
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: '0.9rem',

                      '&:focus': { borderColor: '#46A908', boxShadow: '0 0 0 2px rgba(70,169,8,0.15)' },
                      '&::placeholder': { color: '#3a3a3a' },
                    },
                    error: { color: '#ef4444', fontFamily: '"DM Sans", sans-serif', fontSize: '0.78rem' },
                  }}
                />

                <Divider color="rgba(255,255,255,0.06)" />

                <Checkbox
                  label={
                    <span style={{
                      fontFamily: "var(--font-nunito)",
                      fontSize: '0.82rem', color: 'rgba(240,240,240,0.55)',
                      lineHeight: 1.6,
                    }}>
                      I agree to the{' '}
                      <a
                        href="/terms"
                        target="_blank"
                        style={{ color: '#46A908', textDecoration: 'none' }}
                      >
                        Terms of Use
                      </a>{' '}
                      and{' '}
                      <a
                        href="/privacy"
                        target="_blank"
                        style={{ color: '#46A908', textDecoration: 'none' }}
                      >
                        Privacy Policy
                      </a>
                      . I understand this app is provided as-is for farm management use.
                    </span>
                  }
                  {...form.getInputProps('agree', { type: 'checkbox' })}
                  styles={{
                    input: {
                      backgroundColor: '#1a1a1a',
                      borderColor: 'rgba(255,255,255,0.12)',
                      cursor: 'pointer',
                      '&:checked': { backgroundColor: '#46A908', borderColor: '#46A908' },
                    },
                    error: { color: '#ef4444', fontFamily: "var(--font-nunito)" , fontSize: '0.78rem' },
                  }}
                />

                <Group justify="flex-end" gap="sm" mt="xs">
                  <Button
                    variant="subtle"
                    onClick={() => setModalOpen(false)}
                    styles={{
                      root: {
                        color: '#555', fontFamily: "var(--font-nunito)",
                        fontWeight: 500, fontSize: '0.875rem',
                        '&:hover': { backgroundColor: 'rgba(255,255,255,0.04)', color: '#888' },
                      },
                    }}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    loading={loading}
                    leftSection={loading ? null : <RiDownload2Line size={16} />}
                    rightSection={loading ? null : <RiArrowRightLine size={15} />}
                    styles={{
                      root: {
                        backgroundColor: '#46A908',
                        color: '#fff',
                        borderRadius: '10px',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        padding: '0.6rem 1.5rem',
                        border: 'none',
                        '&:hover': { backgroundColor: '#3a8f07' },
                        '&[data-loading]': { backgroundColor: '#2a6c05' },
                      },
                      loader: { color: '#fff' },
                    }}
                  >
                    {loading ? 'Preparing download…' : 'Download Now'}
                  </Button>
                </Group>
              </Stack>
            </form>
          </div>
        )}
      </Modal>
    </section>
  );
}