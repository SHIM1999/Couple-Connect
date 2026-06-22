import { useState, useMemo } from "react";
import {
  useListEvents, useCreateEvent, useDeleteEvent, getListEventsQueryKey, getGetSummaryQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, CalendarDays } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLang } from "@/lib/i18n";

export default function CalendarPage() {
  const { t } = useLang();

  const currentDate = new Date();
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());

  const { data: events, isLoading: eventsLoading } = useListEvents({ month: currentMonth, year: currentYear });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createEvent = useCreateEvent();
  const deleteEvent = useDeleteEvent();

  const [eventOpen, setEventOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newNote, setNewNote] = useState("");

  const handleDeleteEvent = (id: number) => {
    deleteEvent.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListEventsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetSummaryQueryKey() });
        toast({ title: t("cal_event_removed") });
      }
    });
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDate) return;
    createEvent.mutate({ data: { title: newTitle, date: newDate, note: newNote } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListEventsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetSummaryQueryKey() });
        setEventOpen(false); setNewTitle(""); setNewDate(""); setNewNote("");
        toast({ title: t("cal_event_saved") });
      }
    });
  };

  const eventsByDate = useMemo(() => {
    if (!events) return {};
    return events.reduce((acc, event) => {
      const key = event.date.split('T')[0];
      if (!acc[key]) acc[key] = [];
      acc[key].push(event);
      return acc;
    }, {} as Record<string, typeof events>);
  }, [events]);

  const sortedDates = Object.keys(eventsByDate).sort();

  return (
    <div className="p-6 pb-24">
      <div className="flex items-center justify-between mb-6">
        <p className="font-pixel text-[9px] text-muted-foreground">
          {new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase()}
        </p>
        <Dialog open={eventOpen} onOpenChange={setEventOpen}>
          <DialogTrigger asChild>
            <Button size="icon" className="pixel-btn w-11 h-11 rounded-full bg-[#FF6B81]">
              <Plus className="w-5 h-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md pixel-card p-6 border-4">
            <DialogHeader>
              <DialogTitle className="font-pixel text-sm text-foreground mb-4">{t("cal_new_event")}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <Input placeholder={t("cal_event_name_ph")} value={newTitle} onChange={e => setNewTitle(e.target.value)} className="pixel-border font-sans font-medium text-sm" autoFocus />
              <Input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="pixel-border font-sans text-sm" required />
              <Input placeholder={t("cal_details_ph")} value={newNote} onChange={e => setNewNote(e.target.value)} className="pixel-border font-sans text-sm" />
              <Button type="submit" className="w-full pixel-btn h-12 text-xs" disabled={!newTitle.trim() || !newDate || createEvent.isPending}>
                {createEvent.isPending ? t("cal_saving") : t("cal_save_event")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 mb-8">
        <Button variant="outline" className="flex-1 pixel-btn text-[8px]"
          onClick={() => { if (currentMonth === 1) { setCurrentMonth(12); setCurrentYear(y => y - 1); } else { setCurrentMonth(m => m - 1); } }}>
          &lt; {t("cal_prev")}
        </Button>
        <Button variant="outline" className="flex-1 pixel-btn text-[8px]"
          onClick={() => { if (currentMonth === 12) { setCurrentMonth(1); setCurrentYear(y => y + 1); } else { setCurrentMonth(m => m + 1); } }}>
          {t("cal_next")} &gt;
        </Button>
      </div>

      {eventsLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-24 w-full rounded pixel-card" />
          <Skeleton className="h-24 w-full rounded pixel-card" />
        </div>
      ) : sortedDates.length === 0 ? (
        <div className="text-center py-16 pixel-card border-dashed">
          <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="font-pixel text-[9px] text-muted-foreground leading-loose whitespace-pre-line">{t("cal_empty")}</p>
        </div>
      ) : (
        <div className="space-y-6 animate-stagger relative">
          <div className="absolute left-6 top-0 bottom-0 w-[4px] bg-border rounded-full z-0" />
          {sortedDates.map(date => {
            const dateObj = new Date(date);
            const local = new Date(dateObj.getTime() + dateObj.getTimezoneOffset() * 60000);
            return (
              <div key={date} className="relative z-10 flex gap-4 items-start">
                <div className="w-12 h-12 pixel-card bg-[#FF7043] border-border text-[#FFF8F0] shrink-0 flex flex-col items-center justify-center rounded">
                  <span className="font-pixel text-[8px]">{local.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}</span>
                  <span className="font-pixel text-lg mt-1">{local.getDate()}</span>
                </div>
                <div className="flex-1 space-y-3 pt-1">
                  {eventsByDate[date].map(event => (
                    <div key={event.id} className="pixel-card p-4 flex gap-3 relative overflow-hidden">
                      {event.isAnniversary && (
                        <div className="absolute top-0 right-0 bg-[#FF6B81] text-[#FFF8F0] px-2 py-1 font-pixel text-[6px] border-b-2 border-l-2 border-border">
                          {t("cal_anniversary_badge")}
                        </div>
                      )}
                      <div className="flex-1 min-w-0 pr-6">
                        <h3 className="font-sans font-bold text-sm tracking-wide text-card-foreground">{event.title}</h3>
                        {event.note && <p className="text-xs font-medium text-muted-foreground mt-1">{event.note}</p>}
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteEvent(event.id)}
                        className="text-muted-foreground hover:text-destructive hover:bg-transparent shrink-0 h-8 w-8 -mr-2">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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
