import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] w-full bg-background flex justify-center">
      <div className="w-full max-w-[430px] min-h-[100dvh] relative flex flex-col bg-background shadow-2xl shadow-black/5 overflow-hidden">
        <main className="flex-1 overflow-y-auto pb-24 scroll-smooth">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
