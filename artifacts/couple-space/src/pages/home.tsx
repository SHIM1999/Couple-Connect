import { useState } from "react";
import { useGetProfile, useGetSummary, useUpdateStatus, getGetProfileQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckSquare, Target, Gift, Map, Heart, Star, CalendarDays } from "lucide-react";
import { Link } from "wouter";

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

  if (profileLoading || summaryLoading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 pb-24">
      <header className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-serif font-medium tracking-tight text-primary">
            {profile?.coupleTitle || "Our Space"}
          </h1>
          <Link href="/settings">
            <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary">
              <Heart className="w-5 h-5" />
            </Button>
          </Link>
        </div>

        {profile?.anniversaryDate && (
          <p className="text-sm font-medium text-accent-foreground flex items-center gap-1.5">
            <CalendarDays className="w-4 h-4" /> 
            Anniversary: {new Date(profile.anniversaryDate).toLocaleDateString()}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="font-medium text-foreground">{profile?.partner1Name || "Partner 1"}</p>
            {editingStatus === "partner1" ? (
              <Input 
                autoFocus
                value={tempStatus}
                onChange={(e) => setTempStatus(e.target.value)}
                onBlur={() => handleStatusSave("partner1")}
                onKeyDown={(e) => e.key === "Enter" && handleStatusSave("partner1")}
                className="text-sm bg-secondary/50 border-transparent h-8 rounded-lg"
              />
            ) : (
              <p 
                className="text-sm text-muted-foreground bg-secondary/30 p-2 rounded-xl cursor-pointer hover:bg-secondary/50 transition-colors line-clamp-2"
                onClick={() => {
                  setTempStatus(profile?.partner1Status || "");
                  setEditingStatus("partner1");
                }}
              >
                {profile?.partner1Status || "Set status..."}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <p className="font-medium text-foreground">{profile?.partner2Name || "Partner 2"}</p>
            {editingStatus === "partner2" ? (
              <Input 
                autoFocus
                value={tempStatus}
                onChange={(e) => setTempStatus(e.target.value)}
                onBlur={() => handleStatusSave("partner2")}
                onKeyDown={(e) => e.key === "Enter" && handleStatusSave("partner2")}
                className="text-sm bg-secondary/50 border-transparent h-8 rounded-lg"
              />
            ) : (
              <p 
                className="text-sm text-muted-foreground bg-secondary/30 p-2 rounded-xl cursor-pointer hover:bg-secondary/50 transition-colors line-clamp-2"
                onClick={() => {
                  setTempStatus(profile?.partner2Status || "");
                  setEditingStatus("partner2");
                }}
              >
                {profile?.partner2Status || "Set status..."}
              </p>
            )}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <Link href="/todos">
          <Card className="hover-elevate cursor-pointer border-transparent bg-secondary/50">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2 h-32">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">To-Dos</p>
                <p className="text-xs text-muted-foreground">{summary?.todoDoneCount || 0}/{summary?.todoCount || 0} done</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/goals">
          <Card className="hover-elevate cursor-pointer border-transparent bg-secondary/50">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2 h-32">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">Goals</p>
                <p className="text-xs text-muted-foreground">{summary?.goalDoneCount || 0}/{summary?.goalCount || 0} reached</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/wishlist">
          <Card className="hover-elevate cursor-pointer border-transparent bg-secondary/50">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2 h-32">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">Wishlist</p>
                <p className="text-xs text-muted-foreground">{summary?.wishlistCount || 0} items</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/bucketlist">
          <Card className="hover-elevate cursor-pointer border-transparent bg-secondary/50">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2 h-32">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Map className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">Bucket List</p>
                <p className="text-xs text-muted-foreground">{summary?.bucketDoneCount || 0}/{summary?.bucketCount || 0} done</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-serif font-medium">Upcoming Events</h2>
        {summary?.upcomingEvents?.length ? (
          <div className="space-y-3">
            {summary.upcomingEvents.map((event) => {
              const eventDate = new Date(event.date);
              const localDate = new Date(eventDate.getTime() + eventDate.getTimezoneOffset() * 60000);
              return (
                <Card key={event.id} className="border-transparent bg-secondary/30">
                  <CardContent className="p-4 flex gap-4 items-center">
                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-background text-primary shrink-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider">{localDate.toLocaleDateString('en-US', { month: 'short' })}</span>
                      <span className="text-lg font-serif leading-none mt-0.5">{localDate.getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        {event.isAnniversary && <Star className="w-3.5 h-3.5 text-accent-foreground fill-current" />}
                        <p className="font-medium text-foreground truncate">{event.title}</p>
                      </div>
                      {event.note && <p className="text-sm text-muted-foreground line-clamp-1">{event.note}</p>}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="bg-secondary/20 rounded-2xl p-6 text-center">
            <p className="text-sm text-muted-foreground">No upcoming events this month.</p>
          </div>
        )}
      </div>
    </div>
  );
}
