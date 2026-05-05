'use client';

import HeroSection from '@/components/HeroSection';
import AboutSection from '@/components/AboutSection';
import ProcessSection from '@/components/ProcessSection';
import DownloadSection from '@/components/DownloadSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';

export default function Home() {
  return (
    <main style={{ backgroundColor: '#0a0a0a', color: '#f0f0f0', overflowX: 'hidden', fontFamily: "var(--font-nunito)" }}>
      <Navbar />
      <HeroSection />
      <AboutSection />
      <ProcessSection />
      <DownloadSection />
      <ContactSection />
      <Footer />
    </main>
  );
}