import { useState, useEffect, useRef } from "react";
import { useGetProfile, useUpdateProfile, getGetProfileQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Heart, User, CalendarDays } from "lucide-react";

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
          toast({ title: "Settings saved" });
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <h1 className="text-3xl font-serif text-primary mb-6">Settings</h1>
        <Skeleton className="h-[400px] w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="p-6 pb-24">
      <h1 className="text-3xl font-serif text-primary mb-6">Settings</h1>

      <Card className="border-transparent bg-secondary/30">
        <CardHeader>
          <CardTitle className="font-serif text-lg">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Heart className="w-4 h-4" /> Space Title
            </label>
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="e.g. Our Little Corner"
              className="bg-background border-transparent rounded-xl"
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <User className="w-4 h-4" /> Partner 1 Name
              </label>
              <Input 
                value={partner1} 
                onChange={(e) => setPartner1(e.target.value)} 
                placeholder="Name"
                className="bg-background border-transparent rounded-xl"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <User className="w-4 h-4" /> Partner 2 Name
              </label>
              <Input 
                value={partner2} 
                onChange={(e) => setPartner2(e.target.value)} 
                placeholder="Name"
                className="bg-background border-transparent rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CalendarDays className="w-4 h-4" /> Anniversary Date
            </label>
            <Input 
              type="date"
              value={anniversary ? new Date(anniversary).toISOString().split('T')[0] : ""} 
              onChange={(e) => setAnniversary(e.target.value)} 
              className="bg-background border-transparent rounded-xl"
            />
          </div>

          <Button 
            className="w-full rounded-xl" 
            onClick={handleSave}
            disabled={updateProfile.isPending}
          >
            {updateProfile.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
