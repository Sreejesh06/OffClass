import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { NotchNavbar } from './ui/notch-navbar';
import {
  ArrowRight,
  MessagesSquare,
  BarChart,
  Terminal,
  Activity,
  User,
  Settings,
  Shield,
  Award,
  Calendar,
  Lock,
  Trophy,
  Flame,
  CheckCircle2,
  Gift,
} from 'lucide-react';
import { SwapyFeatures } from './SwapyFeatures';
import ScrollVelocity from './ui/ScrollVelocity';
import FoldText from './ui/FoldText';
import LogoLoop, { type LogoItem } from './ui/LogoLoop';
import { ContributorsSection } from './ContributorsSection';
import { Footer } from './Footer';
import { HeroLeaderboardMockup } from './ui/HeroLeaderboardMockup';
import { HousesShowcase } from './HousesShowcase';
import { SiGithub, SiLeetcode, SiTryhackme, SiHackthebox, SiCodeforces, SiLinux } from 'react-icons/si';

const platformLogos: LogoItem[] = [
  { node: <div className="flex items-center gap-4 text-foreground hover:text-crypto-purple dark:hover:text-white transition-colors cursor-pointer"><SiGithub className="text-5xl" /><span className="font-heading font-extrabold text-3xl tracking-tight">GitHub</span></div>, title: "GitHub" },
  { node: <div className="flex items-center gap-4 text-foreground hover:text-[#FFA116] transition-colors cursor-pointer"><SiLeetcode className="text-5xl" /><span className="font-heading font-extrabold text-3xl tracking-tight">LeetCode</span></div>, title: "LeetCode" },
  { node: <div className="flex items-center gap-4 text-foreground hover:text-[#ea2a4b] dark:hover:text-[#ff4b68] transition-colors cursor-pointer"><SiTryhackme className="text-5xl" /><span className="font-heading font-extrabold text-3xl tracking-tight">TryHackMe</span></div>, title: "TryHackMe" },
  { node: <div className="flex items-center gap-4 text-foreground hover:text-[#9fef00] transition-colors cursor-pointer"><SiHackthebox className="text-5xl" /><span className="font-heading font-extrabold text-3xl tracking-tight">HackTheBox</span></div>, title: "HackTheBox" },
  { node: <div className="flex items-center gap-4 text-foreground hover:text-[#1F8ACB] transition-colors cursor-pointer"><SiCodeforces className="text-5xl" /><span className="font-heading font-extrabold text-3xl tracking-tight">Codeforces</span></div>, title: "Codeforces" },
  { node: <div className="flex items-center gap-4 text-foreground hover:text-[#FCC624] transition-colors cursor-pointer"><SiLinux className="text-5xl" /><span className="font-heading font-extrabold text-3xl tracking-tight">Linux</span></div>, title: "Linux" },
];

