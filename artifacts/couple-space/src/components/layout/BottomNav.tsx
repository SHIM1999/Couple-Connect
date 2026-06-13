import { Link, useLocation } from "wouter";
import { Home, Calendar, CheckSquare, Target, Gift, Map, Settings } from "lucide-react";

export function BottomNav() {
  const [location] = useLocation();

  const links = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/calendar", icon: Calendar, label: "Dates" },
    { href: "/todos", icon: CheckSquare, label: "Todos" },
    { href: "/goals", icon: Target, label: "Goals" },
    { href: "/wishlist", icon: Gift, label: "Wishes" },
    { href: "/bucketlist", icon: Map, label: "Bucket" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-safe">
      <div className="w-full max-w-[430px] bg-card/80 backdrop-blur-xl border-t border-border shadow-[0_-4px_24px_-8px_rgba(0,0,0,0.05)]">
        <nav className="flex items-center justify-around h-16 px-2">
          {links.map(({ href, icon: Icon, label }) => {
            const isActive = location === href;
            return (
              <Link key={href} href={href} className="relative flex flex-col items-center justify-center w-14 h-full">
                <div className={`flex flex-col items-center transition-all duration-300 ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                  <Icon className={`w-5 h-5 mb-1 transition-transform duration-300 ${isActive ? 'scale-110 stroke-[2.5px]' : 'scale-100 stroke-[1.5px]'}`} />
                  <span className="text-[10px] font-medium tracking-tight">{label}</span>
                </div>
                {isActive && (
                  <div className="absolute top-0 w-8 h-1 bg-primary rounded-b-full animate-in fade-in zoom-in duration-300" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
