import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { Shield, User, Trophy, Gift, Flag, ShieldCheck, List, X, Compass } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/components/ThemeProvider"

// Helper component for navigation links
const NavLink = ({ href, icon: Icon, label, isActive }: { href: string; icon: any; label: string; isActive?: boolean }) => (
  <Link 
    to={href} 
    className={cn(
      "group flex items-center gap-1.5 text-sm font-medium transition-colors whitespace-nowrap",
      isActive ? "text-foreground" : "text-foreground/70 hover:text-foreground"
    )}
  >
    <Icon className={cn("w-5 h-5", isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100")} weight={isActive ? "fill" : "regular"} />
    <span>{label}</span>
  </Link>
)

export function NotchNavbar({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()
  const { house } = useTheme()

  // Navigation items configuration
  const publicItems = [
    { label: "Home", href: "/", icon: Shield },
    { label: "Leaderboard", href: "/leaderboard", icon: Trophy }
  ];

  const loggedInItemsLeft = [
    { label: "Profile", href: "/profile", icon: User },
    { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
    { label: "Headquarters", href: "/opportunities", icon: Compass },
  ];

  const loggedInItemsRight = [
    { label: "Redeem", href: "/redeem", icon: Gift },
    { label: "Complaints", href: "/complaints", icon: Flag },
  ];

  if (user?.role === 'ADMIN' || user?.role === 'TEACHER') {
    loggedInItemsRight.push({ label: "Admin", href: "/admin", icon: ShieldCheck })
  }

  const leftItems = user ? loggedInItemsLeft : publicItems;
  const rightItems = user ? loggedInItemsRight : [];

  return (
    <>
      <header className={cn("fixed top-0 inset-x-0 z-50 h-16 flex px-0 drop-shadow-sm", className)} {...props}>
        
        {/* Left Side Bar - Flexible width */}
        <div className="flex-1 h-10 bg-white z-20 relative min-w-0">
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <line x1="0" y1="39.5" x2="100%" y2="39.5" stroke="currentColor" strokeOpacity={0.15} strokeWidth={1} className="text-foreground" />
          </svg>
        </div>

        {/* Responsive Notch Container - 3 Slices */}
        <div className="flex h-16 relative z-10 shrink-0 -ml-px">
          
          {/* Left Slice (Corner) */}
          <div className="w-[50px] h-full relative shrink-0">
            {/* Glass Background */}
            <div className="absolute inset-0 bg-white" style={{ clipPath: "path('M0 0 H50 V64 C25 64 25 40 0 40 Z')" }} />
            {/* Outlines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 50 64">
              <path d="M0 39.5 C25 39.5 25 63.5 50 63.5" fill="none" stroke="currentColor" strokeOpacity={0.15} strokeWidth={1} className="text-foreground" />
            </svg>
          </div>

          {/* Center Slice (Flexible Content Area) */}
          <div className="flex-1 h-full relative min-w-0 -ml-px">
             {/* Background & Lines Layer */}
             <div className="absolute inset-0 bg-white">
                 <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                   <line x1="0" y1="63.5" x2="100%" y2="63.5" stroke="currentColor" strokeOpacity={0.15} strokeWidth={1} className="text-foreground" />
                 </svg>
             </div>

             {/* Content Layer */}
             <div className="relative w-full h-full flex items-end justify-between pb-2 px-4 md:px-8">
               
               {/* Desktop Left Nav */}
               <nav className="hidden md:flex gap-8 mb-1 shrink-0">
                {leftItems.map(item => (
                  <NavLink key={item.label} {...item} isActive={location.pathname === item.href} />
                ))}
              </nav>

              {/* Mobile Menu Button (Left) */}
              <button 
                className="md:hidden mb-1 p-1 text-foreground/70 hover:text-foreground transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <List className="w-6 h-6" />}
              </button>

              {/* Logo (Center) */}
              <div className="flex justify-center shrink-0 mx-2 md:mx-4 mt-1">
                <Link to="/" className="flex items-center justify-center relative group gap-2">
                  <Shield weight="duotone" size={28} className="transition-transform relative z-10" style={{ color: 'var(--accent-house, #111827)' }} />
                  <span className="font-bold tracking-tight text-lg hidden sm:block font-mono">OFFCLASS</span>
                </Link>
              </div>

              {/* Desktop Right Nav */}
              <nav className="hidden md:flex gap-6 items-center shrink-0">
                {rightItems.map(item => (
                  <NavLink key={item.label} {...item} isActive={location.pathname === item.href} />
                ))}
                
                <div className="flex gap-4 pl-4 border-l border-foreground/10 shrink-0 items-center">
                  {!user ? (
                    <Link to="/login" className="px-4 py-1.5 text-sm font-bold text-background bg-foreground rounded-2xl hover:bg-foreground/90 transition-colors shadow-sm whitespace-nowrap font-sans">
                      Sign In
                    </Link>
                  ) : (
                    <button 
                      onClick={() => logout()}
                      className="text-sm font-bold text-foreground/70 hover:text-foreground transition-colors whitespace-nowrap font-sans"
                    >
                      Sign Out
                    </button>
                  )}
                </div>
              </nav>

              {/* Mobile Right Actions */}
              <div className="md:hidden flex items-center gap-2 mb-1">
                 {!user ? (
                   <Link to="/login" className="px-3 py-1 text-xs font-bold text-background bg-foreground rounded-2xl hover:bg-foreground/90 transition-colors shadow-sm whitespace-nowrap">
                     Sign In
                   </Link>
                 ) : (
                   <button 
                      onClick={() => logout()}
                      className="px-3 py-1 text-xs font-bold border border-foreground/20 rounded-2xl text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-colors whitespace-nowrap"
                   >
                     Sign Out
                   </button>
                 )}
              </div>

             </div>
          </div>

          {/* Right Slice (Corner) */}
          <div className="w-[50px] h-full relative shrink-0 -ml-px">
            {/* Glass Background */}
            <div className="absolute inset-0 bg-white" style={{ clipPath: "path('M0 0 H50 V40 C25 40 25 64 0 64 Z')" }} />
            {/* Outlines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 50 64">
              <path d="M0 63.5 C25 63.5 25 39.5 50 39.5" fill="none" stroke="currentColor" strokeOpacity={0.15} strokeWidth={1} className="text-foreground" />
            </svg>
          </div>

        </div>

        {/* Right Side Bar - Flexible width */}
        <div className="flex-1 h-10 bg-white z-20 relative min-w-0 -ml-px">
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <line x1="0" y1="39.5" x2="100%" y2="39.5" stroke="currentColor" strokeOpacity={0.15} strokeWidth={1} className="text-foreground" />
          </svg>
        </div>

      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-16 z-40 bg-white border-b border-foreground/10 p-4 md:hidden shadow-lg"
          >
             <nav className="flex flex-col gap-2">
               {/* Combine all items */}
               {[...leftItems, ...rightItems].map(item => (
                 <Link 
                   key={item.label} 
                   to={item.href}
                   className={cn(
                     "flex items-center gap-3 p-3 rounded-lg hover:bg-foreground/5 transition-colors",
                     location.pathname === item.href ? "bg-foreground/5" : ""
                   )}
                   onClick={() => setIsMobileMenuOpen(false)}
                 >
                   <item.icon className="w-5 h-5 opacity-70" weight={location.pathname === item.href ? "fill" : "regular"} />
                   <span className="font-bold text-foreground/90 font-sans">{item.label}</span>
                 </Link>
               ))}
             </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
