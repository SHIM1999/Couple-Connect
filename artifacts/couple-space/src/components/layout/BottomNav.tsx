import { Link, useLocation } from "wouter";
import { Home, Calendar, CheckSquare, Target, Menu } from "lucide-react";

export function BottomNav() {
  const [location] = useLocation();

  const links = [
    { href: "/calendar", icon: Calendar, label: "Dates" },
    { href: "/todos", icon: CheckSquare, label: "Todos" },
    { href: "/", icon: Home, label: "Home", isCenter: true },
    { href: "/goals", icon: Target, label: "Goals" },
    { href: "/more", icon: Menu, label: "More" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pb-safe">
      <div className="w-full max-w-[430px] bg-[#1A1035] border-t-4 border-[#6D3B2E] relative h-16">
        <nav className="flex items-center justify-around h-full px-1">
          {links.map(({ href, icon: Icon, label, isCenter }) => {
            const isActive = location === href;
            
            if (isCenter) {
              return (
                <Link key={href} href={href} className="relative flex flex-col items-center justify-center w-16 h-full -mt-6">
                  <div className={`w-14 h-14 rounded-full border-4 flex items-center justify-center transition-all duration-200 z-10 
                    ${isActive 
                      ? 'bg-[#FF7043] border-[#FFF8F0] shadow-[0_4px_0_#6D3B2E] transform -translate-y-1' 
                      : 'bg-[#1A1035] border-[#6D3B2E] text-[#FFAB91] shadow-[0_2px_0_#6D3B2E]'
                    }`}>
                    <Icon className={`w-6 h-6 ${isActive ? 'text-[#FFF8F0]' : ''}`} />
                  </div>
                  <span className={`text-[8px] font-pixel mt-2 ${isActive ? 'text-[#FF7043]' : 'text-[#FFAB91]'}`}>
                    {label}
                  </span>
                </Link>
              );
            }

            return (
              <Link key={href} href={href} className="relative flex flex-col items-center justify-center w-14 h-full pt-1">
                <div className={`flex flex-col items-center transition-all duration-200 ${isActive ? 'text-[#FF7043]' : 'text-[#FFAB91] hover:text-[#FFF8F0]'}`}>
                  <Icon className={`w-5 h-5 mb-1.5 transition-transform duration-200 ${isActive ? 'scale-110 stroke-[2.5px]' : 'scale-100 stroke-[2px]'}`} />
                  <span className="text-[7px] font-pixel uppercase tracking-tighter">{label}</span>
                </div>
                {isActive && (
                  <div className="absolute bottom-1 w-6 h-1 bg-[#FF7043] rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
