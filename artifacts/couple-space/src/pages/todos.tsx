import { useState } from "react";
import { useListTodos, useCreateTodo, useUpdateTodo, useDeleteTodo, getListTodosQueryKey, getGetSummaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function TodosPage() {
  const { data: todos, isLoading } = useListTodos();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();

  const [isOpen, setIsOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newNote, setNewNote] = useState("");

  const handleToggle = (id: number, completed: boolean) => {
    updateTodo.mutate(
      { id, data: { completed: !completed } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListTodosQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetSummaryQueryKey() });
        }
      }
    );
  };

  const handleDelete = (id: number) => {
    deleteTodo.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListTodosQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetSummaryQueryKey() });
          toast({ title: "Quest deleted!" });
        }
      }
    );
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    createTodo.mutate(
      { data: { title: newTitle, note: newNote } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListTodosQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetSummaryQueryKey() });
          setIsOpen(false);
          setNewTitle("");
          setNewNote("");
          toast({ title: "New Quest added!" });
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <h1 className="font-pixel text-xl text-[#FF7043] mb-8">QUEST LOG</h1>
        <Skeleton className="h-20 w-full rounded pixel-card" />
        <Skeleton className="h-20 w-full rounded pixel-card" />
        <Skeleton className="h-20 w-full rounded pixel-card" />
      </div>
    );
  }

  return (
    <div className="p-6 pb-24">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-pixel text-xl text-[#FF7043] drop-shadow-md">QUEST LOG</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="icon" className="pixel-btn w-12 h-12 rounded-full flex items-center justify-center bg-[#4CAF78]">
              <Plus className="w-6 h-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md pixel-card p-6 border-4">
            <DialogHeader>
              <DialogTitle className="font-pixel text-sm text-[#1A1035] mb-4">NEW QUEST</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <Input 
                  placeholder="Quest objective..." 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="pixel-border font-sans font-medium text-sm"
                  autoFocus
                />
              </div>
              <div>
                <Input 
                  placeholder="Details (optional)" 
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="pixel-border font-sans text-sm"
                />
              </div>
              <Button type="submit" className="w-full pixel-btn h-12 text-xs" disabled={!newTitle.trim() || createTodo.isPending}>
                {createTodo.isPending ? "SAVING..." : "ACCEPT QUEST"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!todos || todos.length === 0 ? (
        <div className="text-center py-16 pixel-card border-dashed">
          <p className="font-pixel text-[10px] text-muted-foreground leading-loose">NO ACTIVE QUESTS.<br/>RELAX FOR NOW.</p>
        </div>
      ) : (
        <div className="space-y-4 animate-stagger">
          {todos.map((todo) => (
            <div key={todo.id} className={`pixel-card p-4 flex items-start gap-4 transition-all duration-300 ${todo.completed ? 'opacity-60 grayscale-[0.5]' : ''}`}>
              <div className="pt-1 shrink-0">
                <input 
                  type="checkbox" 
                  className="pixel-checkbox cursor-pointer"
                  checked={todo.completed}
                  onChange={() => handleToggle(todo.id, todo.completed)}
                />
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <p className={`font-sans font-bold text-sm tracking-wide ${todo.completed ? 'line-through text-muted-foreground' : 'text-card-foreground'}`}>
                  {todo.title}
                </p>
                {todo.note && (
                  <p className={`text-xs mt-1 font-medium ${todo.completed ? 'text-muted-foreground/60 line-through' : 'text-muted-foreground'}`}>
                    {todo.note}
                  </p>
                )}
                {todo.addedBy && (
                  <span className="inline-block mt-3 px-2 py-1 bg-[#1A1035] text-[#FFF8F0] font-pixel text-[6px] rounded-sm pixel-border">
                    P1: {todo.addedBy}
                  </span>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleDelete(todo.id)}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 h-8 w-8"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
