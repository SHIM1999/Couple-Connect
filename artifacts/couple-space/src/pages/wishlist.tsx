import { useState } from "react";
import { useListWishlist, useCreateWishItem, useUpdateWishItem, useDeleteWishItem, getListWishlistQueryKey, getGetSummaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, ExternalLink, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLang } from "@/lib/i18n";
import { ColorPicker, DEFAULT_ITEM_COLOR } from "@/components/ColorPicker";

export default function WishlistPage() {
  const { t } = useLang();
  const { data: items, isLoading } = useListWishlist();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createItem = useCreateWishItem();
  const updateItem = useUpdateWishItem();
  const deleteItem = useDeleteWishItem();

  const [isOpen, setIsOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newNote, setNewNote] = useState("");
  const [newLink, setNewLink] = useState("");
  const [newColor, setNewColor] = useState(DEFAULT_ITEM_COLOR);

  const handleToggle = (id: number, purchased: boolean | undefined) => {
    updateItem.mutate({ id, data: { purchased: !purchased } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListWishlistQueryKey() });
        if (!purchased) toast({ title: t("wish_collected") });
      }
    });
  };

  const handleDelete = (id: number) => {
    deleteItem.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListWishlistQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetSummaryQueryKey() });
        toast({ title: t("wish_trashed") });
      }
    });
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    createItem.mutate({ data: { title: newTitle, note: newNote, link: newLink, color: newColor } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListWishlistQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetSummaryQueryKey() });
        setIsOpen(false); setNewTitle(""); setNewNote(""); setNewLink(""); setNewColor(DEFAULT_ITEM_COLOR);
        toast({ title: t("wish_added") });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <h1 className="font-pixel text-xl text-[#FF7043] mb-8">{t("wish_title")}</h1>
        <Skeleton className="h-24 w-full rounded pixel-card" />
        <Skeleton className="h-24 w-full rounded pixel-card" />
      </div>
    );
  }

  return (
    <div className="p-6 pb-24">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-pixel text-xl text-[#FF7043] drop-shadow-md">{t("wish_title")}</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="icon" className="pixel-btn w-12 h-12 rounded-full bg-[#FF6B81]">
              <Plus className="w-6 h-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md pixel-card p-6 border-4">
            <DialogHeader>
              <DialogTitle className="font-pixel text-sm text-foreground mb-4">{t("wish_add")}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <Input placeholder={t("wish_item_ph")} value={newTitle} onChange={e => setNewTitle(e.target.value)} className="pixel-border font-sans font-medium text-sm" autoFocus />
              <Input placeholder={t("wish_link_ph")} value={newLink} onChange={e => setNewLink(e.target.value)} className="pixel-border font-sans text-sm" />
              <Input placeholder={t("wish_details_ph")} value={newNote} onChange={e => setNewNote(e.target.value)} className="pixel-border font-sans text-sm" />
              <ColorPicker value={newColor} onChange={setNewColor} label={t("color_label") as string} />
              <Button type="submit" className="w-full pixel-btn h-12 text-xs bg-[#FF6B81]" disabled={!newTitle.trim() || createItem.isPending}>
                {createItem.isPending ? t("wish_saving") : t("wish_save")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!items || items.length === 0 ? (
        <div className="text-center py-16 pixel-card border-dashed">
          <p className="font-pixel text-[9px] text-muted-foreground leading-loose whitespace-pre-line">{t("wish_empty")}</p>
        </div>
      ) : (
        <div className="space-y-4 animate-stagger">
          {items.map(item => (
            <div key={item.id} className={`pixel-card p-4 flex gap-4 transition-all duration-300 ${item.purchased ? 'opacity-60 grayscale-[0.5]' : ''}`} style={{ backgroundColor: item.color ?? undefined }}>
              <button onClick={() => handleToggle(item.id, item.purchased)}
                className={`w-12 h-12 shrink-0 rounded pixel-border flex items-center justify-center transition-colors ${item.purchased ? 'bg-[#FF7043] text-[#FFF8F0]' : 'bg-card-foreground text-card hover:bg-[#FF7043] hover:text-[#FFF8F0]'}`}>
                <Gift className="w-6 h-6" />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className={`font-sans font-bold text-sm tracking-wide ${item.purchased ? 'line-through text-muted-foreground' : 'text-card-foreground'}`}>{item.title}</h3>
                  {item.link && (
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-[#FF7043] hover:opacity-80 shrink-0">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
                {item.note && <p className={`text-xs font-medium mt-1 ${item.purchased ? 'text-muted-foreground/60' : 'text-muted-foreground'}`}>{item.note}</p>}
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 h-8 w-8">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
