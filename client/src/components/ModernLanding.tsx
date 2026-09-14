import React from 'react';
import { Navbar } from './ui/navbar';
import { motion } from 'motion/react';
import { ArrowRight, MessagesSquare, BarChart, Terminal, Activity, User, Settings, Shield, Award, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SwapyFeatures } from './SwapyFeatures';
import ScrollVelocity from './ui/ScrollVelocity';
import FoldText from './ui/FoldText';
import LogoLoop, { type LogoItem } from './ui/LogoLoop';
import { SiGithub, SiLeetcode, SiTryhackme, SiHackthebox, SiCodeforces, SiLinux } from 'react-icons/si';

const platformLogos: LogoItem[] = [
  { node: <div className="flex items-center gap-4 text-gray-900 hover:text-black transition-colors"><SiGithub className="text-5xl" /><span className="font-heading font-extrabold text-3xl tracking-tight">GitHub</span></div>, title: "GitHub" },
  { node: <div className="flex items-center gap-4 text-gray-900 hover:text-[#FFA116] transition-colors"><SiLeetcode className="text-5xl" /><span className="font-heading font-extrabold text-3xl tracking-tight">LeetCode</span></div>, title: "LeetCode" },
  { node: <div className="flex items-center gap-4 text-gray-900 hover:text-[#111827] transition-colors"><SiTryhackme className="text-5xl" /><span className="font-heading font-extrabold text-3xl tracking-tight">TryHackMe</span></div>, title: "TryHackMe" },
  { node: <div className="flex items-center gap-4 text-gray-900 hover:text-[#9fef00] transition-colors"><SiHackthebox className="text-5xl" /><span className="font-heading font-extrabold text-3xl tracking-tight">HackTheBox</span></div>, title: "HackTheBox" },
  { node: <div className="flex items-center gap-4 text-gray-900 hover:text-[#1F8ACB] transition-colors"><SiCodeforces className="text-5xl" /><span className="font-heading font-extrabold text-3xl tracking-tight">Codeforces</span></div>, title: "Codeforces" },
  { node: <div className="flex items-center gap-4 text-gray-900 hover:text-[#FCC624] transition-colors"><SiLinux className="text-5xl" /><span className="font-heading font-extrabold text-3xl tracking-tight">Linux</span></div>, title: "Linux" },
];

