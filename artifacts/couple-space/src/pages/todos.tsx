import { useState } from "react";
import { useListTodos, useCreateTodo, useUpdateTodo, useDeleteTodo, getListTodosQueryKey, getGetSummaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
          toast({ title: "To-Do deleted" });
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
          toast({ title: "To-Do added" });
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <h1 className="text-3xl font-serif text-primary mb-6">To-Dos</h1>
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-16 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="p-6 pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-serif text-primary">To-Dos</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="icon" className="rounded-full h-12 w-12 shadow-lg hover-elevate">
              <Plus className="w-5 h-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-3xl">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl text-primary">Add New To-Do</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 mt-4">
              <div>
                <Input 
                  placeholder="What needs to be done?" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="bg-secondary/50 border-transparent rounded-xl"
                  autoFocus
                />
              </div>
              <div>
                <Input 
                  placeholder="Any extra notes? (optional)" 
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="bg-secondary/50 border-transparent rounded-xl"
                />
              </div>
              <Button type="submit" className="w-full rounded-xl" disabled={!newTitle.trim() || createTodo.isPending}>
                {createTodo.isPending ? "Adding..." : "Add To-Do"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!todos || todos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground font-medium">No to-dos yet.</p>
          <p className="text-sm text-muted-foreground mt-1">Tap the plus button to add one.</p>
        </div>
      ) : (
        <div className="space-y-3 animate-stagger">
          {todos.map((todo) => (
            <Card key={todo.id} className={`border-transparent transition-all duration-300 ${todo.completed ? 'bg-secondary/20' : 'bg-secondary/50'}`}>
              <CardContent className="p-4 flex items-center gap-4">
                <Checkbox 
                  checked={todo.completed} 
                  onCheckedChange={() => handleToggle(todo.id, todo.completed)}
                  className="rounded-full w-6 h-6 border-primary/50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                />
                <div className="flex-1 min-w-0">
                  <p className={`font-medium transition-all ${todo.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                    {todo.title}
                  </p>
                  {todo.note && (
                    <p className={`text-sm mt-0.5 line-clamp-1 ${todo.completed ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}>
                      {todo.note}
                    </p>
                  )}
                  {todo.addedBy && (
                    <p className="text-[10px] text-muted-foreground/70 mt-1">Added by {todo.addedBy}</p>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDelete(todo.id)}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mr-2"
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
