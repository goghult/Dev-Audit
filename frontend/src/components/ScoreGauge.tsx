import React, { useEffect, useState } from 'react';

interface ScoreGaugeProps {
  score: number;
}

const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  // Determine color based on score
  let color = 'text-danger';
  let strokeColor = '#f85149'; // danger
  
  if (score >= 70) {
    color = 'text-success';
    strokeColor = '#3fb950'; // success
  } else if (score >= 40) {
    color = 'text-warning';
    strokeColor = '#d29922'; // warning
  }

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-32 h-32">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          className="text-border-default stroke-current"
          strokeWidth="8"
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          stroke={strokeColor}
          strokeWidth="8"
          strokeLinecap="round"
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: strokeDashoffset,
            transition: 'stroke-dashoffset 1.5s ease-out',
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className={`text-3xl font-bold ${color}`}>{Math.round(animatedScore)}</span>
        <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mt-1">Score</span>
      </div>
    </div>
  );
};

export default ScoreGauge;