export const ModernLanding: React.FC = () => {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-crypto-bg font-sans text-foreground">
      <NotchNavbar />
      
      <main className="flex-1 mt-16 overflow-y-auto w-full relative">

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6 max-w-7xl mx-auto relative flex flex-col items-center text-center">
        
        {/* Eyebrow */}
        <span className="inline-block mb-6 px-6 py-2 bg-crypto-yellow text-foreground font-mono text-xl md:text-2xl font-bold rounded-full border-2 md:border-4 border-black/80 dark:border-white/20 shadow-[4px_4px_0_0_rgba(0,0,0,0.85)] dark:shadow-matte-sm transform -rotate-2 z-10">
          #Cybersecurity
        </span>

        {/* Unified Headline */}
        <h1 className="text-5xl md:text-7xl font-heading font-extrabold text-foreground tracking-tight max-w-5xl leading-[1.1] z-10 relative flex flex-col items-center gap-2">
          <FoldText 
            text="Empower Your Journey in" 
            splitBy="word"
            fontSize="clamp(3rem, 6vw, 5rem)"
            fontWeight={800}
            color="currentColor"
          />
          <FoldText 
            text="Training & Management" 
            splitBy="word"
            fontSize="clamp(3rem, 6vw, 5rem)"
            fontWeight={800}
            color="currentColor"
          />
        </h1>
        
        {/* Sub-headline */}
        <p className="mt-8 text-xl font-sans text-muted-foreground font-medium max-w-3xl mx-auto z-10 leading-relaxed">
          Manage your CTF progress, certifications, and house points all from one place like a pro. Offclass covers all your academic and cybersecurity needs.
        </p>

        {/* CTAs */}
        <div className="mt-12 flex flex-col sm:flex-row gap-6 z-10">
          <Link to="/login" className="px-10 py-5 bg-[#14161c] hover:bg-[#1f222b] text-white border border-white/10 dark:border-white/15 rounded-full text-lg font-bold transition-all shadow-[0_10px_25px_-5px_rgba(0,0,0,0.5)] hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.7)] hover:-translate-y-0.5">
            Join a House
          </Link>
          <Link to="/leaderboard" className="px-10 py-5 bg-card text-card-foreground border-2 border-border dark:border-white/10 rounded-full text-lg font-bold hover:border-foreground/50 hover:bg-muted/50 transition-all shadow-sm dark:shadow-matte-sm">
            View Leaderboard
          </Link>
        </div>

          {/* Dashboard Mockup Image with Framed Animations */}
          <div className="relative mt-24 w-full max-w-5xl z-10">
            
            {/* Floating Shapes / Avatars anchored to the Dashboard Mockup */}
            <motion.div 
              animate={{ y: [0, -15, 0], x: [0, 10, 0], rotate: [-2, 4, -2] }} 
              transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
              className="hidden lg:block absolute -top-16 -left-20 z-20 pointer-events-none"
            >
              <img src="/assets/animation_1.png" alt="Decoration 1" className="w-40 h-40 object-contain drop-shadow-2xl" />
            </motion.div>
            
            <motion.div 
              animate={{ y: [0, 20, 0], x: [0, -10, 0], rotate: [5, 0, 5] }} 
              transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
              className="hidden lg:block absolute -top-12 -right-16 z-20 pointer-events-none"
            >
              <img src="/assets/animation_2.png" alt="Decoration 2" className="w-44 h-44 object-contain drop-shadow-2xl" />
            </motion.div>

            <motion.div 
              animate={{ y: [0, -10, 0], x: [0, -15, 0], rotate: [-8, -2, -8] }} 
              transition={{ repeat: Infinity, duration: 9, ease: "easeInOut" }}
              className="hidden lg:block absolute -bottom-16 -left-12 z-20 pointer-events-none"
            >
              <img src="/assets/animation_3.png" alt="Decoration 3" className="w-36 h-36 object-contain drop-shadow-2xl" />
            </motion.div>

            <motion.div 
              animate={{ y: [0, 15, 0], x: [0, 15, 0], rotate: [0, 5, 0] }} 
              transition={{ repeat: Infinity, duration: 11, ease: "easeInOut" }}
              className="hidden lg:block absolute -bottom-20 -right-24 z-20 pointer-events-none"
            >
              <img src="/assets/animation_0.png" alt="Decoration 4" className="w-56 h-56 object-contain drop-shadow-2xl" />
            </motion.div>

            {/* Live Interactive House Leaderboard & Standings Preview */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <HeroLeaderboardMockup />
            </motion.div>
          </div>
        </section>

        {/* 4 Cybersecurity Houses Showcase */}
        <HousesShowcase />

      {/* Feature Section (Split) */}
      <section className="py-24 bg-card text-card-foreground px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1">
            <div className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-950/40 text-crypto-purple rounded-full text-sm font-mono font-bold mb-6 border border-purple-500/20">
              #Integration
            </div>
            <h2 className="text-4xl md:text-5xl font-heading font-extrabold text-foreground mb-6 leading-tight">
              Track your real-world achievements automatically
            </h2>
            <p className="text-muted-foreground font-medium mb-8 text-lg">
              Best data organization. Connect your GitHub, HackTheBox, and Codeforces profiles and get everything synced in one place. No manual entry needed.
            </p>
            <Link to="/profile" className="inline-flex items-center px-6 py-3 border-2 border-border dark:border-white/15 rounded-full font-bold hover:bg-muted/50 transition-colors">
              How Sync Works <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
          
          <div className="flex-1 w-full">
            <div className="bg-crypto-purple rounded-3xl p-8 transform rotate-2 shadow-xl border-2 border-border/60 dark:border-white/15">
              <div className="bg-card text-card-foreground rounded-2xl p-6 shadow-sm border border-border/40 transform -rotate-2">
                <div className="flex items-center justify-between mb-6">
                  <div className="font-bold text-lg">Linked Accounts</div>
                  <div className="w-8 h-8 bg-[#181a22] border border-white/10 rounded-full text-white flex items-center justify-center font-mono font-bold text-xs">2</div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center p-3 border border-border rounded-xl hover:border-crypto-purple transition-colors bg-card text-card-foreground cursor-pointer shadow-sm group">
                    <div className="w-10 h-10 bg-[#181a22] border border-white/10 rounded-lg mr-4 flex items-center justify-center text-white">
                      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-foreground text-sm group-hover:text-crypto-purple transition-colors">alex-cyber</div>
                      <div className="text-xs text-muted-foreground font-medium mt-1">Synced • 15 Repositories</div>
                    </div>
                  </div>
                  <div className="flex items-center p-3 border border-border rounded-xl hover:border-crypto-purple transition-colors bg-card text-card-foreground cursor-pointer shadow-sm group">
                    <div className="w-10 h-10 bg-[#9fef00] rounded-lg mr-4 flex items-center justify-center text-zinc-950">
                      <Terminal className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-foreground text-sm group-hover:text-crypto-purple transition-colors">alex_htb</div>
                      <div className="text-xs text-muted-foreground font-medium mt-1">Synced • Rank: Hacker</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos Row - Animated Integration Loop */}
      <section className="py-12 border-t border-b border-border/80 dark:border-white/10 bg-card text-card-foreground overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <p className="text-sm font-bold font-mono text-muted-foreground mb-8 uppercase tracking-widest text-center">Seamless Integration With</p>
          <LogoLoop
            logos={platformLogos}
            speed={80}
            direction="left"
            logoHeight={60}
            gap={80}
            hoverSpeed={10}
            scaleOnHover={true}
            fadeOut={true}
            fadeOutColor="var(--card)"
            ariaLabel="Supported integrations"
          />
        </div>
      </section>

      {/* Scroll Velocity Banner */}
      <div className="border-t-2 border-b-2 border-black/80 dark:border-yellow-600/40 bg-crypto-yellow py-8 overflow-hidden transform -rotate-1 scale-105 my-12 z-20 relative">
        <ScrollVelocity 
          texts={['CAPTURE THE FLAG • HACK THE PLANET • SECURE THE NETWORK •', 'RED TEAM • BLUE TEAM • GREEN TEAM • PURPLE TEAM •']} 
          velocity={50} 
          className="text-black uppercase tracking-tighter mx-4 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]"
        />
      </div>

      {/* Swapy Draggable Features Grid */}
      <SwapyFeatures />

      {/* GitHub Core Contributors Showcase */}
      <ContributorsSection />

      {/* Modern Island Footer & CTA (Graphy Style) */}
      <Footer />
      </main>
    </div>
  );
};
