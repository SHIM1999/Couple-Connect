import { useState, useRef, useCallback, useEffect } from "react";
import { useGetProfile, useGetSummary, useUpdateStatus, getGetProfileQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { CheckSquare, Target, CalendarDays, Edit2, Gift, Map } from "lucide-react";
import { Link } from "wouter";
import heroImg from "@assets/ChatGPT_Image_2026년_6월_22일_오전_08_45_49_1782085558954.png";
import { HappinessGauge } from "@/components/HappinessGauge";
import { useLang } from "@/lib/i18n";

interface FloatingHeart {
  id: number;
  x: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
}

interface HappinessState {
  partner1: number;
  partner2: number;
}

export default function Home() {
  const { data: profile, isLoading: profileLoading } = useGetProfile();
  const { data: summary, isLoading: summaryLoading } = useGetSummary();
  const updateStatus = useUpdateStatus();
  const queryClient = useQueryClient();

  const [editingStatus, setEditingStatus] = useState<"partner1" | "partner2" | null>(null);
  const [tempStatus, setTempStatus] = useState("");
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);
  const [gaugeAnimate, setGaugeAnimate] = useState(false);
  const { t } = useLang();
  const [happiness, setHappiness] = useState<HappinessState>({ partner1: 0, partner2: 0 });
  const heartIdRef = useRef(0);

  const fetchHappiness = useCallback(async () => {
    try {
      const res = await fetch("/api/happiness");
      const data = await res.json() as { partner1: number; partner2: number };
      setHappiness({ partner1: data.partner1 ?? 0, partner2: data.partner2 ?? 0 });
    } catch {}
  }, []);

  useEffect(() => {
    fetchHappiness();
    const interval = setInterval(fetchHappiness, 30_000);
    return () => clearInterval(interval);
  }, [fetchHappiness]);

  const handleStatusSave = (person: "partner1" | "partner2") => {
    if (!tempStatus.trim()) { setEditingStatus(null); return; }
    updateStatus.mutate(
      { person, data: { status: tempStatus } },
      { onSuccess: (updated) => { queryClient.setQueryData(getGetProfileQueryKey(), updated); setEditingStatus(null); } }
    );
  };

  const spawnHearts = useCallback(() => {
    const colors = ["#FF6B81", "#FF7043", "#FFAB91", "#fff", "#FFD700"];
    const newHearts: FloatingHeart[] = Array.from({ length: 10 }, (_, i) => ({
      id: ++heartIdRef.current,
      x: 15 + Math.random() * 70,
      size: 13 + Math.random() * 18,
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: 900 + Math.random() * 700,
      delay: i * 55,
    }));
    setHearts(prev => [...prev, ...newHearts]);
    setTimeout(() => setHearts(prev => prev.filter(h => !newHearts.find(n => n.id === h.id))), 2000);
  }, []);

  const handleDayPress = useCallback(async () => {
    spawnHearts();
    setGaugeAnimate(true);
    setTimeout(() => setGaugeAnimate(false), 700);

    try {
      await Promise.all([
        fetch("/api/happiness/press/partner1", { method: "POST" }),
        fetch("/api/happiness/press/partner2", { method: "POST" }),
      ]);
      await fetchHappiness();
    } catch {}
  }, [spawnHearts, fetchHappiness]);

  const getDaysTogether = () => {
    if (!profile?.anniversaryDate) return null;
    const start = new Date(profile.anniversaryDate);
    const now = new Date();
    return Math.ceil(Math.abs(now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
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
      {/* FIXED HERO IMAGE */}
      <div className="fixed top-0 left-0 right-0 flex justify-center pointer-events-none" style={{ zIndex: 0 }}>
        <div className="relative w-full max-w-[430px] h-[55vh] min-h-[380px]">
          <img src={heroImg} alt="Couple pixel art"
            className="absolute inset-0 w-full h-full object-cover object-center"
            style={{ imageRendering: "pixelated" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/60 pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 p-6 pt-12 flex flex-col items-center text-center pointer-events-none">
            <h1 className="font-pixel text-xl sm:text-2xl text-[#FF7043] drop-shadow-[2px_2px_0_#000]">
              {profile?.coupleTitle || t("home_title_fallback")}
            </h1>
            <p className="mt-3 font-sans font-semibold tracking-widest uppercase text-xs text-[#FFF8F0] opacity-90">
              {t("home_subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Spacer under fixed hero */}
      <div style={{ height: "calc(55vh - 60px)", minHeight: "320px" }} />

      {/* D+ COUNTER — tappable */}
      <div className="relative flex justify-center z-20 -mb-6">
        <div
          className="relative pixel-card bg-[#FF6B81] text-[#FFF8F0] px-6 py-3 flex items-center gap-3 cursor-pointer select-none active:scale-95 transition-transform"
          onClick={handleDayPress}
          style={{ boxShadow: "4px 4px 0 #a8354f" }}
        >
          <span className="text-xl">&#10084;</span>
          <span className="font-pixel text-lg">D+{daysTogether ?? "?"}</span>
          <span className="text-xl">&#10084;</span>

          {hearts.map(heart => (
            <span key={heart.id} className="absolute pointer-events-none select-none"
              style={{
                left: `${heart.x}%`,
                bottom: "100%",
                fontSize: heart.size,
                color: heart.color,
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

      {/* SCROLLABLE CONTENT */}
      <div className="relative z-10 px-5 py-6 space-y-6 pt-12"
        style={{ background: "hsl(var(--background))", borderRadius: "20px 20px 0 0" }}>

        {/* HAPPINESS GAUGES */}
        <div className="pixel-card p-4 space-y-4">
          <p className="font-pixel text-[9px] text-foreground text-center">&#10084; {t("home_happiness")} &#10084;</p>
          <HappinessGauge
            label={profile?.partner1Name?.toUpperCase() ?? "ME"}
            value={happiness.partner1}
            color="#FF6B81"
            animate={gaugeAnimate}
          />
          <HappinessGauge
            label={profile?.partner2Name?.toUpperCase() ?? "MY LOVE"}
            value={happiness.partner2}
            color="#FF7043"
            animate={gaugeAnimate}
          />
        </div>

        {/* STATUS PANELS */}
        <div className="grid grid-cols-2 gap-4">
          <div className="pixel-card p-4 flex flex-col">
            <h3 className="font-pixel text-[10px] text-[#FF7043] mb-2">{profile?.partner1Name || "Player 1"}</h3>
            {editingStatus === "partner1" ? (
              <Input autoFocus value={tempStatus}
                onChange={(e) => setTempStatus(e.target.value)}
                onBlur={() => handleStatusSave("partner1")}
                onKeyDown={(e) => e.key === "Enter" && handleStatusSave("partner1")}
                className="text-xs pixel-border h-8 mt-auto" />
            ) : (
              <div className="text-xs font-medium text-muted-foreground cursor-pointer flex items-center justify-between group mt-auto"
                onClick={() => { setTempStatus(profile?.partner1Status || ""); setEditingStatus("partner1"); }}>
                <span className="line-clamp-2">{profile?.partner1Status || t("home_set_status")}</span>
                <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
          </div>
          <div className="pixel-card p-4 flex flex-col">
            <h3 className="font-pixel text-[10px] text-[#FF6B81] mb-2">{profile?.partner2Name || "Player 2"}</h3>
            {editingStatus === "partner2" ? (
              <Input autoFocus value={tempStatus}
                onChange={(e) => setTempStatus(e.target.value)}
                onBlur={() => handleStatusSave("partner2")}
                onKeyDown={(e) => e.key === "Enter" && handleStatusSave("partner2")}
                className="text-xs pixel-border h-8 mt-auto" />
            ) : (
              <div className="text-xs font-medium text-muted-foreground cursor-pointer flex items-center justify-between group mt-auto"
                onClick={() => { setTempStatus(profile?.partner2Status || ""); setEditingStatus("partner2"); }}>
                <span className="line-clamp-2">{profile?.partner2Status || t("home_set_status")}</span>
                <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
          </div>
        </div>

        {/* SUMMARY TILES */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/todos">
            <div className="pixel-card p-4 flex items-center gap-3 cursor-pointer active:translate-y-1 transition-transform">
              <div className="w-10 h-10 rounded bg-[#4CAF78] text-[#FFF8F0] pixel-border flex items-center justify-center shrink-0">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div>
                <p className="font-pixel text-[8px] text-card-foreground mb-1 leading-tight">{t("home_todos")}</p>
                <p className="text-xs font-bold text-muted-foreground">{summary?.todoDoneCount ?? 0}/{summary?.todoCount ?? 0}</p>
              </div>
            </div>
          </Link>
          <Link href="/goals">
            <div className="pixel-card p-4 flex items-center gap-3 cursor-pointer active:translate-y-1 transition-transform">
              <div className="w-10 h-10 rounded bg-[#FFAB91] pixel-border flex items-center justify-center shrink-0" style={{ color: "#4A2518" }}>
                <Target className="w-5 h-5" />
              </div>
              <div>
                <p className="font-pixel text-[8px] text-card-foreground mb-1 leading-tight">{t("home_goals")}</p>
                <p className="text-xs font-bold text-muted-foreground">{summary?.goalDoneCount ?? 0}/{summary?.goalCount ?? 0}</p>
              </div>
            </div>
          </Link>
          <Link href="/wishlist">
            <div className="pixel-card p-4 flex items-center gap-3 cursor-pointer active:translate-y-1 transition-transform">
              <div className="w-10 h-10 rounded bg-[#F2526A] text-[#FFF8F0] pixel-border flex items-center justify-center shrink-0">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <p className="font-pixel text-[8px] text-card-foreground mb-1 leading-tight">{t("home_wishlist")}</p>
                <p className="text-xs font-bold text-muted-foreground">{t("items_count")(summary?.wishlistCount ?? 0)}</p>
              </div>
            </div>
          </Link>
          <Link href="/bucketlist">
            <div className="pixel-card p-4 flex items-center gap-3 cursor-pointer active:translate-y-1 transition-transform">
              <div className="w-10 h-10 rounded bg-[#4CAF78] text-[#FFF8F0] pixel-border flex items-center justify-center shrink-0">
                <Map className="w-5 h-5" />
              </div>
              <div>
                <p className="font-pixel text-[8px] text-card-foreground mb-1 leading-tight">{t("home_bucket")}</p>
                <p className="text-xs font-bold text-muted-foreground">{summary?.bucketDoneCount ?? 0}/{summary?.bucketCount ?? 0}</p>
              </div>
            </div>
          </Link>
        </div>

        {/* NEXT EVENT */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 px-1">
            <CalendarDays className="w-4 h-4 text-[#FF7043]" />
            <h2 className="font-pixel text-[10px] text-foreground">{t("home_next_event")}</h2>
          </div>
          {summary?.upcomingEvents?.length ? (
            <div className="pixel-card p-4 flex gap-4 items-center bg-[#FF7043] text-[#FFF8F0] border-[#a8462a]"
              style={{ boxShadow: "4px 4px 0 #a8462a" }}>
              {(() => {
                const ev = summary.upcomingEvents[0];
                const d = new Date(ev.date);
                const local = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
                return (
                  <>
                    <div className="pixel-border bg-[#4A2518] w-14 h-14 flex flex-col items-center justify-center shrink-0 rounded">
                      <span className="text-[9px] font-pixel text-[#FFAB91]">{local.toLocaleDateString('en-US', { month: 'short' })}</span>
                      <span className="text-lg font-pixel mt-1 text-[#FFF8F0]">{local.getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-pixel text-[10px] leading-relaxed truncate">{ev.title}</p>
                      {ev.note && <p className="text-xs font-medium opacity-90 mt-1 line-clamp-1">{ev.note}</p>}
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="pixel-card p-6 text-center border-dashed">
              <p className="font-pixel text-[9px] text-muted-foreground">{t("home_no_events")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
