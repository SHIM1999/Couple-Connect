import { useState } from "react";
import { useListGoals, useCreateGoal, useUpdateGoal, useDeleteGoal, getListGoalsQueryKey, getGetSummaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLang } from "@/lib/i18n";
import { ColorPicker, DEFAULT_ITEM_COLOR } from "@/components/ColorPicker";

export default function GoalsPage() {
  const { t } = useLang();
  const { data: goals, isLoading } = useListGoals();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();

  const [isOpen, setIsOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newNote, setNewNote] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newColor, setNewColor] = useState(DEFAULT_ITEM_COLOR);

  const handleToggle = (id: number, completed: boolean) => {
    updateGoal.mutate({ id, data: { completed: !completed } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListGoalsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetSummaryQueryKey() });
        if (!completed) toast({ title: t("goals_achieved") });
      }
    });
  };

  const handleDelete = (id: number) => {
    deleteGoal.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListGoalsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetSummaryQueryKey() });
        toast({ title: t("goals_deleted") });
      }
    });
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    createGoal.mutate({ data: { title: newTitle, note: newNote, category: newCategory, color: newColor } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListGoalsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetSummaryQueryKey() });
        setIsOpen(false); setNewTitle(""); setNewNote(""); setNewCategory(""); setNewColor(DEFAULT_ITEM_COLOR);
        toast({ title: t("goals_set") });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <h1 className="font-pixel text-xl text-[#FF7043] mb-8">{t("goals_title")}</h1>
        <Skeleton className="h-28 w-full rounded pixel-card" />
        <Skeleton className="h-28 w-full rounded pixel-card" />
      </div>
    );
  }

  return (
    <div className="p-6 pb-24">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-pixel text-xl text-[#FF7043] drop-shadow-md">{t("goals_title")}</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="icon" className="pixel-btn w-12 h-12 rounded-full bg-[#FFAB91]" style={{ color: "#4A2518" }}>
              <Plus className="w-6 h-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md pixel-card p-6 border-4">
            <DialogHeader>
              <DialogTitle className="font-pixel text-sm text-foreground mb-4">{t("goals_new")}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <Input placeholder={t("goals_ph")} value={newTitle} onChange={e => setNewTitle(e.target.value)} className="pixel-border font-sans font-medium text-sm" autoFocus />
              <Input placeholder={t("goals_category_ph")} value={newCategory} onChange={e => setNewCategory(e.target.value)} className="pixel-border font-sans text-sm" />
              <Input placeholder={t("goals_details_ph")} value={newNote} onChange={e => setNewNote(e.target.value)} className="pixel-border font-sans text-sm" />
              <ColorPicker value={newColor} onChange={setNewColor} label={t("color_label") as string} />
              <Button type="submit" className="w-full pixel-btn h-12 text-xs" disabled={!newTitle.trim() || createGoal.isPending}>
                {createGoal.isPending ? t("goals_saving") : t("goals_commit")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!goals || goals.length === 0 ? (
        <div className="text-center py-16 pixel-card border-dashed">
          <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="font-pixel text-[9px] text-muted-foreground leading-loose whitespace-pre-line">{t("goals_empty")}</p>
        </div>
      ) : (
        <div className="space-y-6 animate-stagger">
          {goals.map(goal => (
            <div key={goal.id} className={`pixel-card p-5 relative overflow-hidden transition-all duration-300 ${goal.completed ? 'opacity-70' : ''}`} style={{ backgroundColor: goal.color ?? undefined }}>
              <div className="relative z-10 flex gap-4">
                <button onClick={() => handleToggle(goal.id, goal.completed)}
                  className={`w-10 h-10 shrink-0 rounded pixel-border flex items-center justify-center transition-colors ${goal.completed ? 'bg-[#FFAB91] text-[#4A2518]' : 'bg-card-foreground text-card hover:bg-[#FF7043] hover:text-[#FFF8F0]'}`}>
                  <Trophy className="w-5 h-5" />
                </button>
                <div className="flex-1 min-w-0">
                  {goal.category && (
                    <span className="inline-block px-2 py-1 bg-card-foreground text-card font-pixel text-[6px] rounded-sm pixel-border mb-3">{goal.category}</span>
                  )}
                  <h3 className={`font-sans font-bold text-lg tracking-wide leading-tight ${goal.completed ? 'text-card-foreground line-through' : 'text-card-foreground'}`}>{goal.title}</h3>
                  {goal.note && <p className={`text-sm font-medium mt-1 line-clamp-2 ${goal.completed ? 'text-muted-foreground/80' : 'text-muted-foreground'}`}>{goal.note}</p>}
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(goal.id)}
                  className={`${goal.completed ? 'text-[#1A1035] hover:bg-[#1A1035]/20' : 'text-muted-foreground hover:bg-destructive/10 hover:text-destructive'} shrink-0 h-8 w-8`}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
