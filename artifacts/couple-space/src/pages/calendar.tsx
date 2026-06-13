import { useState, useMemo } from "react";
import { useListEvents, useCreateEvent, useDeleteEvent, getListEventsQueryKey, getGetSummaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, CalendarDays, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CalendarPage() {
  const currentDate = new Date();
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());

  const { data: events, isLoading } = useListEvents({ month: currentMonth, year: currentYear });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const createEvent = useCreateEvent();
  const deleteEvent = useDeleteEvent();

  const [isOpen, setIsOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newNote, setNewNote] = useState("");

  const handleDelete = (id: number) => {
    deleteEvent.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListEventsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetSummaryQueryKey() });
          toast({ title: "Event removed" });
        }
      }
    );
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDate) return;

    createEvent.mutate(
      { data: { title: newTitle, date: newDate, note: newNote } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListEventsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetSummaryQueryKey() });
          setIsOpen(false);
          setNewTitle("");
          setNewDate("");
          setNewNote("");
          toast({ title: "Event added to calendar" });
        }
      }
    );
  };

  // Group events by date
  const eventsByDate = useMemo(() => {
    if (!events) return {};
    return events.reduce((acc, event) => {
      const dateKey = event.date.split('T')[0];
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(event);
      return acc;
    }, {} as Record<string, typeof events>);
  }, [events]);

  // Sort dates
  const sortedDates = Object.keys(eventsByDate).sort();

  return (
    <div className="p-6 pb-24">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-serif text-primary">Calendar</h1>
          <p className="text-muted-foreground mt-1 capitalize font-medium tracking-wide text-sm">
            {new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="icon" className="rounded-full h-12 w-12 shadow-lg hover-elevate shrink-0">
              <Plus className="w-5 h-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-3xl">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl text-primary">Add an Event</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 mt-4">
              <div>
                <Input 
                  placeholder="What's happening?" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="bg-secondary/50 border-transparent rounded-xl"
                  autoFocus
                />
              </div>
              <div>
                <Input 
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="bg-secondary/50 border-transparent rounded-xl"
                  required
                />
              </div>
              <div>
                <Input 
                  placeholder="Details? (optional)" 
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="bg-secondary/50 border-transparent rounded-xl"
                />
              </div>
              <Button type="submit" className="w-full rounded-xl" disabled={!newTitle.trim() || !newDate || createEvent.isPending}>
                {createEvent.isPending ? "Adding..." : "Add Event"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
        <Button 
          variant="outline" 
          className="rounded-full bg-secondary/30 border-transparent"
          onClick={() => {
            if (currentMonth === 1) {
              setCurrentMonth(12);
              setCurrentYear(y => y - 1);
            } else {
              setCurrentMonth(m => m - 1);
            }
          }}
        >
          Previous
        </Button>
        <Button 
          variant="outline" 
          className="rounded-full bg-secondary/30 border-transparent"
          onClick={() => {
            if (currentMonth === 12) {
              setCurrentMonth(1);
              setCurrentYear(y => y + 1);
            } else {
              setCurrentMonth(m => m + 1);
            }
          }}
        >
          Next Month
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      ) : sortedDates.length === 0 ? (
        <div className="text-center py-12">
          <CalendarDays className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">No events this month.</p>
          <p className="text-sm text-muted-foreground mt-1">Plan a date night!</p>
        </div>
      ) : (
        <div className="space-y-8 animate-stagger">
          {sortedDates.map((date) => {
            const dateObj = new Date(date);
            // Ensure local timezone parsing doesn't shift the date if it's YYYY-MM-DD
            const localDate = new Date(dateObj.getTime() + dateObj.getTimezoneOffset() * 60000);
            
            return (
              <div key={date} className="relative pl-12">
                <div className="absolute left-0 top-1 w-10 text-center">
                  <span className="block text-xs font-bold text-primary uppercase">{localDate.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                  <span className="block text-xl font-serif text-foreground">{localDate.getDate()}</span>
                </div>
                
                <div className="space-y-3">
                  {eventsByDate[date].map(event => (
                    <Card key={event.id} className="border-transparent bg-secondary/40 shadow-none">
                      <CardContent className="p-4 flex gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {event.isAnniversary && <Star className="w-4 h-4 text-accent-foreground fill-current" />}
                            <h3 className="font-medium text-foreground">{event.title}</h3>
                          </div>
                          {event.note && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{event.note}</p>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(event.id)}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mr-2 -mt-2 shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
