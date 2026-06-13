import { useState } from "react";
import { useListGoals, useCreateGoal, useUpdateGoal, useDeleteGoal, getListGoalsQueryKey, getGetSummaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, Target, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function GoalsPage() {
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

  const handleToggle = (id: number, completed: boolean) => {
    updateGoal.mutate(
      { id, data: { completed: !completed } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListGoalsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetSummaryQueryKey() });
          if (!completed) {
            toast({ title: "Goal achieved! 🎉" });
          }
        }
      }
    );
  };

  const handleDelete = (id: number) => {
    deleteGoal.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListGoalsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetSummaryQueryKey() });
          toast({ title: "Goal deleted" });
        }
      }
    );
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    createGoal.mutate(
      { data: { title: newTitle, note: newNote, category: newCategory } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListGoalsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetSummaryQueryKey() });
          setIsOpen(false);
          setNewTitle("");
          setNewNote("");
          setNewCategory("");
          toast({ title: "Goal added" });
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <h1 className="text-3xl font-serif text-primary mb-6">Our Goals</h1>
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="p-6 pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-serif text-primary">Our Goals</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="icon" className="rounded-full h-12 w-12 shadow-lg hover-elevate">
              <Plus className="w-5 h-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-3xl">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl text-primary">Add a Shared Goal</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 mt-4">
              <div>
                <Input 
                  placeholder="What's our new goal?" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="bg-secondary/50 border-transparent rounded-xl"
                  autoFocus
                />
              </div>
              <div>
                <Input 
                  placeholder="Category (e.g., Financial, Travel)" 
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="bg-secondary/50 border-transparent rounded-xl"
                />
              </div>
              <div>
                <Input 
                  placeholder="Extra notes? (optional)" 
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="bg-secondary/50 border-transparent rounded-xl"
                />
              </div>
              <Button type="submit" className="w-full rounded-xl" disabled={!newTitle.trim() || createGoal.isPending}>
                {createGoal.isPending ? "Adding..." : "Add Goal"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!goals || goals.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground font-medium">No shared goals yet.</p>
          <p className="text-sm text-muted-foreground mt-1">Dream something up together.</p>
        </div>
      ) : (
        <div className="space-y-4 animate-stagger">
          {goals.map((goal) => (
            <Card key={goal.id} className={`border-transparent transition-all duration-500 overflow-hidden ${goal.completed ? 'bg-secondary/20 scale-[0.98] opacity-80' : 'bg-secondary/50'}`}>
              <CardContent className="p-5 flex gap-4">
                <button 
                  onClick={() => handleToggle(goal.id, goal.completed)}
                  className={`mt-1 shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${goal.completed ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-primary/20 hover:text-primary'}`}
                >
                  {goal.completed ? <CheckCircle2 className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                </button>
                <div className="flex-1 min-w-0">
                  {goal.category && (
                    <span className="inline-block px-2 py-0.5 rounded-full bg-background text-[10px] font-medium text-primary uppercase tracking-wider mb-2">
                      {goal.category}
                    </span>
                  )}
                  <h3 className={`font-serif text-lg leading-tight transition-all ${goal.completed ? 'text-muted-foreground' : 'text-foreground'}`}>
                    {goal.title}
                  </h3>
                  {goal.note && (
                    <p className={`text-sm mt-1 line-clamp-2 ${goal.completed ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}>
                      {goal.note}
                    </p>
                  )}
                  {goal.targetDate && (
                    <p className="text-xs text-muted-foreground/70 mt-3">Target: {new Date(goal.targetDate).toLocaleDateString()}</p>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDelete(goal.id)}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
