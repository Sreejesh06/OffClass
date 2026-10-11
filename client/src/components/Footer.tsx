import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Shield, ArrowRight, ExternalLink, Sparkles, Terminal } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <div className="w-full relative overflow-hidden bg-crypto-bg pt-12">
      {/* ─────────────────────────────────────────────────────────────
          TOP BANNER: Dark Gradient CTA Card (Matching Reference Image)
         ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden border-2 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] bg-black text-white px-6 py-20 md:py-28 text-center"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(168, 85, 247, 0.25) 0%, rgba(6, 182, 212, 0.12) 40%, rgba(0, 0, 0, 0.98) 75%)',
          }}
        >
          {/* Subtle Cyber Grid Accent */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            {/* Pill Tag */}
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-mono font-bold tracking-wide uppercase text-crypto-yellow mb-6">
              <Sparkles className="w-3.5 h-3.5" /> Department of Cybersecurity
            </span>

            {/* Headline */}
            <h2 className="text-4xl md:text-6xl font-heading font-black tracking-tight text-white mb-6 leading-[1.1]">
              Ready to prove your skills?
            </h2>

            {/* Sub-headline */}
            <p className="text-lg md:text-xl text-gray-300 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
              Join hundreds of cybersecurity students tracking real-world achievements, conquering CTFs, and leading their houses to victory.
            </p>

            {/* Pill Button (Matching Reference Image Style) */}
            <Link
              to="/login"
              className="px-9 py-4 bg-white text-black font-heading font-extrabold text-base rounded-full hover:bg-gray-100 transition-all shadow-[0_0_25px_rgba(255,255,255,0.25)] hover:shadow-[0_0_35px_rgba(255,255,255,0.4)] hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 cursor-pointer"
            >
              Join a House
              <ArrowRight className="w-4 h-4 text-black" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          BOTTOM FOOTER: Floating Island Card (Matching Reference Image)
         ───────────────────────────────────────────────────────────── */}
      <footer className="max-w-7xl mx-auto px-6 pb-8 relative z-10">
        <div className="rounded-3xl border-2 border-black bg-card text-card-foreground shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-8 md:p-14 relative backdrop-blur-xl">
          {/* Main Grid: Brand Left + 3 Structured Columns Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-12 border-b border-border">
            
            {/* Column Left: Brand Identity & Social Icons (Span 5) */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                <Link to="/" className="inline-flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-heading font-black text-xl border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] group-hover:scale-105 transition-transform">
                    <Shield className="w-5 h-5 text-crypto-yellow" />
                  </div>
                  <div>
                    <span className="font-heading font-extrabold text-2xl tracking-tight text-foreground">
                      OffClass
                    </span>
                    <span className="ml-2 text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-crypto-yellow/20 text-black border border-crypto-yellow/40">
                      CRYPTID
                    </span>
                  </div>
                </Link>

                <p className="mt-4 text-sm text-muted-foreground font-medium leading-relaxed max-w-sm">
                  The department-wide cybersecurity proving ground. Track GitHub & HackTheBox progress, earn house points, redeem real academic perks, and verify credentials on-chain.
                </p>
              </div>

              {/* Social / Platform Links Row (Matching Reference) */}
              <div className="mt-8 flex items-center gap-3">
                {/* GitHub */}
                <a
                  href="https://github.com/Sreejesh06/OffClass"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub Repository"
                  className="w-10 h-10 rounded-xl border-2 border-border hover:border-black bg-muted/60 hover:bg-black hover:text-white transition-all flex items-center justify-center text-foreground"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                </a>

                {/* X / Twitter */}
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X Twitter"
                  className="w-10 h-10 rounded-xl border-2 border-border hover:border-black bg-muted/60 hover:bg-black hover:text-white transition-all flex items-center justify-center text-foreground"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>

                {/* LinkedIn */}
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="w-10 h-10 rounded-xl border-2 border-border hover:border-black bg-muted/60 hover:bg-black hover:text-white transition-all flex items-center justify-center text-foreground"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                  </svg>
                </a>

                {/* College Portal */}
                <a
                  href="https://sece.ac.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="SECE College Portal"
                  className="w-10 h-10 rounded-xl border-2 border-border hover:border-black bg-muted/60 hover:bg-black hover:text-white transition-all flex items-center justify-center text-foreground"
                  title="Sri Eshwar College of Engineering"
                >
                  <Terminal className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Column Right: Genuine Feature Links (Span 7) */}
            <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
              
              {/* Group 1: Platform */}
              <div>
                <h4 className="font-heading font-extrabold text-foreground text-sm uppercase tracking-wider mb-4">
                  Platform
                </h4>
                <ul className="space-y-3 text-sm font-medium">
                  <li>
                    <Link to="/leaderboard" className="text-muted-foreground hover:text-foreground hover:underline transition-colors">
                      Leaderboard
                    </Link>
                  </li>
                  <li>
                    <Link to="/leaderboard" className="text-muted-foreground hover:text-foreground hover:underline transition-colors">
                      House Standings
                    </Link>
                  </li>
                  <li>
                    <Link to="/opportunities" className="text-muted-foreground hover:text-foreground hover:underline transition-colors">
                      Opportunities Board
                    </Link>
                  </li>
                  <li>
                    <Link to="/hall-of-fame" className="text-muted-foreground hover:text-foreground hover:underline transition-colors">
                      Hall of Fame
                    </Link>
                  </li>
                  <li>
                    <Link to="/redeem" className="text-muted-foreground hover:text-foreground hover:underline transition-colors">
                      Perks & Rewards
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Group 2: Student Portals */}
              <div>
                <h4 className="font-heading font-extrabold text-foreground text-sm uppercase tracking-wider mb-4">
                  Student Portals
                </h4>
                <ul className="space-y-3 text-sm font-medium">
                  <li>
                    <Link to="/profile" className="text-muted-foreground hover:text-foreground hover:underline transition-colors">
                      Proof Portfolio
                    </Link>
                  </li>
                  <li>
                    <Link to="/profile" className="text-muted-foreground hover:text-foreground hover:underline transition-colors">
                      Sync GitHub & HTB
                    </Link>
                  </li>
                  <li>
                    <Link to="/complaints" className="text-muted-foreground hover:text-foreground hover:underline transition-colors flex items-center gap-1">
                      Anonymous Grievance
                    </Link>
                  </li>
                  <li>
                    <Link to="/verify" className="text-muted-foreground hover:text-foreground hover:underline transition-colors">
                      On-Chain Verification
                    </Link>
                  </li>
                  <li>
                    <Link to="/login" className="text-muted-foreground hover:text-foreground hover:underline transition-colors">
                      Student Login
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Group 3: Department & Open Source */}
              <div>
                <h4 className="font-heading font-extrabold text-foreground text-sm uppercase tracking-wider mb-4">
                  Department
                </h4>
                <ul className="space-y-3 text-sm font-medium">
                  <li>
                    <a href="#contributors" className="text-muted-foreground hover:text-foreground hover:underline transition-colors">
                      Core Contributors
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://github.com/Sreejesh06/OffClass"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground hover:underline transition-colors flex items-center gap-1"
                    >
                      Repository <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://github.com/Sreejesh06/OffClass/issues"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground hover:underline transition-colors"
                    >
                      Report an Issue
                    </a>
                  </li>
                  <li>
                    <Link to="/admin" className="text-muted-foreground hover:text-foreground hover:underline transition-colors">
                      Faculty / Admin HQ
                    </Link>
                  </li>
                  <li>
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      SECE Amoy Node
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Copyright & Legal */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-muted-foreground">
            <div>
              © 2026 OffClass (Cryptid) • Department of Cybersecurity, Sri Eshwar College of Engineering.
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <Link to="/complaints" className="hover:text-foreground hover:underline transition-colors">
                Zero-Trace Grievance Policy
              </Link>
              <span className="hover:text-foreground cursor-pointer">
                Terms of Service
              </span>
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                All Systems Operational
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* ─────────────────────────────────────────────────────────────
          EMBOSSED BACKGROUND WATERMARK (Matching Reference Image Detail)
         ───────────────────────────────────────────────────────────── */}
      <div
        className="w-full text-center font-heading font-black text-[13vw] leading-none tracking-tighter text-black/[0.035] dark:text-white/[0.035] select-none pointer-events-none -mt-16 md:-mt-24 pb-4 overflow-hidden"
        aria-hidden="true"
      >
        CRYPTID
      </div>
    </div>
  );
};
