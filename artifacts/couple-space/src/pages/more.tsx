import { Link } from "wouter";
import { Gift, Map, Settings, Copy, Share2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function MorePage() {
  const { toast } = useToast();
  const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    toast({ title: "Link copied to clipboard! 🎮" });
  };

  return (
    <div className="p-6 pb-24 space-y-6">
      <h1 className="font-pixel text-xl text-[#FF7043] mb-8 drop-shadow-md">MENU</h1>

      <div className="space-y-4">
        <Link href="/wishlist">
          <div className="pixel-card p-4 flex items-center gap-4 cursor-pointer hover:bg-[#FFF8F0]/90 active:translate-y-1 transition-transform">
            <div className="w-12 h-12 rounded bg-[#FF6B81] text-[#FFF8F0] pixel-border flex items-center justify-center shrink-0">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-pixel text-[11px] text-card-foreground">WISHLIST</h3>
              <p className="text-xs font-medium text-muted-foreground mt-1">Gifts & desires</p>
            </div>
          </div>
        </Link>

        <Link href="/bucketlist">
          <div className="pixel-card p-4 flex items-center gap-4 cursor-pointer hover:bg-[#FFF8F0]/90 active:translate-y-1 transition-transform">
            <div className="w-12 h-12 rounded bg-[#4CAF78] text-[#FFF8F0] pixel-border flex items-center justify-center shrink-0">
              <Map className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-pixel text-[11px] text-card-foreground">BUCKET LIST</h3>
              <p className="text-xs font-medium text-muted-foreground mt-1">Shared adventures</p>
            </div>
          </div>
        </Link>

        <Link href="/settings">
          <div className="pixel-card p-4 flex items-center gap-4 cursor-pointer hover:bg-[#FFF8F0]/90 active:translate-y-1 transition-transform">
            <div className="w-12 h-12 rounded bg-[#1A1035] text-[#FFF8F0] pixel-border flex items-center justify-center shrink-0">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-pixel text-[11px] text-card-foreground">SETTINGS</h3>
              <p className="text-xs font-medium text-muted-foreground mt-1">Profile & dates</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="mt-12 pt-8 border-t-[3px] border-dashed border-[#6D3B2E]">
        <div className="flex items-center gap-2 mb-4">
          <Share2 className="w-5 h-5 text-[#FFAB91]" />
          <h2 className="font-pixel text-[10px] text-[#FFF8F0]">INVITE PLAYER 2</h2>
        </div>
        
        <div className="pixel-card p-5 space-y-4 bg-[#1A1035] text-[#FFF8F0] border-[#FF7043]">
          <p className="text-sm font-medium">Share this link to connect your accounts:</p>
          <div className="flex gap-2">
            <Input 
              readOnly 
              value={currentUrl} 
              className="bg-[#FFF8F0] text-[#1A1035] pixel-border font-mono text-xs"
            />
            <Button onClick={handleCopy} className="pixel-btn px-4 shrink-0 bg-[#FF7043] border-[#6D3B2E] text-[#FFF8F0]">
              <Copy className="w-4 h-4 mr-2" /> COPY
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
