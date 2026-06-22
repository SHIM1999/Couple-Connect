import { Link } from "wouter";
import { Gift, Map, Settings, Copy, Share2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLang } from "@/lib/i18n";
import { getInviteUrl } from "@/lib/coupleCode";

export default function MorePage() {
  const { toast } = useToast();
  const { t } = useLang();
  const inviteUrl = typeof window !== 'undefined' ? getInviteUrl() : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    toast({ title: t("more_copied") });
  };

  return (
    <div className="p-6 pb-24 space-y-6">
      <h1 className="font-pixel text-xl text-primary mb-8 drop-shadow-sm">{t("more_menu")}</h1>

      <div className="space-y-4">
        <Link href="/wishlist">
          <div className="pixel-card p-4 flex items-center gap-4 cursor-pointer hover:brightness-95 active:translate-y-1 transition-transform">
            <div className="w-12 h-12 rounded pixel-border flex items-center justify-center shrink-0"
                 style={{ background: "#F2526A", color: "#fde8e0" }}>
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-pixel text-[11px] text-card-foreground">{t("more_wishlist")}</h3>
              <p className="text-xs font-medium text-muted-foreground mt-1">{t("more_wishlist_sub")}</p>
            </div>
          </div>
        </Link>

        <Link href="/bucketlist">
          <div className="pixel-card p-4 flex items-center gap-4 cursor-pointer hover:brightness-95 active:translate-y-1 transition-transform">
            <div className="w-12 h-12 rounded pixel-border flex items-center justify-center shrink-0"
                 style={{ background: "#4CAF78", color: "#fde8e0" }}>
              <Map className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-pixel text-[11px] text-card-foreground">{t("more_bucket")}</h3>
              <p className="text-xs font-medium text-muted-foreground mt-1">{t("more_bucket_sub")}</p>
            </div>
          </div>
        </Link>

        <Link href="/settings">
          <div className="pixel-card p-4 flex items-center gap-4 cursor-pointer hover:brightness-95 active:translate-y-1 transition-transform">
            <div className="w-12 h-12 rounded pixel-border flex items-center justify-center shrink-0"
                 style={{ background: "#c47b68", color: "#fde8e0" }}>
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-pixel text-[11px] text-card-foreground">{t("more_settings")}</h3>
              <p className="text-xs font-medium text-muted-foreground mt-1">{t("more_settings_sub")}</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="mt-12 pt-8 border-t-[3px] border-dashed border-border">
        <div className="flex items-center gap-2 mb-4">
          <Share2 className="w-5 h-5 text-primary" />
          <h2 className="font-pixel text-[10px] text-foreground">{t("more_invite")}</h2>
        </div>

        <div className="pixel-card p-5 space-y-4">
          <p className="text-sm font-medium text-card-foreground">{t("more_invite_desc")}</p>
          <div className="flex gap-2">
            <Input
              readOnly
              value={inviteUrl}
              className="pixel-border font-mono text-xs"
            />
            <Button onClick={handleCopy} className="pixel-btn px-4 shrink-0">
              <Copy className="w-4 h-4 mr-2" /> {t("more_copy")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
