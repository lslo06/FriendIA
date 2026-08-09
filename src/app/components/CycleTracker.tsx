import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CircleCheck,
  Loader2,
  Plus,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import {
  calculateCycleSummary,
  deleteAllCycleRecords,
  deleteCycleRecord,
  fetchCycleRecords,
  finishCycle,
  startCycle,
} from "@/lib/cycle";
import type { CycleRecord } from "@/lib/types";

interface CycleTrackerProps {
  profileId: string;
  active: boolean;
  canActivate: boolean;
  savingPreference: boolean;
  onActiveChange: (active: boolean) => Promise<void>;
}

const inputStyle = {
  background: "var(--app-surface-alt)",
  border: "1px solid var(--app-border-medium)",
  color: "var(--app-text)",
  fontSize: "calc(14px * var(--app-font-scale))",
};

function localToday() {
  return format(new Date(), "yyyy-MM-dd");
}

function formatDate(value: string) {
  return format(parseISO(value), "d 'de' MMMM 'de' yyyy", { locale: es });
}

function cycleErrorMessage(error: unknown, fallback: string) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" &&
          error !== null &&
          "message" in error &&
          typeof error.message === "string"
        ? error.message
        : "";

  if (message.includes("registros_ciclo")) {
    return "El seguimiento del ciclo aún no está habilitado en la base de datos";
  }

  const userFacingMessages = [
    "La fecha del periodo no es válida",
    "La fecha no puede estar en el futuro",
    "La fecha de fin no puede ser anterior al inicio",
    "Primero registra el fin del periodo que está en curso",
    "El nuevo periodo debe comenzar después del último registro",
    "Ya existe un periodo abierto o un registro con esa fecha",
    "El periodo se cruza con otro registro del historial",
  ];

  return userFacingMessages.includes(message) ? message : fallback;
}

