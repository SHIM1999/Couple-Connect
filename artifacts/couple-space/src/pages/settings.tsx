import { useState, useEffect, useRef } from "react";
import { useGetProfile, useUpdateProfile, getGetProfileQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useLang, type Lang } from "@/lib/i18n";

export default function SettingsPage() {
  const { data: profile, isLoading } = useGetProfile();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const updateProfile = useUpdateProfile();
  const { lang, setLang, t } = useLang();

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
          anniversaryDate: anniversary || undefined,
        }
      },
      {
        onSuccess: (updatedProfile) => {
          queryClient.setQueryData(getGetProfileQueryKey(), updatedProfile);
          toast({ title: t("settings_saved") });
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <h1 className="font-pixel text-xl text-[#FF7043] mb-8">{t("settings_title")}</h1>
        <Skeleton className="h-64 w-full rounded pixel-card" />
      </div>
    );
  }

  const langOptions: { value: Lang; label: string; sublabel: string }[] = [
    { value: "en", label: "ENG", sublabel: "English" },
    { value: "ko", label: "한국어", sublabel: "Korean" },
  ];

  return (
    <div className="p-6 pb-24">
      <h1 className="font-pixel text-xl text-[#FF7043] drop-shadow-md mb-8">{t("settings_title")}</h1>

      {/* LANGUAGE */}
      <div className="pixel-card p-5 mb-5 space-y-3">
        <label className="font-pixel text-[9px] text-[#FF7043] block">{t("settings_language")}</label>
        <div className="flex gap-3">
          {langOptions.map(({ value, label, sublabel }) => (
            <button
              key={value}
              onClick={() => setLang(value)}
              className={`flex-1 py-3 px-4 rounded pixel-border font-pixel text-[10px] transition-all active:scale-95
                ${lang === value
                  ? "bg-[#FF7043] text-[#fde8e0] shadow-[3px_3px_0_#a8462a]"
                  : "bg-card text-card-foreground shadow-[3px_3px_0_rgba(0,0,0,0.15)] hover:brightness-95"
                }`}
            >
              <div>{label}</div>
              <div className={`text-[7px] mt-1 font-sans ${lang === value ? "text-[#fde8e0]/80" : "text-muted-foreground"}`}>{sublabel}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="pixel-card p-6 space-y-6">
        <div className="space-y-3">
          <label className="font-pixel text-[9px] text-[#FF7043]">{t("settings_space_title")}</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("settings_space_title_ph")}
            className="font-sans font-medium text-sm pixel-border"
          />
        </div>

        <div className="space-y-4 pt-4 border-t-2 border-dashed border-border">
          <div className="space-y-3">
            <label className="font-pixel text-[9px] text-[#FF6B81]">{t("settings_player1")}</label>
            <Input
              value={partner1}
              onChange={(e) => setPartner1(e.target.value)}
              placeholder={t("settings_name_ph")}
              className="font-sans font-medium text-sm pixel-border"
            />
          </div>
          <div className="space-y-3">
            <label className="font-pixel text-[9px] text-[#4CAF78]">{t("settings_player2")}</label>
            <Input
              value={partner2}
              onChange={(e) => setPartner2(e.target.value)}
              placeholder={t("settings_name_ph")}
              className="font-sans font-medium text-sm pixel-border"
            />
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t-2 border-dashed border-border">
          <label className="font-pixel text-[9px] text-[#FFAB91]">{t("settings_anniversary")}</label>
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
            {updateProfile.isPending ? t("settings_saving") : t("settings_save")}
          </Button>
        </div>
      </div>
    </div>
  );
}
