import { Link, useLocation } from "react-router-dom";
import { User, Trophy, Gift, Flag, Shield, ShieldCheck } from "@phosphor-icons/react";
import { useTheme, type House } from "./ThemeProvider";
import { useAuth } from "../contexts/AuthContext";
import { NotchNavbar } from "./ui/notch-navbar";

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { house, setHouse } = useTheme();
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <NotchNavbar />
      
      <main id="main-content" className="flex-1 mt-16 overflow-y-auto w-full bg-[var(--color-crypto-bg)] relative">
        <div className="min-h-full pb-12">
          {children}
        </div>
      </main>
    </div>
  );
}
