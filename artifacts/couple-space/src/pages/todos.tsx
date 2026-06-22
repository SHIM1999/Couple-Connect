import { useState } from "react";
import { useListTodos, useCreateTodo, useUpdateTodo, useDeleteTodo, getListTodosQueryKey, getGetSummaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLang } from "@/lib/i18n";

type Tab = "todos" | "questlog";

export default function TodosPage() {
  const { t } = useLang();
  const [tab, setTab] = useState<Tab>("todos");
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
    updateTodo.mutate({ id, data: { completed: !completed } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTodosQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetSummaryQueryKey() });
      }
    });
  };

  const handleDelete = (id: number) => {
    deleteTodo.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTodosQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetSummaryQueryKey() });
        toast({ title: t("todos_deleted") });
      }
    });
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    createTodo.mutate({ data: { title: newTitle, note: newNote } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTodosQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetSummaryQueryKey() });
        setIsOpen(false); setNewTitle(""); setNewNote("");
        toast({ title: t("todos_added") });
      }
    });
  };

  const activeTodos = todos?.filter(t => !t.completed) ?? [];
  const completedTodos = todos?.filter(t => t.completed) ?? [];

  const tabs: { id: Tab; label: string }[] = [
    { id: "todos", label: t("todos_title") },
    { id: "questlog", label: t("cal_quest_log") },
  ];

  return (
    <div className="pb-24">
      {/* Tab Bar */}
      <div className="flex border-b-4 border-border sticky top-0 z-30 bg-background">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 py-4 font-pixel text-[9px] transition-all border-b-4 -mb-[4px]
              ${tab === id
                ? "border-[#FF7043] text-[#FF7043]"
                : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* TODOS TAB */}
      {tab === "todos" && (
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-pixel text-xl text-[#FF7043] drop-shadow-md">{t("todos_title")}</h1>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button size="icon" className="pixel-btn w-12 h-12 rounded-full bg-[#4CAF78]">
                  <Plus className="w-6 h-6" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md pixel-card p-6 border-4">
                <DialogHeader>
                  <DialogTitle className="font-pixel text-sm text-foreground mb-4">{t("todos_new")}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAdd} className="space-y-4">
                  <Input placeholder={t("todos_ph")} value={newTitle} onChange={e => setNewTitle(e.target.value)} className="pixel-border font-sans font-medium text-sm" autoFocus />
                  <Input placeholder={t("todos_details_ph")} value={newNote} onChange={e => setNewNote(e.target.value)} className="pixel-border font-sans text-sm" />
                  <Button type="submit" className="w-full pixel-btn h-12 text-xs" disabled={!newTitle.trim() || createTodo.isPending}>
                    {createTodo.isPending ? t("todos_saving") : t("todos_accept")}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full rounded pixel-card" />
              <Skeleton className="h-20 w-full rounded pixel-card" />
            </div>
          ) : !todos || todos.length === 0 ? (
            <div className="text-center py-16 pixel-card border-dashed">
              <p className="font-pixel text-[10px] text-muted-foreground leading-loose whitespace-pre-line">{t("todos_empty")}</p>
            </div>
          ) : (
            <div className="space-y-4 animate-stagger">
              {todos.map(todo => (
                <div key={todo.id} className={`pixel-card p-4 flex items-start gap-4 transition-all duration-300 ${todo.completed ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                  <div className="pt-1 shrink-0">
                    <input type="checkbox" className="pixel-checkbox cursor-pointer" checked={todo.completed} onChange={() => handleToggle(todo.id, todo.completed)} />
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <p className={`font-sans font-bold text-sm tracking-wide ${todo.completed ? 'line-through text-muted-foreground' : 'text-card-foreground'}`}>{todo.title}</p>
                    {todo.note && <p className={`text-xs mt-1 font-medium ${todo.completed ? 'text-muted-foreground/60 line-through' : 'text-muted-foreground'}`}>{todo.note}</p>}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(todo.id)}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 h-8 w-8">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* QUEST LOG TAB */}
      {tab === "questlog" && (
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <span className="font-pixel text-[9px] text-muted-foreground">{activeTodos.length} {t("nav_todos").toLowerCase()} {t("todos_remaining") ?? "remaining"}</span>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button size="icon" className="pixel-btn w-11 h-11 rounded-full bg-[#4CAF78]">
                  <Plus className="w-5 h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md pixel-card p-6 border-4">
                <DialogHeader>
                  <DialogTitle className="font-pixel text-sm text-foreground mb-4">{t("todos_new")}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAdd} className="space-y-4">
                  <Input placeholder={t("todos_ph")} value={newTitle} onChange={e => setNewTitle(e.target.value)} className="pixel-border font-sans font-medium text-sm" autoFocus />
                  <Input placeholder={t("todos_details_ph")} value={newNote} onChange={e => setNewNote(e.target.value)} className="pixel-border font-sans text-sm" />
                  <Button type="submit" className="w-full pixel-btn h-12 text-xs bg-[#4CAF78]" disabled={!newTitle.trim() || createTodo.isPending}>
                    {createTodo.isPending ? t("todos_saving") : t("todos_accept")}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full rounded pixel-card" />
              <Skeleton className="h-20 w-full rounded pixel-card" />
            </div>
          ) : !todos || todos.length === 0 ? (
            <div className="text-center py-16 pixel-card border-dashed">
              <p className="font-pixel text-[9px] text-muted-foreground leading-loose whitespace-pre-line">{t("todos_empty")}</p>
            </div>
          ) : (
            <div className="space-y-6 animate-stagger">
              {activeTodos.length > 0 && (
                <div className="space-y-3">
                  <p className="font-pixel text-[8px] text-muted-foreground px-1">⚔ ACTIVE</p>
                  {activeTodos.map(todo => (
                    <div key={todo.id} className="pixel-card p-4 flex items-start gap-4">
                      <div className="pt-1 shrink-0">
                        <input type="checkbox" className="pixel-checkbox cursor-pointer" checked={todo.completed} onChange={() => handleToggle(todo.id, todo.completed)} />
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <p className="font-sans font-bold text-sm tracking-wide text-card-foreground">{todo.title}</p>
                        {todo.note && <p className="text-xs mt-1 font-medium text-muted-foreground">{todo.note}</p>}
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(todo.id)}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 h-8 w-8">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              {completedTodos.length > 0 && (
                <div className="space-y-3">
                  <p className="font-pixel text-[8px] text-muted-foreground px-1">✓ COMPLETED</p>
                  {completedTodos.map(todo => (
                    <div key={todo.id} className="pixel-card p-4 flex items-start gap-4 opacity-50">
                      <div className="pt-1 shrink-0">
                        <input type="checkbox" className="pixel-checkbox cursor-pointer" checked={todo.completed} onChange={() => handleToggle(todo.id, todo.completed)} />
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <p className="font-sans font-bold text-sm tracking-wide line-through text-muted-foreground">{todo.title}</p>
                        {todo.note && <p className="text-xs mt-1 font-medium text-muted-foreground/60 line-through">{todo.note}</p>}
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(todo.id)}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 h-8 w-8">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
