import { useEffect, useState } from "react";
import { Plus, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  createDiaryEntry,
  fetchDiaryEntries,
  filterEntries,
  formatEntryDate,
  getTagColor,
  MOOD_OPTIONS,
} from "@/lib/diary";
import type { DiaryEntry } from "@/lib/types";

type Filter = "todos" | "semana" | "mes";

interface DiaryProps {
  userId: string;
}

export function Diary({ userId }: DiaryProps) {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<Filter>("todos");
  const [showNew, setShowNew] = useState(false);
  const [newText, setNewText] = useState("");
  const [newMood, setNewMood] = useState("");

  useEffect(() => {
    let active = true;

    fetchDiaryEntries(userId)
      .then(data => {
        if (active) setEntries(data);
      })
      .catch(error => {
        console.error("Error cargando las entradas:", error);
        if (active) toast.error("No se pudieron cargar las entradas");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [userId]);

  async function handleSave() {
    if (!newText.trim()) return;
    setSaving(true);
    try {
      const entry = await createDiaryEntry(userId, {
        text: newText.trim(),
        mood: newMood || undefined,
      });
      setEntries(prev => [entry, ...prev]);
      setNewText("");
      setNewMood("");
      setShowNew(false);
      toast.success("Entrada guardada");
    } catch (error) {
      console.error("Error guardando la entrada:", error);
      toast.error("No se pudo guardar la entrada");
    } finally {
      setSaving(false);
    }
  }

  const filtered = filterEntries(entries, filter);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: "var(--app-bg)" }}>
        <Loader2 size={28} color="#5B88B2" className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-8" style={{ background: "var(--app-bg)" }}>
      <div className="flex items-center justify-between mb-6">
        <h1 style={{ fontSize: "calc(24px * var(--app-font-scale))", fontWeight: 700, color: "var(--app-text)" }}>Mi Diario Emocional</h1>
        <button
          onClick={() => setShowNew(v => !v)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all"
          style={{ background: "#5B88B2", color: "#fff", fontWeight: 600, fontSize: "calc(14px * var(--app-font-scale))" }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "#4a76a0")}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "#5B88B2")}
        ><Plus size={16} /> Nueva entrada</button>
      </div>

      {showNew && (
        <div className="mb-6 p-5 rounded-2xl" style={{ background: "var(--app-surface)", border: "1px solid rgba(91,136,178,0.3)" }}>
          <p style={{ fontSize: "calc(14px * var(--app-font-scale))", fontWeight: 600, color: "var(--app-text)", marginBottom: 10 }}>¿Cómo estuvo tu día?</p>
          <div className="flex gap-2 mb-3">
            {MOOD_OPTIONS.map(({ emoji, label }) => (
              <button
                key={emoji}
                type="button"
                title={label}
                aria-label={label}
                onClick={() => setNewMood(emoji)}
                className="text-xl p-2 rounded-xl transition-all"
                style={{ background: newMood === emoji ? "rgba(91,136,178,0.2)" : "var(--app-surface-alt)", border: newMood === emoji ? "1px solid #5B88B2" : "1px solid transparent" }}
              >{emoji}</button>
            ))}
          </div>
          <textarea
            value={newText}
            onChange={e => setNewText(e.target.value)}
            placeholder="Escribe cómo te sientes, qué pasó hoy..."
            rows={4}
            className="w-full rounded-xl p-4 outline-none resize-none"
            style={{ background: "var(--app-surface-alt)", border: "1px solid var(--app-border-medium)", color: "var(--app-text)", fontSize: "calc(14px * var(--app-font-scale))", lineHeight: 1.6 }}
            onFocus={e => (e.target.style.borderColor = "#5B88B2")}
            onBlur={e => (e.target.style.borderColor = "var(--app-border-medium)")}
          />
          <div className="flex gap-3 mt-3 justify-end">
            <button onClick={() => setShowNew(false)} style={{ fontSize: "calc(13px * var(--app-font-scale))", color: "var(--app-text-muted)", background: "none", border: "none", cursor: "pointer" }}>Cancelar</button>
            <button
              onClick={handleSave}
              disabled={saving || !newText.trim()}
              className="px-5 py-2 rounded-xl flex items-center gap-2"
              style={{ background: "#5B88B2", color: "#fff", fontWeight: 600, fontSize: "calc(13px * var(--app-font-scale))", opacity: saving || !newText.trim() ? 0.6 : 1 }}
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              Guardar entrada
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-0 mb-6" style={{ borderBottom: "1px solid var(--app-border)" }}>
        {(["todos","semana","mes"] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="pb-3 mr-6 transition-all"
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: "calc(14px * var(--app-font-scale))",
              color: filter === f ? "#5B88B2" : "var(--app-text-muted)",
              borderBottom: filter === f ? "2px solid #5B88B2" : "2px solid transparent",
              marginBottom: -1,
              textTransform: "capitalize",
              fontWeight: filter === f ? 600 : 400,
            }}
          >{f === "todos" ? "Todos" : f === "semana" ? "Esta semana" : "Este mes"}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16" style={{ color: "var(--app-text-muted)" }}>
          <p style={{ fontSize: "calc(15px * var(--app-font-scale))", marginBottom: 8 }}>Aún no tienes entradas</p>
          <p style={{ fontSize: "calc(13px * var(--app-font-scale))" }}>Escribe tu primera entrada para comenzar tu diario emocional.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(entry => {
            const tagColor = getTagColor(entry.tag);
            return (
              <div
             
              key={entry.id}
                className="flex items-center gap-4 p-4 rounded-2xl transition-all cursor-pointer"
                style={{ background: "var(--app-surface)", border: "1px solid var(--app-border)" }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(91,136,178,0.25)")}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = "var(--app-border)")}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex items-center gap-2 mb-1">
                    {entry.mood && <span style={{ fontSize: "calc(14px * var(--app-font-scale))" }}>{entry.mood}</span>}
                    <span style={{ fontSize: "calc(12px * var(--app-font-scale))", color: "var(--app-text-muted)" }}>{formatEntryDate(entry.created_at)}</span>
                    {entry.tag && (
                      <span className="px-2 py-0.5 rounded-full" style={{ fontSize: "calc(11px * var(--app-font-scale))", background: `${tagColor}22`, color: tagColor, fontWeight: 600 }}>{entry.tag}</span>
                    )}
                  </div>
                  <p style={{ fontSize: "calc(13px * var(--app-font-scale))", color: "var(--app-text-muted)", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{entry.text}</p>
                </div>
                <ChevronRight size={16} color="var(--app-text-muted)" style={{ flexShrink: 0 }} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