export function CycleTracker({
  profileId,
  active,
  canActivate,
  savingPreference,
  onActiveChange,
}: CycleTrackerProps) {
  const [records, setRecords] = useState<CycleRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingAction, setSavingAction] = useState("");
  const [startDate, setStartDate] = useState(localToday);
  const [endDate, setEndDate] = useState(localToday);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!active) {
      setRecords([]);
      setError("");
      return;
    }

    let mounted = true;
    setLoading(true);
    setError("");

    fetchCycleRecords(profileId)
      .then((result) => {
        if (!mounted) return;
        setRecords(result);
      })
      .catch((loadError) => {
        if (!mounted) return;
        setError(
          cycleErrorMessage(loadError, "No se pudo cargar el historial del ciclo")
        );
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [active, profileId]);

  const summary = useMemo(() => calculateCycleSummary(records), [records]);
  const busy = loading || savingPreference || Boolean(savingAction);

  async function handleStart(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingAction("start");
    setError("");

    try {
      const saved = await startCycle(profileId, startDate);
      setRecords((current) =>
        [saved, ...current].sort((a, b) =>
          b.startDate.localeCompare(a.startDate)
        )
      );
      setEndDate(localToday());
      toast.success("Inicio del periodo registrado");
    } catch (saveError) {
      const message = cycleErrorMessage(
        saveError,
        "No se pudo registrar el inicio del periodo"
      );
      setError(message);
      toast.error(message);
    } finally {
      setSavingAction("");
    }
  }

  async function handleFinish(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!summary.openRecord) return;

    setSavingAction("finish");
    setError("");

    try {
      const saved = await finishCycle(
        profileId,
        summary.openRecord,
        endDate
      );
      setRecords((current) =>
        current.map((record) => (record.id === saved.id ? saved : record))
      );
      setStartDate(localToday());
      toast.success("Fin del periodo registrado");
    } catch (saveError) {
      const message = cycleErrorMessage(
        saveError,
        "No se pudo registrar el fin del periodo"
      );
      setError(message);
      toast.error(message);
    } finally {
      setSavingAction("");
    }
  }

  async function handleDelete(record: CycleRecord) {
    const confirmed = window.confirm(
      `¿Eliminar el registro que comenzó el ${formatDate(record.startDate)}?`
    );
    if (!confirmed) return;

    setSavingAction(record.id);
    setError("");

    try {
      await deleteCycleRecord(profileId, record.id);
      setRecords((current) =>
        current.filter((item) => item.id !== record.id)
      );
      toast.success("Registro eliminado");
    } catch (deleteError) {
      const message = cycleErrorMessage(
        deleteError,
        "No se pudo eliminar el registro"
      );
      setError(message);
      toast.error(message);
    } finally {
      setSavingAction("");
    }
  }

  async function handleDeleteAll() {
    const confirmed = window.confirm(
      "¿Eliminar todo tu historial del ciclo? Esta acción no se puede deshacer."
    );
    if (!confirmed) return;

    setSavingAction("delete-all");
    setError("");

    try {
      await deleteAllCycleRecords(profileId);
      setRecords([]);
      toast.success("Historial del ciclo eliminado");
    } catch (deleteError) {
      const message = cycleErrorMessage(
        deleteError,
        "No se pudo eliminar el historial del ciclo"
      );
      setError(message);
      toast.error(message);
    } finally {
      setSavingAction("");
    }
  }

  return (
    <section
      className="p-5 sm:p-6 rounded-2xl mb-6"
      style={{
        background: "var(--app-surface)",
        border: "1px solid var(--app-border)",
      }}
      aria-labelledby="cycle-tracker-title"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ background: "rgba(193,125,148,0.15)", color: "#D99AAF" }}
          >
            <CalendarDays size={20} aria-hidden="true" />
          </div>
          <div>
            <h2
              id="cycle-tracker-title"
              style={{
                color: "var(--app-text)",
                fontSize: "calc(16px * var(--app-font-scale))",
                fontWeight: 700,
              }}
            >
              Seguimiento privado del ciclo
            </h2>
            <p
              className="mt-1"
              style={{
                color: "var(--app-text-muted)",
                fontSize: "calc(12px * var(--app-font-scale))",
                lineHeight: 1.5,
              }}
            >
              Registra el inicio y el fin de cada periodo. Puedes desactivarlo
              cuando quieras sin borrar tu historial.
            </p>
          </div>
        </div>

        <label
          className="flex min-h-11 shrink-0 cursor-pointer items-center gap-3 rounded-xl px-4 py-2"
          style={inputStyle}
        >
          {savingPreference ? (
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          ) : (
            <input
              type="checkbox"
              checked={active}
              disabled={busy || (!canActivate && !active)}
              onChange={(event) => {
                if (event.target.checked && !canActivate) return;
                void onActiveChange(event.target.checked);
              }}
              style={{ accentColor: "#5B88B2" }}
            />
          )}
          <span style={{ fontSize: 13, fontWeight: 600 }}>
            {active ? "Activado" : canActivate ? "Activar" : "No disponible"}
          </span>
        </label>
      </div>

      {!active ? (
        <div
          className="mt-5 rounded-xl px-4 py-3"
          style={{
            background: "var(--app-surface-alt)",
            color: "var(--app-text-muted)",
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          {canActivate
            ? "Esta función es opcional. No se registrará ninguna fecha hasta que la actives explícitamente."
            : "Selecciona Mujer en el campo Género para activar nuevos registros. Aun así puedes eliminar cualquier historial guardado anteriormente."}
        </div>
      ) : loading ? (
        <div
          className="mt-6 flex items-center justify-center gap-2 py-6"
          style={{ color: "var(--app-text-muted)" }}
        >
          <Loader2 size={18} className="animate-spin" />
          Cargando historial…
        </div>
      ) : (
        <div className="mt-6">
          {summary.openRecord ? (
            <div
              className="rounded-2xl p-4"
              style={{
                background: "rgba(193,125,148,0.1)",
                border: "1px solid rgba(217,154,175,0.28)",
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p style={{ color: "#D99AAF", fontSize: 12, fontWeight: 700 }}>
                    PERIODO EN CURSO
                  </p>
                  <p
                    className="mt-1"
                    style={{ color: "var(--app-text)", fontSize: 18, fontWeight: 700 }}
                  >
                    {summary.currentDay === 1
                      ? "Día 1"
                      : `Día ${summary.currentDay ?? "—"}`}
                  </p>
                  <p style={{ color: "var(--app-text-muted)", fontSize: 12 }}>
                    Comenzó el {formatDate(summary.openRecord.startDate)}
                  </p>
                </div>
                <CircleCheck size={20} color="#D99AAF" aria-hidden="true" />
              </div>

              <form
                onSubmit={handleFinish}
                className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end"
              >
                <label className="flex-1">
                  <span
                    className="mb-1 block"
                    style={{ color: "var(--app-text-muted)", fontSize: 12 }}
                  >
                    Fecha en que terminó
                  </span>
                  <input
                    type="date"
                    value={endDate}
                    min={summary.openRecord.startDate}
                    max={localToday()}
                    onChange={(event) => setEndDate(event.target.value)}
                    required
                    className="w-full rounded-xl px-3 py-2.5 outline-none"
                    style={inputStyle}
                  />
                </label>
                <button
                  type="submit"
                  disabled={busy}
                  className="flex min-h-11 items-center justify-center gap-2 rounded-xl px-4"
                  style={{
                    background: "#5B88B2",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 700,
                    opacity: busy ? 0.7 : 1,
                  }}
                >
                  {savingAction === "finish" && (
                    <Loader2 size={15} className="animate-spin" />
                  )}
                  Registrar fin
                </button>
              </form>
            </div>
          ) : (
            <form
              onSubmit={handleStart}
              className="rounded-2xl p-4"
              style={{
                background: "var(--app-surface-alt)",
                border: "1px solid var(--app-border-medium)",
              }}
            >
              <p style={{ color: "var(--app-text)", fontSize: 14, fontWeight: 700 }}>
                Registrar un nuevo periodo
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
                <label className="flex-1">
                  <span
                    className="mb-1 block"
                    style={{ color: "var(--app-text-muted)", fontSize: 12 }}
                  >
                    Fecha de inicio
                  </span>
                  <input
                    type="date"
                    value={startDate}
                    max={localToday()}
                    onChange={(event) => setStartDate(event.target.value)}
                    required
                    className="w-full rounded-xl px-3 py-2.5 outline-none"
                    style={inputStyle}
                  />
                </label>
                <button
                  type="submit"
                  disabled={busy}
                  className="flex min-h-11 items-center justify-center gap-2 rounded-xl px-4"
                  style={{
                    background: "#5B88B2",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 700,
                    opacity: busy ? 0.7 : 1,
                  }}
                >
                  {savingAction === "start" ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Plus size={15} />
                  )}
                  Registrar inicio
                </button>
              </div>
            </form>
          )}

          {records.length > 0 && (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <SummaryItem
                label="Último inicio"
                value={formatDate(summary.latestRecord!.startDate)}
              />
              <SummaryItem
                label="Duración promedio"
                value={
                  summary.averagePeriodDays
                    ? `${summary.averagePeriodDays} días de periodo`
                    : "Faltan registros cerrados"
                }
              />
              <SummaryItem
                label="Próximo inicio orientativo"
                value={
                  summary.estimatedNextStart
                    ? summary.estimateIsPast
                      ? "Actualización pendiente"
                      : formatDate(summary.estimatedNextStart)
                    : "Disponible con más registros comparables"
                }
              />
            </div>
          )}

          {records.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between gap-3">
                <h3 style={{ color: "var(--app-text)", fontSize: 14, fontWeight: 700 }}>
                  Historial reciente
                </h3>
                {summary.averageCycleDays && (
                  <span style={{ color: "var(--app-text-muted)", fontSize: 12 }}>
                    Promedio entre inicios: {summary.averageCycleDays} días
                  </span>
                )}
              </div>
              <div className="mt-3 flex flex-col gap-2">
                {records.slice(0, 6).map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between gap-3 rounded-xl px-4 py-3"
                    style={{
                      background: "var(--app-surface-alt)",
                      border: "1px solid var(--app-border)",
                    }}
                  >
                    <div className="min-w-0">
                      <p style={{ color: "var(--app-text)", fontSize: 13, fontWeight: 600 }}>
                        {formatDate(record.startDate)}
                      </p>
                      <p style={{ color: "var(--app-text-muted)", fontSize: 12 }}>
                        {record.endDate
                          ? `Terminó el ${formatDate(record.endDate)}`
                          : "En curso"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleDelete(record)}
                      disabled={busy}
                      aria-label={`Eliminar registro del ${formatDate(record.startDate)}`}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
                      style={{
                        background: "rgba(226,75,74,0.08)",
                        border: "1px solid rgba(226,75,74,0.2)",
                        color: "#E24B4A",
                      }}
                    >
                      {savingAction === record.id ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <Trash2 size={15} />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-xl px-4 py-3"
          style={{
            background: "rgba(226,75,74,0.08)",
            border: "1px solid rgba(226,75,74,0.22)",
            color: "#E24B4A",
            fontSize: 13,
          }}
        >
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={() => void handleDeleteAll()}
        disabled={busy}
        className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-xl px-4"
        style={{
          background: "rgba(226,75,74,0.07)",
          border: "1px solid rgba(226,75,74,0.2)",
          color: "#E24B4A",
          fontSize: 12,
          fontWeight: 600,
          opacity: busy ? 0.65 : 1,
        }}
      >
        {savingAction === "delete-all" ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          <Trash2 size={15} />
        )}
        Eliminar todo el historial del ciclo
      </button>

      <div
        className="mt-5 flex items-start gap-2 rounded-xl px-4 py-3"
        style={{
          background: "rgba(91,136,178,0.08)",
          border: "1px solid rgba(91,136,178,0.2)",
        }}
      >
        <ShieldCheck
          size={16}
          color="#78A6D1"
          className="mt-0.5 shrink-0"
          aria-hidden="true"
        />
        <p style={{ color: "var(--app-text-muted)", fontSize: 12, lineHeight: 1.5 }}>
          El próximo inicio es solo una estimación personal, no un diagnóstico.
          FriendIA no calcula ovulación ni días fértiles y este registro no debe
          utilizarse como método anticonceptivo.
        </p>
      </div>
    </section>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-xl px-4 py-3"
      style={{
        background: "var(--app-surface-alt)",
        border: "1px solid var(--app-border)",
      }}
    >
      <p style={{ color: "var(--app-text-muted)", fontSize: 11 }}>{label}</p>
      <p
        className="mt-1"
        style={{ color: "var(--app-text)", fontSize: 13, fontWeight: 700 }}
      >
        {value}
      </p>
    </div>
  );
}