export const ModernLanding: React.FC = () => {
  return (
    <div className="min-h-screen bg-crypto-bg font-sans text-gray-900 overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto relative flex flex-col items-center text-center">
        
        {/* Floating Shapes / Avatars (Abstracted for Cyber theme) */}
        <motion.div 
          animate={{ y: [0, -10, 0] }} 
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="hidden md:block absolute top-20 left-20 w-16 h-16 bg-crypto-pink rounded-full border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
        ></motion.div>
        
        <motion.div 
          animate={{ y: [0, 15, 0] }} 
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
          className="hidden md:block absolute top-32 right-32 w-20 h-20 bg-crypto-cyan transform rotate-12 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
          style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
        ></motion.div>

        <motion.div 
          animate={{ y: [0, -8, 0] }} 
          transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
          className="hidden md:block absolute bottom-40 left-32 w-14 h-14 bg-crypto-yellow border-2 border-black transform -rotate-12 shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
          style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
        ></motion.div>

        <motion.div 
          animate={{ y: [0, 10, 0] }} 
          transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
          className="hidden md:block absolute bottom-20 right-20 w-24 h-12 bg-crypto-purple rounded-t-full border-2 border-black border-b-0 shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
        ></motion.div>

        <h1 className="text-5xl md:text-7xl font-heading font-extrabold text-gray-900 tracking-tight max-w-4xl leading-[1.1] z-10 relative flex flex-col items-center">
          <FoldText 
            text="Empower Your Journey" 
            splitBy="word"
            fontSize="clamp(3rem, 6vw, 5rem)"
            fontWeight={800}
            color="#111827"
          />
          <span className="inline-block mt-4 mb-2 px-6 py-2 bg-crypto-yellow text-gray-900 font-mono text-4xl rounded-full border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] transform -rotate-2">
            #Cybersecurity
          </span>
          <FoldText 
            text="Training & Management" 
            splitBy="word"
            fontSize="clamp(3rem, 6vw, 5rem)"
            fontWeight={800}
            color="#111827"
          />
        </h1>
        
        <p className="mt-8 text-lg font-sans text-gray-700 font-medium max-w-2xl mx-auto z-10">
          Manage your CTF progress, certifications, and house points all from one place like a pro! Offclass covers all your academic and cybersecurity needs.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 z-10">
          <Link to="/login" className="px-8 py-4 bg-black text-white rounded-full font-bold hover:bg-gray-800 transition-colors shadow-lg">
            Join a House
          </Link>
          <Link to="/leaderboard" className="px-8 py-4 bg-white text-gray-900 border-2 border-gray-200 rounded-full font-bold hover:border-black transition-colors shadow-sm">
            View Leaderboard
          </Link>
        </div>

        {/* Dashboard Mockup Image */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-20 w-full max-w-5xl rounded-2xl border-2 border-gray-200 bg-white p-2 shadow-2xl z-10"
        >
          <div className="rounded-xl border border-gray-100 bg-gray-50 h-[400px] md:h-[600px] overflow-hidden flex flex-col">
            {/* Fake Browser Header */}
            <div className="h-12 border-b border-gray-200 bg-white flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              <div className="ml-4 flex-1 h-6 bg-gray-100 rounded-md"></div>
            </div>
            {/* Fake Dashboard Body */}
            <div className="flex flex-1 p-4 gap-4">
              {/* Sidebar */}
              <div className="w-48 hidden md:flex flex-col gap-2">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-200 text-gray-700 font-medium">
                  <Activity className="w-4 h-4" /> Overview
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 text-gray-500 font-medium transition-colors">
                  <User className="w-4 h-4" /> Profile
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 text-gray-500 font-medium transition-colors">
                  <Shield className="w-4 h-4" /> House
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 text-gray-500 font-medium transition-colors">
                  <Settings className="w-4 h-4" /> Settings
                </div>
              </div>
              {/* Main Content Area */}
              <div className="flex-1 flex flex-col gap-4">
                <div className="h-32 bg-crypto-bg border border-gray-200 rounded-xl p-6 flex flex-col justify-center">
                  <h3 className="font-heading text-2xl font-bold text-gray-900">Welcome back, Alex!</h3>
                  <p className="text-gray-600">You are currently ranked #4 in the Red House.</p>
                </div>
                <div className="flex-1 flex gap-4">
                  <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex flex-col">
                    <div className="font-bold text-gray-700 mb-4 flex items-center gap-2"><Award className="w-5 h-5 text-crypto-yellow" /> Recent Activity</div>
                    <div className="space-y-4">
                       <div className="flex items-center gap-3 text-sm"><div className="w-2 h-2 bg-green-500 rounded-full"></div> <span>Solved 'Format String' CTF challenge</span> <span className="ml-auto text-gray-400 text-xs">2h ago</span></div>
                       <div className="flex items-center gap-3 text-sm"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> <span>Linked HackTheBox profile</span> <span className="ml-auto text-gray-400 text-xs">1d ago</span></div>
                       <div className="flex items-center gap-3 text-sm"><div className="w-2 h-2 bg-crypto-purple rounded-full"></div> <span>Earned 50 pts for AWS Certification</span> <span className="ml-auto text-gray-400 text-xs">3d ago</span></div>
                    </div>
                  </div>
                  <div className="w-1/3 bg-white border border-gray-200 rounded-xl shadow-sm hidden lg:flex flex-col p-4">
                    <div className="font-bold text-gray-700 mb-4 flex items-center gap-2"><Calendar className="w-5 h-5 text-crypto-cyan" /> Upcoming</div>
                    <div className="flex flex-col gap-3">
                       <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-sm"><div className="font-bold">Weekend CTF</div><div className="text-gray-500 text-xs mt-1">Starts in 2 days</div></div>
                       <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-sm"><div className="font-bold">Guest Lecture</div><div className="text-gray-500 text-xs mt-1">Security Audits</div></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Feature Section (Split) */}
      <section className="py-24 bg-white px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1">
            <div className="inline-block px-3 py-1 bg-purple-100 text-crypto-purple rounded-full text-sm font-mono font-bold mb-6">
              #Integration
            </div>
            <h2 className="text-4xl md:text-5xl font-heading font-extrabold text-gray-900 mb-6 leading-tight">
              Track your real-world achievements automatically
            </h2>
            <p className="text-gray-700 font-medium mb-8 text-lg">
              Best data organization. Connect your GitHub, HackTheBox, and Codeforces profiles and get everything synced in one place. No manual entry needed.
            </p>
            <Link to="/profile" className="inline-flex items-center px-6 py-3 border-2 border-black rounded-full font-bold hover:bg-gray-50 transition-colors">
              How Sync Works <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
          
          <div className="flex-1 w-full">
            <div className="bg-crypto-purple rounded-3xl p-8 transform rotate-2 shadow-xl border-2 border-black">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transform -rotate-2">
                <div className="flex items-center justify-between mb-6">
                  <div className="font-bold text-lg">Linked Accounts</div>
                  <div className="w-8 h-8 bg-black rounded-full text-white flex items-center justify-center">2</div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center p-3 border border-gray-200 rounded-xl hover:border-black transition-colors bg-white cursor-pointer shadow-sm group">
                    <div className="w-10 h-10 bg-black rounded-lg mr-4 flex items-center justify-center text-white">
                      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900 text-sm group-hover:text-crypto-purple transition-colors">alex-cyber</div>
                      <div className="text-xs text-gray-500 font-medium mt-1">Synced • 15 Repositories</div>
                    </div>
                  </div>
                  <div className="flex items-center p-3 border border-gray-200 rounded-xl hover:border-black transition-colors bg-white cursor-pointer shadow-sm group">
                    <div className="w-10 h-10 bg-[#9fef00] rounded-lg mr-4 flex items-center justify-center text-black">
                      <Terminal className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900 text-sm group-hover:text-crypto-purple transition-colors">alex_htb</div>
                      <div className="text-xs text-gray-500 font-medium mt-1">Synced • Rank: Hacker</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos Row - Animated Integration Loop */}
      <section className="py-12 border-t border-b border-black bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <p className="text-sm font-bold font-mono text-gray-500 mb-8 uppercase tracking-widest text-center">Seamless Integration With</p>
          <LogoLoop
            logos={platformLogos}
            speed={80}
            direction="left"
            logoHeight={60}
            gap={80}
            hoverSpeed={10}
            scaleOnHover={true}
            fadeOut={true}
            fadeOutColor="#ffffff"
            ariaLabel="Supported integrations"
          />
        </div>
      </section>

      {/* Scroll Velocity Banner */}
      <div className="border-t-2 border-b-2 border-black bg-crypto-yellow py-8 overflow-hidden transform -rotate-1 scale-105 my-12 z-20 relative">
        <ScrollVelocity 
          texts={['CAPTURE THE FLAG • HACK THE PLANET • SECURE THE NETWORK •', 'RED TEAM • BLUE TEAM • GREEN TEAM • PURPLE TEAM •']} 
          velocity={50} 
          className="text-black uppercase tracking-tighter mx-4 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]"
        />
      </div>

      {/* Swapy Draggable Features Grid */}
      <SwapyFeatures />

      {/* Footer CTA */}
      <footer className="bg-gray-50 py-20 border-t-2 border-gray-200">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl font-heading font-extrabold text-gray-900 mb-8">Ready to upgrade your department?</h2>
          <Link to="/login" className="px-8 py-4 bg-crypto-purple text-white rounded-full font-bold hover:bg-purple-600 transition-colors shadow-lg border-2 border-black">
            Get Started Now
          </Link>
        </div>
      </footer>
    </div>
  );
};
