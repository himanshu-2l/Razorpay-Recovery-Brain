import React, { useState, useEffect } from 'react';
import { ArrowRight, Play } from 'lucide-react';

interface StickyBottomBarProps {
  onLaunchConsole: () => void;
  onOpenSimulator: () => void;
  totalAtRisk: number;
}

export const StickyBottomBar: React.FC<StickyBottomBarProps> = ({
  onLaunchConsole,
  onOpenSimulator,
  totalAtRisk,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="pointer-events-auto flex items-center space-x-3 sm:space-x-4 px-5 py-2.5 rounded-full bg-[#202a3e]/95 backdrop-blur-md border border-white/15 text-white transition-all">
        {/* At Risk Pill */}
        <div className="hidden sm:flex items-center space-x-2 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-[#305EFF] animate-ping" />
          <span className="text-[#cdd0d6] font-medium">At Risk:</span>
          <span className="font-bold text-white">
            ₹{Math.round(totalAtRisk / 100000)}L
          </span>
        </div>

        <div className="hidden sm:block w-px h-4 bg-white/10" />

        {/* Simulate Action */}
        <button
          onClick={onOpenSimulator}
          className="idle-btn-ghost text-xs px-3.5 py-1.5 flex items-center space-x-1.5"
        >
          <Play className="w-3 h-3 text-[#305EFF] fill-[#305EFF]" />
          <span>Simulate</span>
        </button>

        {/* Launch Console Action */}
        <button
          onClick={onLaunchConsole}
          className="idle-btn-primary text-xs px-4 py-1.5 flex items-center space-x-1.5"
        >
          <span>Launch Console</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default StickyBottomBar;
