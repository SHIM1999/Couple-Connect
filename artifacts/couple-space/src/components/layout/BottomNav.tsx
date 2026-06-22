import { Link, useLocation } from "wouter";
import { Home, Calendar, CheckSquare, Target, Menu } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { playNavTapSound } from "@/lib/sounds";

export function BottomNav() {
  const [location] = useLocation();
  const { t } = useLang();

  const links = [
    { href: "/calendar", icon: Calendar, label: t("nav_dates") },
    { href: "/todos", icon: CheckSquare, label: t("nav_todos") },
    { href: "/", icon: Home, label: t("nav_home"), isCenter: true },
    { href: "/goals", icon: Target, label: t("nav_goals") },
    { href: "/more", icon: Menu, label: t("nav_more") },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pb-safe">
      <div className="w-full max-w-[430px] bg-[#F0B7AA] border-t-4 border-[#c47b68] relative h-16"
           style={{ boxShadow: "0 -2px 0 #a85f4e" }}>
        <nav className="flex items-center justify-around h-full px-1">
          {links.map(({ href, icon: Icon, label, isCenter }) => {
            const isActive = location === href;

            if (isCenter) {
              return (
                <Link key={href} href={href} onClick={playNavTapSound} className="relative flex flex-col items-center justify-center w-16 h-full -mt-6">
                  <div className={`w-14 h-14 rounded-full border-4 flex items-center justify-center transition-all duration-200 z-10
                    ${isActive
                      ? 'bg-[#F4623A] border-[#fde8e0] shadow-[0_4px_0_#a85f4e] -translate-y-1'
                      : 'bg-[#e8876e] border-[#F0B7AA] text-[#fde8e0] shadow-[0_2px_0_#a85f4e]'
                    }`}>
                    <Icon className="w-6 h-6 text-[#fde8e0]" />
                  </div>
                  <span className={`text-[8px] font-pixel mt-2 ${isActive ? 'text-[#8b3a25]' : 'text-[#7a3520]'}`}>
                    {label}
                  </span>
                </Link>
              );
            }

            return (
              <Link key={href} href={href} onClick={playNavTapSound} className="relative flex flex-col items-center justify-center w-14 h-full pt-1">
                <div className={`flex flex-col items-center transition-all duration-200 ${isActive ? 'text-[#8b3a25]' : 'text-[#7a3520] hover:text-[#8b3a25]'}`}>
                  <Icon className={`w-5 h-5 mb-1.5 transition-transform duration-200 ${isActive ? 'scale-110 stroke-[2.5px]' : 'scale-100 stroke-[2px]'}`} />
                  <span className="text-[7px] font-pixel uppercase tracking-tighter">{label}</span>
                </div>
                {isActive && (
                  <div className="absolute bottom-1 w-6 h-1 bg-[#F4623A] rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
