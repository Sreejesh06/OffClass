import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Shield, ArrowRight, ExternalLink, Terminal } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <div className="w-full relative overflow-hidden bg-crypto-bg pt-12">
      {/* ─────────────────────────────────────────────────────────────
          TOP BANNER: Deep Obsidian CTA Card (High Contrast in Both Themes)
         ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden border-2 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] text-white px-6 py-20 md:py-24 text-center"
          style={{
            background: 'linear-gradient(180deg, #131722 0%, #090b10 45%, #000000 100%)',
          }}
        >
          {/* Soft top-edge cyber glow (kept strictly at top edge so it never washes out text) */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-b from-cyan-500/10 via-purple-500/5 to-transparent blur-2xl pointer-events-none" />

          {/* Subtle Cyber Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
            {/* Pill Tag */}
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-mono font-bold tracking-wide uppercase text-crypto-yellow mb-6">
              Department of Cybersecurity
            </span>

            {/* Headline - Crisp, High-Contrast White */}
            <h2 className="text-4xl md:text-6xl font-heading font-black tracking-tight text-white mb-6 leading-[1.1] drop-shadow-md">
              Ready to prove your skills?
            </h2>

            {/* Sub-headline */}
            <p className="text-base md:text-lg text-zinc-300 font-medium max-w-xl mx-auto mb-10 leading-relaxed">
              Join hundreds of cybersecurity students tracking real-world achievements, conquering CTFs, and leading their houses to victory.
            </p>

            {/* Pill Button (Matching Graphy Style) */}
            <Link
              to="/login"
              className="px-9 py-4 bg-white text-black font-heading font-extrabold text-base rounded-full hover:bg-zinc-100 transition-all shadow-[0_4px_20px_rgba(255,255,255,0.2)] hover:shadow-[0_4px_30px_rgba(255,255,255,0.35)] hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 cursor-pointer"
            >
              Join a House
              <ArrowRight className="w-4 h-4 text-black" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          BOTTOM FOOTER: Minimal Floating Island Card (Graphy Layout)
         ───────────────────────────────────────────────────────────── */}
      <footer className="max-w-7xl mx-auto px-6 pb-8 relative z-10">
        <div className="rounded-3xl border-2 border-black bg-card text-card-foreground shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-8 md:p-12 relative backdrop-blur-xl">
          {/* Main Grid: Brand Left (Span 5) + 3 Minimal Columns Right (Span 7) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-10 border-b border-border">
            
            {/* Column Left: Brand Identity & Verified Social Icons */}
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
                  The college cybersecurity proving ground. Built by students to track real-world skills, CTFs, and house competitions.
                </p>
              </div>

              {/* Verified Social Icons Row */}
              <div className="mt-6 flex items-center gap-2.5">
                {/* LinkedIn - Official Department Page */}
                <a
                  href="https://www.linkedin.com/company/department-of-cse-cybersecurity/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Department of CSE (Cybersecurity) LinkedIn"
                  title="Department of CSE (Cybersecurity) LinkedIn"
                  className="w-9 h-9 rounded-xl border border-border hover:border-black bg-muted/60 hover:bg-[#0077b5] hover:text-white transition-all flex items-center justify-center text-foreground"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                  </svg>
                </a>

                {/* Instagram - Official @sece_cys */}
                <a
                  href="https://www.instagram.com/sece_cys/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Department Instagram @sece_cys"
                  title="Department Instagram @sece_cys"
                  className="w-9 h-9 rounded-xl border border-border hover:border-black bg-muted/60 hover:bg-[#E1306C] hover:text-white transition-all flex items-center justify-center text-foreground"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>

                {/* GitHub Repository */}
                <a
                  href="https://github.com/Sreejesh06/OffClass"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub Repository"
                  title="OffClass GitHub Repository"
                  className="w-9 h-9 rounded-xl border border-border hover:border-black bg-muted/60 hover:bg-black hover:text-white transition-all flex items-center justify-center text-foreground"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                </a>

                {/* College Portal */}
                <a
                  href="https://sece.ac.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="SECE College Portal"
                  className="w-9 h-9 rounded-xl border border-border hover:border-black bg-muted/60 hover:bg-black hover:text-white transition-all flex items-center justify-center text-foreground"
                  title="Sri Eshwar College of Engineering"
                >
                  <Terminal className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Column Right: 3 Minimal, Curated Link Columns (Span 7) */}
            <div className="lg:col-span-7 grid grid-cols-3 gap-6">
              
              {/* Column 1: Platform */}
              <div>
                <h4 className="font-heading font-extrabold text-foreground text-xs uppercase tracking-wider mb-4">
                  Platform
                </h4>
                <ul className="space-y-2.5 text-xs font-medium">
                  <li>
                    <Link to="/leaderboard" className="text-muted-foreground hover:text-foreground hover:underline transition-colors">
                      Leaderboard
                    </Link>
                  </li>
                  <li>
                    <Link to="/opportunities" className="text-muted-foreground hover:text-foreground hover:underline transition-colors">
                      Opportunities
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

              {/* Column 2: Student */}
              <div>
                <h4 className="font-heading font-extrabold text-foreground text-xs uppercase tracking-wider mb-4">
                  Student
                </h4>
                <ul className="space-y-2.5 text-xs font-medium">
                  <li>
                    <Link to="/profile" className="text-muted-foreground hover:text-foreground hover:underline transition-colors">
                      Dossier & Stats
                    </Link>
                  </li>
                  <li>
                    <Link to="/complaints" className="text-muted-foreground hover:text-foreground hover:underline transition-colors">
                      Anonymous Grievance
                    </Link>
                  </li>
                  <li>
                    <Link to="/verify" className="text-muted-foreground hover:text-foreground hover:underline transition-colors">
                      Verify SBT
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 3: Community */}
              <div>
                <h4 className="font-heading font-extrabold text-foreground text-xs uppercase tracking-wider mb-4">
                  Community
                </h4>
                <ul className="space-y-2.5 text-xs font-medium">
                  <li>
                    <a href="#contributors" className="text-muted-foreground hover:text-foreground hover:underline transition-colors">
                      Contributors
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://github.com/Sreejesh06/OffClass"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground hover:underline transition-colors inline-flex items-center gap-1"
                    >
                      GitHub Repo <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </li>
                  <li>
                    <Link to="/admin" className="text-muted-foreground hover:text-foreground hover:underline transition-colors">
                      Faculty HQ
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Authentic Department Ethos Quote — Elegant & Clean */}
          <div className="py-5 border-b border-border text-center">
            <p className="text-xs font-mono text-muted-foreground italic">
              “You can't defend what you don't understand — we build, break, and verify from the ground up.”
            </p>
          </div>

          {/* Bottom Bar: Copyright & Essential Legal */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-muted-foreground">
            <div>
              © 2026 OffClass (Cryptid) • Sri Eshwar College of Engineering
            </div>

            <div className="flex items-center gap-5">
              <Link to="/complaints" className="hover:text-foreground hover:underline transition-colors">
                Zero-Trace Grievance Policy
              </Link>
              <span className="hover:text-foreground cursor-pointer">
                Terms
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* ─────────────────────────────────────────────────────────────
          EMBOSSED BACKGROUND WATERMARK (Matching Reference Image)
         ───────────────────────────────────────────────────────────── */}
      <div
        className="w-full text-center font-heading font-black text-[13vw] leading-none tracking-tighter text-black/[0.03] dark:text-white/[0.03] select-none pointer-events-none -mt-16 md:-mt-24 pb-4 overflow-hidden"
        aria-hidden="true"
      >
        CRYPTID
      </div>
    </div>
  );
};
