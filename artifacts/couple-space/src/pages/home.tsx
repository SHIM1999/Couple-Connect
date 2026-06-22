import { useState, useRef, useCallback } from "react";
import { useGetProfile, useGetSummary, useUpdateStatus, getGetProfileQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { CheckSquare, Target, CalendarDays, Edit2 } from "lucide-react";
import { Link } from "wouter";
import heroImg from "@assets/ChatGPT_Image_2026년_6월_22일_오전_08_45_49_1782085558954.png";

interface FloatingHeart {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export default function Home() {
  const { data: profile, isLoading: profileLoading } = useGetProfile();
  const { data: summary, isLoading: summaryLoading } = useGetSummary();
  const updateStatus = useUpdateStatus();
  const queryClient = useQueryClient();

  const [editingStatus, setEditingStatus] = useState<"partner1" | "partner2" | null>(null);
  const [tempStatus, setTempStatus] = useState("");
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);
  const heartIdRef = useRef(0);
  const counterRef = useRef<HTMLDivElement>(null);

  const handleStatusSave = (person: "partner1" | "partner2") => {
    if (!tempStatus.trim() || tempStatus === (person === "partner1" ? profile?.partner1Status : profile?.partner2Status)) {
      setEditingStatus(null);
      return;
    }
    updateStatus.mutate(
      { person, data: { status: tempStatus } },
      {
        onSuccess: (updatedProfile) => {
          queryClient.setQueryData(getGetProfileQueryKey(), updatedProfile);
          setEditingStatus(null);
        }
      }
    );
  };

  const spawnHearts = useCallback(() => {
    const count = 8;
    const newHearts: FloatingHeart[] = Array.from({ length: count }, (_, i) => ({
      id: ++heartIdRef.current,
      x: 30 + Math.random() * 40,
      y: 0,
      size: 14 + Math.random() * 16,
      duration: 900 + Math.random() * 600,
      delay: i * 60,
    }));
    setHearts(prev => [...prev, ...newHearts]);
    setTimeout(() => {
      setHearts(prev => prev.filter(h => !newHearts.find(n => n.id === h.id)));
    }, 1800);
  }, []);

  const getDaysTogether = () => {
    if (!profile?.anniversaryDate) return null;
    const start = new Date(profile.anniversaryDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysTogether = getDaysTogether();

  if (profileLoading || summaryLoading) {
    return (
      <div className="w-full min-h-screen bg-background animate-pulse p-6 space-y-6 pt-64">
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="w-full pb-24">
      {/* FIXED HERO IMAGE — stays in place as content scrolls over */}
      <div
        className="fixed top-0 left-0 right-0 flex justify-center pointer-events-none"
        style={{ zIndex: 0 }}
      >
        <div className="relative w-full max-w-[430px] h-[55vh] min-h-[380px]">
          <img
            src={heroImg}
            alt="Couple pixel art"
            className="absolute inset-0 w-full h-full object-cover object-center"
            style={{ imageRendering: "pixelated" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/60 pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 p-6 pt-12 flex flex-col items-center text-center pointer-events-none">
            <h1 className="font-pixel text-xl sm:text-2xl text-[#FF7043] drop-shadow-[2px_2px_0_#000]">
              {profile?.coupleTitle || "Couple Connect"}
            </h1>
            <p className="mt-3 font-sans font-semibold tracking-widest uppercase text-xs text-[#FFF8F0] opacity-90">
              Plan together. Grow together.
            </p>
          </div>
        </div>
      </div>

      {/* SPACER pushes scrollable content below the hero */}
      <div style={{ height: "calc(55vh - 60px)", minHeight: "320px" }} />

      {/* D+ COUNTER — floats at transition point, tappable for hearts */}
      <div className="relative flex justify-center z-20 -mb-6">
        <div
          ref={counterRef}
          className="relative pixel-card bg-[#FF6B81] text-[#FFF8F0] px-6 py-3 flex items-center gap-3 cursor-pointer select-none active:scale-95 transition-transform"
          onClick={spawnHearts}
          data-testid="counter-days-together"
          style={{ boxShadow: "4px 4px 0 #a8354f" }}
        >
          <span className="text-xl">&#10084;</span>
          <span className="font-pixel text-lg">D+{daysTogether ?? "?"}</span>
          <span className="text-xl">&#10084;</span>

          {/* Floating hearts burst */}
          {hearts.map(heart => (
            <span
              key={heart.id}
              className="absolute pointer-events-none select-none"
              style={{
                left: `${heart.x}%`,
                bottom: "100%",
                fontSize: heart.size,
                color: ["#FF6B81", "#FF7043", "#FFAB91", "#fff"][Math.floor(Math.random() * 4)],
                animation: `heartFloat ${heart.duration}ms ease-out forwards`,
                animationDelay: `${heart.delay}ms`,
                opacity: 0,
              }}
            >
              &#10084;
            </span>
          ))}
        </div>
      </div>

      {/* SCROLLABLE CONTENT — sits on top of the fixed image */}
      <div
        className="relative z-10 px-5 py-6 space-y-6 pt-12"
        style={{ background: "hsl(var(--background))", borderRadius: "20px 20px 0 0", marginTop: "0" }}
      >
        {/* Status Panels */}
        <div className="grid grid-cols-2 gap-4">
          <div className="pixel-card p-4 flex flex-col">
            <h3 className="font-pixel text-[10px] text-[#FF7043] mb-2">{profile?.partner1Name || "Player 1"}</h3>
            {editingStatus === "partner1" ? (
              <Input
                autoFocus
                value={tempStatus}
                onChange={(e) => setTempStatus(e.target.value)}
                onBlur={() => handleStatusSave("partner1")}
                onKeyDown={(e) => e.key === "Enter" && handleStatusSave("partner1")}
                className="text-xs pixel-border h-8 mt-auto"
              />
            ) : (
              <div
                className="text-xs font-medium text-muted-foreground cursor-pointer flex items-center justify-between group mt-auto"
                onClick={() => { setTempStatus(profile?.partner1Status || ""); setEditingStatus("partner1"); }}
              >
                <span className="line-clamp-2">{profile?.partner1Status || "Set status..."}</span>
                <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
          </div>

          <div className="pixel-card p-4 flex flex-col">
            <h3 className="font-pixel text-[10px] text-[#FF6B81] mb-2">{profile?.partner2Name || "Player 2"}</h3>
            {editingStatus === "partner2" ? (
              <Input
                autoFocus
                value={tempStatus}
                onChange={(e) => setTempStatus(e.target.value)}
                onBlur={() => handleStatusSave("partner2")}
                onKeyDown={(e) => e.key === "Enter" && handleStatusSave("partner2")}
                className="text-xs pixel-border h-8 mt-auto"
              />
            ) : (
              <div
                className="text-xs font-medium text-muted-foreground cursor-pointer flex items-center justify-between group mt-auto"
                onClick={() => { setTempStatus(profile?.partner2Status || ""); setEditingStatus("partner2"); }}
              >
                <span className="line-clamp-2">{profile?.partner2Status || "Set status..."}</span>
                <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
          </div>
        </div>

        {/* Summary Tiles */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/todos">
            <div className="pixel-card p-4 flex items-center gap-3 cursor-pointer active:translate-y-1 transition-transform" data-testid="tile-todos">
              <div className="w-10 h-10 rounded bg-[#4CAF78] text-[#FFF8F0] pixel-border flex items-center justify-center shrink-0">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div>
                <p className="font-pixel text-[8px] text-card-foreground mb-1 leading-tight">TODOS</p>
                <p className="text-xs font-bold text-muted-foreground">{summary?.todoDoneCount ?? 0}/{summary?.todoCount ?? 0}</p>
              </div>
            </div>
          </Link>
          <Link href="/goals">
            <div className="pixel-card p-4 flex items-center gap-3 cursor-pointer active:translate-y-1 transition-transform" data-testid="tile-goals">
              <div className="w-10 h-10 rounded bg-[#FFAB91] pixel-border flex items-center justify-center shrink-0" style={{ color: "#4A2518" }}>
                <Target className="w-5 h-5" />
              </div>
              <div>
                <p className="font-pixel text-[8px] text-card-foreground mb-1 leading-tight">GOALS</p>
                <p className="text-xs font-bold text-muted-foreground">{summary?.goalDoneCount ?? 0}/{summary?.goalCount ?? 0}</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Upcoming Event */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 px-1">
            <CalendarDays className="w-4 h-4 text-[#FF7043]" />
            <h2 className="font-pixel text-[10px] text-foreground">NEXT EVENT</h2>
          </div>

          {summary?.upcomingEvents?.length ? (
            <div className="pixel-card p-4 flex gap-4 items-center bg-[#FF7043] text-[#FFF8F0] border-[#a8462a]" style={{ boxShadow: "4px 4px 0 #a8462a" }}>
              {(() => {
                const nextEvent = summary.upcomingEvents[0];
                const dateObj = new Date(nextEvent.date);
                const localDate = new Date(dateObj.getTime() + dateObj.getTimezoneOffset() * 60000);
                return (
                  <>
                    <div className="pixel-border bg-[#4A2518] w-14 h-14 flex flex-col items-center justify-center shrink-0 rounded">
                      <span className="text-[9px] font-pixel text-[#FFAB91]">{localDate.toLocaleDateString('en-US', { month: 'short' })}</span>
                      <span className="text-lg font-pixel mt-1 text-[#FFF8F0]">{localDate.getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-pixel text-[10px] leading-relaxed truncate">{nextEvent.title}</p>
                      {nextEvent.note && <p className="text-xs font-medium opacity-90 mt-1 line-clamp-1">{nextEvent.note}</p>}
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="pixel-card p-6 text-center border-dashed">
              <p className="font-pixel text-[9px] text-muted-foreground">NO EVENTS PLANNED</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
