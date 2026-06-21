import { useEffect, useState } from "react";
import logoImg from "@assets/ChatGPT_Image_2026년_6월_22일_오전_08_38_30_1782085260744.png";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const percentages = [0, 27, 59, 83, 100];
    let step = 0;
    
    const interval = setInterval(() => {
      step++;
      if (step < percentages.length) {
        setProgress(percentages[step]);
      } else {
        clearInterval(interval);
        setTimeout(() => {
          onComplete();
        }, 300);
      }
    }, 450);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#1A1035] text-[#FFF8F0]">
      <div className="flex flex-col items-center space-y-8 animate-in fade-in zoom-in duration-700">
        <img 
          src={logoImg} 
          alt="Logo" 
          className="w-24 h-24 object-contain pixel-border rounded-xl"
          style={{ imageRendering: 'pixelated' }}
        />
        
        <div className="text-center space-y-4">
          <h1 className="font-pixel text-xl sm:text-2xl text-[#FF7043] leading-relaxed drop-shadow-md">
            Couple<br/>Connect
          </h1>
          <p className="font-sans text-sm font-medium text-[#FFAB91] tracking-wide">
            Plan together. Grow together.
          </p>
        </div>

        <div className="w-64 space-y-3 mt-12">
          <div className="h-4 w-full bg-[#6D3B2E] rounded-full p-0.5 border-2 border-[#6D3B2E] overflow-hidden">
            <div 
              className="h-full bg-[#FF7043] rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-xs font-pixel text-[#FFAB91]">
            <span className="animate-blink">Loading...</span>
            <span>{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
