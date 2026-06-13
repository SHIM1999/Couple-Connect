import { useState } from "react";
import { useListBucketList, useCreateBucketItem, useUpdateBucketItem, useDeleteBucketItem, getListBucketListQueryKey, getGetSummaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, MapPin, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function BucketlistPage() {
  const { data: items, isLoading } = useListBucketList();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const createItem = useCreateBucketItem();
  const updateItem = useUpdateBucketItem();
  const deleteItem = useDeleteBucketItem();

  const [isOpen, setIsOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newNote, setNewNote] = useState("");

  const handleToggle = (id: number, completed: boolean) => {
    updateItem.mutate(
      { id, data: { completed: !completed } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListBucketListQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetSummaryQueryKey() });
          if (!completed) {
            toast({ title: "Adventure completed! 🏔️" });
          }
        }
      }
    );
  };

  const handleDelete = (id: number) => {
    deleteItem.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListBucketListQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetSummaryQueryKey() });
          toast({ title: "Item deleted" });
        }
      }
    );
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    createItem.mutate(
      { data: { title: newTitle, note: newNote } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListBucketListQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetSummaryQueryKey() });
          setIsOpen(false);
          setNewTitle("");
          setNewNote("");
          toast({ title: "Added to bucket list" });
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <h1 className="text-3xl font-serif text-primary mb-6">Bucket List</h1>
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="p-6 pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-serif text-primary">Bucket List</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="icon" className="rounded-full h-12 w-12 shadow-lg hover-elevate">
              <Plus className="w-5 h-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-3xl">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl text-primary">Add an Adventure</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 mt-4">
              <div>
                <Input 
                  placeholder="Where to? What to do?" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="bg-secondary/50 border-transparent rounded-xl"
                  autoFocus
                />
              </div>
              <div>
                <Input 
                  placeholder="Extra details? (optional)" 
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="bg-secondary/50 border-transparent rounded-xl"
                />
              </div>
              <Button type="submit" className="w-full rounded-xl" disabled={!newTitle.trim() || createItem.isPending}>
                {createItem.isPending ? "Adding..." : "Add to List"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!items || items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground font-medium">No bucket list items yet.</p>
          <p className="text-sm text-muted-foreground mt-1">Dream big together.</p>
        </div>
      ) : (
        <div className="space-y-4 animate-stagger">
          {items.map((item) => (
            <Card key={item.id} className={`border-transparent transition-all duration-500 overflow-hidden ${item.completed ? 'bg-secondary/20 scale-[0.98] opacity-80' : 'bg-secondary/50'}`}>
              <CardContent className="p-5 flex gap-4">
                <button 
                  onClick={() => handleToggle(item.id, item.completed)}
                  className={`mt-1 shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${item.completed ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-primary/20 hover:text-primary'}`}
                >
                  {item.completed ? <CheckCircle2 className="w-5 h-5" /> : <MapPin className="w-4 h-4" />}
                </button>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-serif text-lg leading-tight transition-all ${item.completed ? 'text-muted-foreground' : 'text-foreground'}`}>
                    {item.title}
                  </h3>
                  {item.note && (
                    <p className={`text-sm mt-1 line-clamp-2 ${item.completed ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}>
                      {item.note}
                    </p>
                  )}
                  {item.targetDate && (
                    <p className="text-xs text-muted-foreground/70 mt-3">Target: {new Date(item.targetDate).toLocaleDateString()}</p>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDelete(item.id)}
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
