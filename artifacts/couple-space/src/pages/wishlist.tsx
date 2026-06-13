import { useState } from "react";
import { useListWishlist, useCreateWishItem, useUpdateWishItem, useDeleteWishItem, getListWishlistQueryKey, getGetSummaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, ExternalLink, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function WishlistPage() {
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

  const handleToggle = (id: number, purchased: boolean | undefined) => {
    updateItem.mutate(
      { id, data: { purchased: !purchased } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListWishlistQueryKey() });
          if (!purchased) {
            toast({ title: "Marked as purchased 🎁" });
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
          queryClient.invalidateQueries({ queryKey: getListWishlistQueryKey() });
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
      { data: { title: newTitle, note: newNote, link: newLink } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListWishlistQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetSummaryQueryKey() });
          setIsOpen(false);
          setNewTitle("");
          setNewNote("");
          setNewLink("");
          toast({ title: "Added to wishlist" });
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <h1 className="text-3xl font-serif text-primary mb-6">Wishlist</h1>
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="p-6 pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-serif text-primary">Wishlist</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="icon" className="rounded-full h-12 w-12 shadow-lg hover-elevate">
              <Plus className="w-5 h-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-3xl">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl text-primary">Add a Wish</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 mt-4">
              <div>
                <Input 
                  placeholder="What would you like?" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="bg-secondary/50 border-transparent rounded-xl"
                  autoFocus
                />
              </div>
              <div>
                <Input 
                  placeholder="Link (optional)" 
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
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
              <Button type="submit" className="w-full rounded-xl" disabled={!newTitle.trim() || createItem.isPending}>
                {createItem.isPending ? "Adding..." : "Add to Wishlist"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!items || items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground font-medium">Your wishlist is empty.</p>
          <p className="text-sm text-muted-foreground mt-1">Start adding things you both want.</p>
        </div>
      ) : (
        <div className="space-y-4 animate-stagger">
          {items.map((item) => (
            <Card key={item.id} className={`border-transparent transition-all duration-300 ${item.purchased ? 'bg-secondary/20' : 'bg-secondary/50'}`}>
              <CardContent className="p-5 flex gap-4">
                <button 
                  onClick={() => handleToggle(item.id, item.purchased)}
                  className={`mt-1 shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${item.purchased ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-primary/20 hover:text-primary'}`}
                >
                  <Gift className="w-4 h-4" />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`font-medium ${item.purchased ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                      {item.title}
                    </h3>
                    {item.link && (
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 shrink-0">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  {item.note && (
                    <p className={`text-sm mt-1 line-clamp-2 ${item.purchased ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}>
                      {item.note}
                    </p>
                  )}
                  {item.addedBy && (
                    <p className="text-[10px] text-muted-foreground/70 mt-2">Added by {item.addedBy}</p>
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
