import React from 'react';

// Generates 365 days of mock data
const generateHeatmapData = () => {
  const data = [];
  for (let i = 0; i < 364; i++) {
    // Random intensity between 0 and 4
    const intensity = Math.random() > 0.6 ? Math.floor(Math.random() * 4) + 1 : 0;
    data.push(intensity);
  }
  return data;
};

const HeatmapCell = ({ intensity }: { intensity: number }) => {
  const getBackgroundColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-crypto-cyan/30';
      case 2: return 'bg-crypto-cyan/60';
      case 3: return 'bg-crypto-cyan/80';
      case 4: return 'bg-crypto-cyan';
      default: return 'bg-gray-100/50';
    }
  };

  return (
    <div 
      className={`w-3 h-3 rounded-sm ${getBackgroundColor(intensity)} transition-colors hover:ring-2 ring-gray-400`}
      title={`Activity level: ${intensity}`}
    />
  );
};

export const ActivityHeatmap = () => {
  const data = generateHeatmapData();
  
  // Group into weeks (7 days per column)
  const weeks = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }

  return (
    <div className="w-full bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100/50">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-bold text-gray-900 font-display">Activity Matrix</h3>
          <p className="text-sm text-gray-500 font-sans mt-1">Platform engagement over the last year</p>
        </div>
        <div className="text-sm font-bold font-mono text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-200/50">
          1,024 Contributions
        </div>
      </div>
      
      <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="flex flex-col gap-1 flex-shrink-0">
            {week.map((intensity, dayIdx) => (
              <HeatmapCell key={`${weekIdx}-${dayIdx}`} intensity={intensity} />
            ))}
          </div>
        ))}
      </div>
      
      <div className="mt-4 flex items-center justify-end gap-2 text-xs text-gray-500 font-mono">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-gray-100/50"></div>
          <div className="w-3 h-3 rounded-sm bg-crypto-cyan/30"></div>
          <div className="w-3 h-3 rounded-sm bg-crypto-cyan/60"></div>
          <div className="w-3 h-3 rounded-sm bg-crypto-cyan/80"></div>
          <div className="w-3 h-3 rounded-sm bg-crypto-cyan"></div>
        </div>
        <span>More</span>
      </div>
    </div>
  );
};
