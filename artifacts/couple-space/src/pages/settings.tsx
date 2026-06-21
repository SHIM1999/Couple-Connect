import { useState, useEffect, useRef } from "react";
import { useGetProfile, useUpdateProfile, getGetProfileQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { data: profile, isLoading } = useGetProfile();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const updateProfile = useUpdateProfile();

  const [title, setTitle] = useState("");
  const [partner1, setPartner1] = useState("");
  const [partner2, setPartner2] = useState("");
  const [anniversary, setAnniversary] = useState("");

  const initializedForId = useRef<number | null>(null);

  useEffect(() => {
    if (profile && initializedForId.current !== profile.id) {
      initializedForId.current = profile.id;
      setTitle(profile.coupleTitle || "");
      setPartner1(profile.partner1Name || "");
      setPartner2(profile.partner2Name || "");
      setAnniversary(profile.anniversaryDate || "");
    }
  }, [profile]);

  const handleSave = () => {
    if (!profile) return;
    
    updateProfile.mutate(
      { 
        data: { 
          coupleTitle: title,
          partner1Name: partner1,
          partner2Name: partner2,
          anniversaryDate: anniversary || undefined
        } 
      },
      {
        onSuccess: (updatedProfile) => {
          queryClient.setQueryData(getGetProfileQueryKey(), updatedProfile);
          toast({ title: "Game saved!" });
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <h1 className="font-pixel text-xl text-[#FF7043] mb-8">OPTIONS</h1>
        <Skeleton className="h-64 w-full rounded pixel-card" />
      </div>
    );
  }

  return (
    <div className="p-6 pb-24">
      <h1 className="font-pixel text-xl text-[#FF7043] drop-shadow-md mb-8">OPTIONS</h1>

      <div className="pixel-card p-6 space-y-6">
        <div className="space-y-3">
          <label className="font-pixel text-[9px] text-[#FF7043]">SPACE TITLE</label>
          <Input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="e.g. Our Little Corner"
            className="font-sans font-medium text-sm pixel-border"
          />
        </div>

        <div className="space-y-4 pt-4 border-t-2 border-dashed border-[#6D3B2E]">
          <div className="space-y-3">
            <label className="font-pixel text-[9px] text-[#FF6B81]">PLAYER 1 NAME</label>
            <Input 
              value={partner1} 
              onChange={(e) => setPartner1(e.target.value)} 
              placeholder="Name"
              className="font-sans font-medium text-sm pixel-border"
            />
          </div>
          
          <div className="space-y-3">
            <label className="font-pixel text-[9px] text-[#4CAF78]">PLAYER 2 NAME</label>
            <Input 
              value={partner2} 
              onChange={(e) => setPartner2(e.target.value)} 
              placeholder="Name"
              className="font-sans font-medium text-sm pixel-border"
            />
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t-2 border-dashed border-[#6D3B2E]">
          <label className="font-pixel text-[9px] text-[#FFAB91]">ANNIVERSARY DATE</label>
          <Input 
            type="date"
            value={anniversary ? new Date(anniversary).toISOString().split('T')[0] : ""} 
            onChange={(e) => setAnniversary(e.target.value)} 
            className="font-sans font-medium text-sm pixel-border"
          />
        </div>

        <div className="pt-6">
          <Button 
            className="w-full pixel-btn h-14" 
            onClick={handleSave}
            disabled={updateProfile.isPending}
          >
            {updateProfile.isPending ? "SAVING..." : "SAVE PROGRESS"}
          </Button>
        </div>
      </div>
    </div>
  );
}
