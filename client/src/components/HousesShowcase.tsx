import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ShieldAlert,
  ShieldCheck,
  Cpu,
  BrainCircuit,
  Crosshair,
  Radar,
  Bug,
  Search,
  KeyRound,
  FileCode2,
  TerminalSquare,
  Network,
  Binary,
  Flame,
  Activity,
  Layers,
  Database,
  Lock,
  Workflow,
  Sparkles,
  Users2,
  TrendingUp,
  Compass,
  Briefcase,
  Award,
  ChevronRight
} from 'lucide-react';

interface HouseData {
  id: 'red' | 'blue' | 'green' | 'purple';
  name: string;
  subtitle: string;
  mascot: string;
  motto: string;
  philosophy: string;
  banner: string;
  colorClass: {
    accent: string;
    border: string;
    bgBadge: string;
    textBadge: string;
    glow: string;
    gradient: string;
  };
  skillsets: string[];
}

const HOUSES_DATA: HouseData[] = [
  {
    id: 'red',
    name: 'Red House',
    subtitle: 'The Offensive Force',
    mascot: 'Lion',
    motto: 'Find. Break. Improve.',
    philosophy: 'We think like adversaries to make systems stronger.',
    banner: 'Offense today. A safer tomorrow.',
    colorClass: {
      accent: '#ef4444',
      border: 'border-red-500/30 dark:border-red-500/40 hover:border-red-500',
      bgBadge: 'bg-red-500/10 dark:bg-red-500/20',
      textBadge: 'text-red-600 dark:text-red-400',
      glow: 'rgba(239, 68, 68, 0.15)',
      gradient: 'from-red-500/10 via-transparent to-transparent'
    },
    skillsets: [
      'Cyber Fundamentals',
      'Network Reconnaissance',
      'Web & API Security',
      'Vulnerability Assessment',
      'Penetration Testing',
      'Exploit Development',
      'Red Team Operations',
      'Active Directory Security',
      'CTF & Competitive Hacking',
      'Security Research'
    ]
  },
  {
    id: 'blue',
    name: 'Blue House',
    subtitle: 'The Defensive Shield',
    mascot: 'Wolf',
    motto: 'Detect. Defend. Stay Ahead.',
    philosophy: 'We build resilient systems and defend what matters.',
    banner: 'Strong systems. Safer tomorrows.',
    colorClass: {
      accent: '#3b82f6',
      border: 'border-blue-500/30 dark:border-blue-500/40 hover:border-blue-500',
      bgBadge: 'bg-blue-500/10 dark:bg-blue-500/20',
      textBadge: 'text-blue-600 dark:text-blue-400',
      glow: 'rgba(59, 130, 246, 0.15)',
      gradient: 'from-blue-500/10 via-transparent to-transparent'
    },
    skillsets: [
      'SOC Fundamentals',
      'SIEM & Log Analysis',
      'Threat Hunting',
      'Incident Response',
      'Digital Forensics',
      'EDR / XDR',
      'Network Defence',
      'Malware Analysis',
      'Cloud Security Monitoring',
      'Security Operations',
      'Risk & Resilience'
    ]
  },
  {
    id: 'green',
    name: 'Green House',
    subtitle: 'The Innovation Engine',
    mascot: 'Phoenix',
    motto: 'Build. Research. Create.',
    philosophy: 'We turn ideas into solutions for real-world impact.',
    banner: 'Ideas today. Impact tomorrow.',
    colorClass: {
      accent: '#10b981',
      border: 'border-emerald-500/30 dark:border-emerald-500/40 hover:border-emerald-500',
      bgBadge: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      textBadge: 'text-emerald-600 dark:text-emerald-400',
      glow: 'rgba(16, 185, 129, 0.15)',
      gradient: 'from-emerald-500/10 via-transparent to-transparent'
    },
    skillsets: [
      'Secure Coding & DevSecOps',
      'Application Security',
      'Cloud & Container Security',
      'AI Security',
      'IoT / Embedded Security',
      'Cryptography',
      'Research & Development',
      'Emerging Technologies',
      'Prototyping & Product Build',
      'Open Source Contribution',
      'Innovation & Entrepreneurship'
    ]
  },
  {
    id: 'purple',
    name: 'Purple House',
    subtitle: 'The Strategic Mind',
    mascot: 'Panther',
    motto: 'Analyse. Solve. Lead.',
    philosophy: 'We connect people, processes and possibilities.',
    banner: 'Think beyond. Secure for all.',
    colorClass: {
      accent: '#a855f7',
      border: 'border-purple-500/30 dark:border-purple-500/40 hover:border-purple-500',
      bgBadge: 'bg-purple-500/10 dark:bg-purple-500/20',
      textBadge: 'text-purple-600 dark:text-purple-400',
      glow: 'rgba(168, 85, 247, 0.15)',
      gradient: 'from-purple-500/10 via-transparent to-transparent'
    },
    skillsets: [
      'Cyber Intelligence (OSINT)',
      'Threat Intelligence',
      'GRC & Policy',
      'Risk Analysis',
      'Privacy & Compliance',
      'Cyber Law & Ethics',
      'Business Continuity',
      'Leadership & Communication',
      'Project Management',
      'Industry Collaboration',
      'Strategy & Transformation'
    ]
  }
];

