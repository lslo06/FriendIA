import { useEffect, useState } from "react";
import { Plus, ChevronRight, Loader2, X, Pencil, Save, Maximize2, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  createDiaryEntry,
  deleteDiaryEntry,
  fetchDiaryEntries,
  filterEntries,
  formatEntryDate,
  getTagColor,
  MOOD_OPTIONS,
  updateDiaryEntry,
} from "@/lib/diary";
import type { DiaryEntry } from "@/lib/types";
import { getEmotionIcon } from "@/lib/emotionIcons";

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
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [editingEntry, setEditingEntry] = useState(false);
  const [editText, setEditText] = useState("");
  const [editMood, setEditMood] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
    if (!newMood) {
      toast.error("Selecciona una emoción antes de guardar la entrada");
      return;
    }
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

  function openEntry(entry: DiaryEntry) {
    setSelectedEntry(entry);
    setEditText(entry.text);
    setEditMood(entry.mood ?? "");
    setEditingEntry(false);
    setShowDeleteConfirm(false);
  }

  function closeEntry() {
    if (savingEdit || deleting) return;
    setSelectedEntry(null);
    setEditingEntry(false);
    setShowDeleteConfirm(false);
  }

  async function handleUpdate() {
    if (!editMood) {
      toast.error("Selecciona una emoción antes de guardar los cambios");
      return;
    }
    if (!selectedEntry || !editText.trim() || savingEdit) return;
    setSavingEdit(true);
    try {
      const updated = await updateDiaryEntry(userId, selectedEntry.id, {
        text: editText,
        mood: editMood || undefined,
      });
      setEntries(current => current.map(entry => entry.id === updated.id ? updated : entry));
      setSelectedEntry(updated);
      setEditingEntry(false);
      toast.success("Entrada actualizada");
    } catch (error) {
      console.error("Error actualizando la entrada:", error);
      toast.error("No se pudo actualizar la entrada");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete() {
    if (!selectedEntry || deleting) return;
    setDeleting(true);
    try {
      await deleteDiaryEntry(userId, selectedEntry.id);
      setEntries(current => current.filter(entry => entry.id !== selectedEntry.id));
      setShowDeleteConfirm(false);
      setSelectedEntry(null);
      setEditingEntry(false);
      toast.success("Entrada eliminada");
    } catch (error) {
      console.error("Error eliminando la entrada:", error);
      toast.error("No se pudo eliminar la entrada");
    } finally {
      setDeleting(false);
    }
  }

  const filtered = filterEntries(entries, filter);
  const selectedEntryIcon = getEmotionIcon(selectedEntry?.tag) ?? getEmotionIcon(selectedEntry?.mood);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: "var(--app-bg)" }}>
        <Loader2 size={28} color="#5B88B2" className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-8" style={{ background: "var(--app-bg)" }}>
      {selectedEntry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(4,9,15,0.72)", backdropFilter: "blur(8px)" }}
          onClick={closeEntry}
        >
          <div
            className="relative w-full max-w-3xl max-h-[88vh] flex flex-col rounded-3xl overflow-hidden"
            style={{ background: "var(--app-surface)", border: "1px solid var(--app-border-medium)", boxShadow: "0 24px 80px rgba(0,0,0,.35)" }}
            onClick={event => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Entrada del diario ampliada"
          >
            <div className="flex items-center justify-between gap-4 px-6 py-4" style={{ borderBottom: "1px solid var(--app-border)" }}>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {selectedEntryIcon && <img src={selectedEntryIcon} alt="" className="h-8 w-8 object-contain" />}
                  <h2 style={{ color: "var(--app-text)", fontSize: 18, fontWeight: 700 }}>Entrada del diario</h2>
                </div>
                <p style={{ color: "var(--app-text-muted)", fontSize: 12 }}>{formatEntryDate(selectedEntry.created_at)}</p>
              </div>
              <div className="flex items-center gap-2">
                {!editingEntry && (
                  <>
                    <button
                      onClick={() => setEditingEntry(true)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl"
                      style={{ background: "var(--app-surface-alt)", color: "var(--app-text)", border: "1px solid var(--app-border)" }}
                    >
                      <Pencil size={15} /> Editar
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl"
                      style={{ background: "rgba(226,75,74,.1)", color: "#E24B4A", border: "1px solid rgba(226,75,74,.25)" }}
                    >
                      <Trash2 size={15} /> Borrar
                    </button>
                  </>
                )}
                <button onClick={closeEntry} aria-label="Cerrar entrada" className="p-2 rounded-xl" style={{ background: "none", color: "var(--app-text-muted)", border: 0 }}>
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto p-6">
              {editingEntry ? (
                <>
                  <p className="mb-2" style={{ color: "var(--app-text)", fontSize: 13, fontWeight: 600 }}>¿Cómo te sentías?</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {MOOD_OPTIONS.map(({ emoji, label }) => (
                      <button
                        key={emoji}
                        type="button"
                        title={label}
                        aria-label={label}
                        onClick={() => setEditMood(emoji)}
                        className="p-2 rounded-xl"
                        style={{ background: editMood === emoji ? "rgba(91,136,178,0.2)" : "var(--app-surface-alt)", border: editMood === emoji ? "1px solid #5B88B2" : "1px solid transparent" }}
                      >
                        <img src={getEmotionIcon(label) ?? ""} alt="" className="h-12 w-12 object-contain" style={{ imageRendering: "pixelated" }} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={editText}
                    onChange={event => setEditText(event.target.value)}
                    rows={14}
                    className="w-full rounded-2xl p-4 outline-none resize-y"
                    style={{ minHeight: 280, background: "var(--app-surface-alt)", border: "1px solid var(--app-border-medium)", color: "var(--app-text)", fontSize: "calc(15px * var(--app-font-scale))", lineHeight: 1.75 }}
                    autoFocus
                  />
                </>
              ) : (
                <p style={{ color: "var(--app-text)", fontSize: "calc(16px * var(--app-font-scale))", lineHeight: 1.85, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                  {selectedEntry.text}
                </p>
              )}
            </div>

            {editingEntry && (
              <div className="flex justify-end gap-3 px-6 py-4" style={{ borderTop: "1px solid var(--app-border)" }}>
                <button onClick={() => { setEditingEntry(false); setEditText(selectedEntry.text); setEditMood(selectedEntry.mood ?? ""); }} style={{ background: "none", border: 0, color: "var(--app-text-muted)" }}>
                  Cancelar
                </button>
                <button
                  onClick={() => void handleUpdate()}
                  disabled={savingEdit || !editText.trim() || !editMood}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl"
                  style={{ background: "#5B88B2", color: "#fff", border: 0, opacity: savingEdit || !editText.trim() || !editMood ? .55 : 1, fontWeight: 700 }}
                >
                  {savingEdit ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  Guardar cambios
                </button>
              </div>
            )}

            {showDeleteConfirm && (
              <div
                className="absolute inset-0 z-10 flex items-center justify-center p-4"
                style={{ background: "rgba(4,9,15,.78)", backdropFilter: "blur(6px)" }}
                onClick={() => !deleting && setShowDeleteConfirm(false)}
              >
                <div
                  className="w-full max-w-md rounded-2xl p-6"
                  style={{ background: "var(--app-surface)", border: "1px solid rgba(226,75,74,.35)", boxShadow: "0 18px 60px rgba(0,0,0,.4)" }}
                  onClick={event => event.stopPropagation()}
                  role="alertdialog"
                  aria-modal="true"
                  aria-labelledby="delete-diary-title"
                  aria-describedby="delete-diary-description"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl" style={{ background: "rgba(226,75,74,.12)", color: "#E24B4A" }}>
                      <AlertTriangle size={22} />
                    </div>
                    <div>
                      <h3 id="delete-diary-title" style={{ color: "var(--app-text)", fontSize: 18, fontWeight: 700 }}>
                        ¿Borrar esta entrada?
                      </h3>
                      <p id="delete-diary-description" className="mt-1" style={{ color: "var(--app-text-muted)", fontSize: 14, lineHeight: 1.55 }}>
                        Esta acción es permanente y la nota no se podrá recuperar.
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={deleting}
                      className="px-4 py-2.5 rounded-xl"
                      style={{ background: "var(--app-surface-alt)", color: "var(--app-text)", border: "1px solid var(--app-border)" }}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => void handleDelete()}
                      disabled={deleting}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                      style={{ background: "#E24B4A", color: "#fff", border: 0, opacity: deleting ? .65 : 1, fontWeight: 700 }}
                    >
                      {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                      Borrar definitivamente
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
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
          <div className="flex flex-wrap gap-2 mb-3">
            {MOOD_OPTIONS.map(({ emoji, label }) => (
              <button
                key={emoji}
                type="button"
                title={label}
                aria-label={label}
                onClick={() => setNewMood(emoji)}
                className="text-xl p-2 rounded-xl transition-all"
                style={{ background: newMood === emoji ? "rgba(91,136,178,0.2)" : "var(--app-surface-alt)", border: newMood === emoji ? "1px solid #5B88B2" : "1px solid transparent" }}
              ><img src={getEmotionIcon(label) ?? ""} alt="" className="h-12 w-12 object-contain" style={{ imageRendering: "pixelated" }} /></button>
            ))}
          </div>
          {!newMood && (
            <p style={{ color: "#F5A623", fontSize: "calc(12px * var(--app-font-scale))", marginBottom: 10 }}>
              Selecciona una emoción para poder guardar tu entrada.
            </p>
          )}
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
              disabled={saving || !newText.trim() || !newMood}
              className="px-5 py-2 rounded-xl flex items-center gap-2"
              style={{ background: "#5B88B2", color: "#fff", fontWeight: 600, fontSize: "calc(13px * var(--app-font-scale))", opacity: saving || !newText.trim() || !newMood ? 0.6 : 1 }}
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
                onClick={() => openEntry(entry)}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex items-center gap-2 mb-1">
                    {(getEmotionIcon(entry.tag) ?? getEmotionIcon(entry.mood)) && (
                      <img src={(getEmotionIcon(entry.tag) ?? getEmotionIcon(entry.mood))!} alt="" className="h-8 w-8 object-contain" style={{ imageRendering: "pixelated" }} />
                    )}
                    <span style={{ fontSize: "calc(12px * var(--app-font-scale))", color: "var(--app-text-muted)" }}>{formatEntryDate(entry.created_at)}</span>
                    {entry.tag && (
                      <span className="px-2 py-0.5 rounded-full" style={{ fontSize: "calc(11px * var(--app-font-scale))", background: `${tagColor}22`, color: tagColor, fontWeight: 600 }}>{entry.tag}</span>
                    )}
                  </div>
                  <p style={{ fontSize: "calc(13px * var(--app-font-scale))", color: "var(--app-text-muted)", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{entry.text}</p>
                </div>
                <button
                  onClick={event => {
                    event.stopPropagation();
                    openEntry(entry);
                  }}
                  className="p-2 rounded-xl"
                  style={{ background: "var(--app-surface-alt)", border: "1px solid var(--app-border)", color: "var(--app-text-muted)" }}
                  aria-label="Ver entrada completa"
                  title="Ver en grande"
                >
                  <Maximize2 size={16} />
                </button>
                <ChevronRight size={16} color="var(--app-text-muted)" style={{ flexShrink: 0 }} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
