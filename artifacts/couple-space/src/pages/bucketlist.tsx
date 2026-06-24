import { useState } from "react";
import { useListBucketList, useCreateBucketItem, useUpdateBucketItem, useDeleteBucketItem, getListBucketListQueryKey, getGetSummaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLang } from "@/lib/i18n";
import { ColorPicker, DEFAULT_ITEM_COLOR } from "@/components/ColorPicker";

export default function BucketlistPage() {
  const { t } = useLang();
  const { data: items, isLoading } = useListBucketList();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createItem = useCreateBucketItem();
  const updateItem = useUpdateBucketItem();
  const deleteItem = useDeleteBucketItem();

  const [isOpen, setIsOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newNote, setNewNote] = useState("");
  const [newColor, setNewColor] = useState(DEFAULT_ITEM_COLOR);

  const handleToggle = (id: number, completed: boolean) => {
    updateItem.mutate({ id, data: { completed: !completed } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListBucketListQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetSummaryQueryKey() });
        if (!completed) toast({ title: t("bucket_unlocked") });
      }
    });
  };

  const handleDelete = (id: number) => {
    deleteItem.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListBucketListQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetSummaryQueryKey() });
        toast({ title: t("bucket_deleted") });
      }
    });
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    createItem.mutate({ data: { title: newTitle, note: newNote, color: newColor } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListBucketListQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetSummaryQueryKey() });
        setIsOpen(false); setNewTitle(""); setNewNote(""); setNewColor(DEFAULT_ITEM_COLOR);
        toast({ title: t("bucket_added") });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <h1 className="font-pixel text-xl text-[#4CAF78] mb-8">{t("bucket_title")}</h1>
        <Skeleton className="h-24 w-full rounded pixel-card" />
        <Skeleton className="h-24 w-full rounded pixel-card" />
      </div>
    );
  }

  return (
    <div className="p-6 pb-24">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-pixel text-xl text-[#4CAF78] drop-shadow-md">{t("bucket_title")}</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="icon" className="pixel-btn w-12 h-12 rounded-full bg-[#4CAF78]">
              <Plus className="w-6 h-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md pixel-card p-6 border-4">
            <DialogHeader>
              <DialogTitle className="font-pixel text-sm text-foreground mb-4">{t("bucket_new")}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <Input placeholder={t("bucket_where_ph")} value={newTitle} onChange={e => setNewTitle(e.target.value)} className="pixel-border font-sans font-medium text-sm" autoFocus />
              <Input placeholder={t("bucket_details_ph")} value={newNote} onChange={e => setNewNote(e.target.value)} className="pixel-border font-sans text-sm" />
              <ColorPicker value={newColor} onChange={setNewColor} label={t("color_label") as string} />
              <Button type="submit" className="w-full pixel-btn h-12 text-xs bg-[#4CAF78]" disabled={!newTitle.trim() || createItem.isPending}>
                {createItem.isPending ? t("bucket_saving") : t("bucket_save")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!items || items.length === 0 ? (
        <div className="text-center py-16 pixel-card border-dashed">
          <p className="font-pixel text-[9px] text-muted-foreground leading-loose whitespace-pre-line">{t("bucket_empty")}</p>
        </div>
      ) : (
        <div className="space-y-4 animate-stagger">
          {items.map(item => (
            <div key={item.id} className={`pixel-card p-4 flex gap-4 transition-all duration-300 ${item.completed ? 'opacity-70' : ''}`} style={{ backgroundColor: item.color ?? undefined }}>
              <button onClick={() => handleToggle(item.id, item.completed)}
                className={`w-12 h-12 shrink-0 rounded pixel-border flex items-center justify-center transition-colors ${item.completed ? 'bg-[#FFF8F0] text-[#4CAF78]' : 'bg-card-foreground text-card hover:bg-[#4CAF78] hover:text-[#FFF8F0]'}`}>
                <MapPin className="w-6 h-6" />
              </button>
              <div className="flex-1 min-w-0">
                <h3 className={`font-sans font-bold text-sm tracking-wide ${item.completed ? 'text-[#1A1035] line-through' : 'text-card-foreground'}`}>{item.title}</h3>
                {item.note && <p className={`text-xs font-medium mt-1 ${item.completed ? 'text-[#1A1035]/80' : 'text-muted-foreground'}`}>{item.note}</p>}
                {item.targetDate && <p className="font-pixel text-[6px] mt-3 opacity-80">TARGET: {new Date(item.targetDate).toLocaleDateString()}</p>}
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}
                className={`${item.completed ? 'text-[#1A1035] hover:bg-[#1A1035]/20' : 'text-muted-foreground hover:bg-destructive/10 hover:text-destructive'} shrink-0 h-8 w-8`}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