const PILLARS = [
  { title: 'Skills for Life', desc: 'Practical hands-on technical competence' },
  { title: 'Competitions for Growth', desc: 'Tested in CTFs and adversary simulations' },
  { title: 'Ideas for Impact', desc: 'Applied research and tool development' },
  { title: 'Collaboration for Change', desc: 'Cross-functional house teamwork' },
  { title: 'Leadership for Tomorrow', desc: 'Strategic cybersecurity operators' },
];

export const HousesShowcase: React.FC = () => {
  const [activeHouse, setActiveHouse] = useState<'red' | 'blue' | 'green' | 'purple'>('red');

  const selected = HOUSES_DATA.find(h => h.id === activeHouse) || HOUSES_DATA[0];

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto w-full relative" id="houses">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card border border-border shadow-sm text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground mb-4">
          Learn • Explore • Practice • Collaborate • Lead
        </div>
        <h2 className="text-4xl md:text-5xl font-heading font-extrabold tracking-tight text-foreground mb-4">
          Cybersecurity Houses
        </h2>
        <p className="text-lg text-muted-foreground font-medium">
          Different skills. One community. A stronger tomorrow.
        </p>
      </div>

      {/* House Selector Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {HOUSES_DATA.map((house) => {
          const isActive = house.id === activeHouse;
          return (
            <button
              key={house.id}
              onClick={() => setActiveHouse(house.id)}
              className={`p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isActive
                  ? `bg-card shadow-lg ${house.colorClass.border} scale-[1.02]`
                  : 'bg-card/60 hover:bg-card border-border hover:border-foreground/20 opacity-80 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-md ${house.colorClass.bgBadge} ${house.colorClass.textBadge}`}>
                  {house.mascot}
                </span>
                <span className="text-xs font-mono font-bold text-muted-foreground">
                  Track
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold font-heading text-foreground mb-1">
                  {house.name}
                </h3>
                <p className="text-xs text-muted-foreground font-medium">
                  {house.subtitle}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border/50 text-xs font-mono italic text-muted-foreground">
                "{house.motto}"
              </div>
            </button>
          );
        })}
      </div>

      {/* Active House Detailed Showcase Card */}
      <motion.div
        key={selected.id}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`bg-card rounded-3xl p-8 md:p-12 border-2 ${selected.colorClass.border} shadow-xl relative overflow-hidden`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: House Identity & Philosophy */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${selected.colorClass.bgBadge} ${selected.colorClass.textBadge}`}>
                  Mascot: {selected.mascot}
                </span>
                <span className="text-xs font-mono text-muted-foreground">
                  Official Specialization
                </span>
              </div>

              <h3 className="text-3xl md:text-4xl font-extrabold font-heading text-foreground mb-2">
                {selected.name}
              </h3>
              <p className="text-lg font-medium text-muted-foreground mb-6">
                {selected.subtitle}
              </p>

              <blockquote className="border-l-4 pl-4 py-1 mb-6 text-foreground font-semibold text-xl italic" style={{ borderColor: selected.colorClass.accent }}>
                "{selected.motto}"
              </blockquote>

              <p className="text-muted-foreground leading-relaxed text-base mb-6">
                {selected.philosophy}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-muted/40 border border-border">
              <span className="text-xs font-mono font-bold text-muted-foreground block mb-1 uppercase tracking-wider">
                House Banner
              </span>
              <p className="text-base font-bold text-foreground">
                {selected.banner}
              </p>
            </div>
          </div>

          {/* Right Column: 10-Point Key Skillsets */}
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-border">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Specialization Curricula & Skillsets ({selected.skillsets.length} Tracks)
              </span>
              <span className="text-xs font-mono font-semibold" style={{ color: selected.colorClass.accent }}>
                Verified On-Chain
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selected.skillsets.map((skill, index) => (
                <div
                  key={skill}
                  className="p-3.5 rounded-xl bg-muted/30 hover:bg-muted/70 border border-border/80 transition-colors flex items-center gap-3 group"
                >
                  <span className="w-6 h-6 rounded-md bg-card border border-border flex items-center justify-center font-mono text-xs font-bold text-muted-foreground group-hover:text-foreground">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="font-medium text-sm text-foreground">
                    {skill}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </motion.div>

      {/* 5 Department Core Pillars Footer */}
      <div className="mt-16 bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-border">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              Department Foundation
            </span>
            <h4 className="text-xl font-bold font-heading text-foreground">
              Different Paths. Stronger Together.
            </h4>
          </div>
          <span className="text-xs font-mono text-muted-foreground bg-muted px-3 py-1.5 rounded-full border border-border">
            Same Minds. A Safer Digital Tomorrow.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {PILLARS.map((pillar) => (
            <div key={pillar.title} className="p-4 rounded-xl bg-muted/20 border border-border/60">
              <h5 className="font-bold text-sm text-foreground mb-1">
                {pillar.title}
              </h5>
              <p className="text-xs text-muted-foreground font-medium">
                {pillar.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
