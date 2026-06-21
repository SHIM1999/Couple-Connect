import { useState } from "react";
import { useGetProfile, useGetSummary, useUpdateStatus, getGetProfileQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { CheckSquare, Target, CalendarDays, Edit2 } from "lucide-react";
import { Link } from "wouter";
import heroImg from "@assets/ChatGPT_Image_2026년_6월_22일_오전_08_45_49_1782085558954.png";

export default function Home() {
  const { data: profile, isLoading: profileLoading } = useGetProfile();
  const { data: summary, isLoading: summaryLoading } = useGetSummary();
  const updateStatus = useUpdateStatus();
  const queryClient = useQueryClient();

  const [editingStatus, setEditingStatus] = useState<"partner1" | "partner2" | null>(null);
  const [tempStatus, setTempStatus] = useState("");

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
      {/* HERO SECTION */}
      <div className="relative w-full h-[55vh] min-h-[400px]">
        <img 
          src={heroImg} 
          alt="Couple pixel art" 
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ imageRendering: 'pixelated' }}
        />
        {/* Gradient overlays for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1035]/80 via-transparent to-[#1A1035] pointer-events-none" />
        
        <div className="absolute top-0 left-0 right-0 p-6 pt-12 flex flex-col items-center text-center">
          <h1 className="font-pixel text-xl sm:text-2xl text-[#FF7043] drop-shadow-[2px_2px_0_#1A1035]">
            {profile?.coupleTitle || "Couple Connect"}
          </h1>
          <p className="mt-3 font-sans font-semibold tracking-widest uppercase text-xs text-[#FFF8F0] opacity-90">
            Plan together. Grow together.
          </p>
        </div>

        {/* Days Together Badge */}
        {daysTogether !== null && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pixel-card bg-[#FF6B81] text-[#FFF8F0] px-6 py-3 flex items-center gap-3">
            <span className="text-xl">❤</span>
            <span className="font-pixel text-lg">D+{daysTogether}</span>
            <span className="text-xl">❤</span>
          </div>
        )}
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="px-5 py-6 space-y-6 -mt-4 relative z-10">
        
        {/* Status Panels */}
        <div className="grid grid-cols-2 gap-4">
          {/* Partner 1 */}
          <div className="pixel-card p-4 flex flex-col">
            <h3 className="font-pixel text-[10px] text-[#FF7043] mb-2">{profile?.partner1Name || "Player 1"}</h3>
            {editingStatus === "partner1" ? (
              <Input 
                autoFocus
                value={tempStatus}
                onChange={(e) => setTempStatus(e.target.value)}
                onBlur={() => handleStatusSave("partner1")}
                onKeyDown={(e) => e.key === "Enter" && handleStatusSave("partner1")}
                className="text-xs bg-[#1A1035] text-[#FFF8F0] pixel-border h-8 mt-auto"
              />
            ) : (
              <div 
                className="text-xs font-medium text-muted-foreground cursor-pointer flex items-center justify-between group mt-auto"
                onClick={() => {
                  setTempStatus(profile?.partner1Status || "");
                  setEditingStatus("partner1");
                }}
              >
                <span className="line-clamp-2">{profile?.partner1Status || "Set status..."}</span>
                <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
          </div>

          {/* Partner 2 */}
          <div className="pixel-card p-4 flex flex-col">
            <h3 className="font-pixel text-[10px] text-[#FF6B81] mb-2">{profile?.partner2Name || "Player 2"}</h3>
            {editingStatus === "partner2" ? (
              <Input 
                autoFocus
                value={tempStatus}
                onChange={(e) => setTempStatus(e.target.value)}
                onBlur={() => handleStatusSave("partner2")}
                onKeyDown={(e) => e.key === "Enter" && handleStatusSave("partner2")}
                className="text-xs bg-[#1A1035] text-[#FFF8F0] pixel-border h-8 mt-auto"
              />
            ) : (
              <div 
                className="text-xs font-medium text-muted-foreground cursor-pointer flex items-center justify-between group mt-auto"
                onClick={() => {
                  setTempStatus(profile?.partner2Status || "");
                  setEditingStatus("partner2");
                }}
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
            <div className="pixel-card p-4 flex items-center gap-3 cursor-pointer hover:bg-[#FFF8F0]/90 active:translate-y-1 transition-transform">
              <div className="w-10 h-10 rounded bg-[#4CAF78] text-[#FFF8F0] pixel-border flex items-center justify-center shrink-0">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div>
                <p className="font-pixel text-[8px] text-card-foreground mb-1 leading-tight">TODOS</p>
                <p className="text-xs font-bold text-muted-foreground">{summary?.todoDoneCount || 0}/{summary?.todoCount || 0}</p>
              </div>
            </div>
          </Link>
          <Link href="/goals">
            <div className="pixel-card p-4 flex items-center gap-3 cursor-pointer hover:bg-[#FFF8F0]/90 active:translate-y-1 transition-transform">
              <div className="w-10 h-10 rounded bg-[#FFAB91] text-[#1A1035] pixel-border flex items-center justify-center shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <p className="font-pixel text-[8px] text-card-foreground mb-1 leading-tight">GOALS</p>
                <p className="text-xs font-bold text-muted-foreground">{summary?.goalDoneCount || 0}/{summary?.goalCount || 0}</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Upcoming Event */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 px-1">
            <CalendarDays className="w-4 h-4 text-[#FF7043]" />
            <h2 className="font-pixel text-[10px] text-[#FFF8F0]">NEXT EVENT</h2>
          </div>
          
          {summary?.upcomingEvents?.length ? (
            <div className="pixel-card p-4 flex gap-4 items-center bg-[#FF7043] text-[#FFF8F0] border-[#6D3B2E]">
              {(() => {
                const nextEvent = summary.upcomingEvents[0];
                const dateObj = new Date(nextEvent.date);
                const localDate = new Date(dateObj.getTime() + dateObj.getTimezoneOffset() * 60000);
                return (
                  <>
                    <div className="pixel-border bg-[#1A1035] w-14 h-14 flex flex-col items-center justify-center shrink-0 rounded">
                      <span className="text-[9px] font-pixel text-[#FFAB91]">{localDate.toLocaleDateString('en-US', { month: 'short' })}</span>
                      <span className="text-lg font-pixel mt-1 text-[#FFF8F0]">{localDate.getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-pixel text-[10px] leading-relaxed truncate drop-shadow-md">{nextEvent.title}</p>
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
