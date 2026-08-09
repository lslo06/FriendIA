import { supabase } from "./supabase";
import type { CycleRecord } from "./types";
import {
  assertCycleEndAllowed,
  assertCycleStartAllowed,
} from "./cycleMath";
export { calculateCycleSummary } from "./cycleMath";

interface CycleRecordRow {
  id_registro_ciclo: string;
  id_perfil: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  creado_en: string;
  actualizado_en: string;
}

function mapCycleRecord(row: CycleRecordRow): CycleRecord {
  return {
    id: row.id_registro_ciclo,
    profileId: row.id_perfil,
    startDate: row.fecha_inicio,
    endDate: row.fecha_fin,
    createdAt: row.creado_en,
    updatedAt: row.actualizado_en,
  };
}

export async function fetchCycleRecords(
  profileId: string
): Promise<CycleRecord[]> {
  const { data, error } = await supabase
    .schema("Group_By")
    .from("registros_ciclo")
    .select(
      "id_registro_ciclo,id_perfil,fecha_inicio,fecha_fin,creado_en,actualizado_en"
    )
    .eq("id_perfil", profileId)
    .order("fecha_inicio", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => mapCycleRecord(row as CycleRecordRow));
}

export async function startCycle(
  profileId: string,
  startDate: string
): Promise<CycleRecord> {
  const { data: latestData, error: latestError } = await supabase
    .schema("Group_By")
    .from("registros_ciclo")
    .select(
      "id_registro_ciclo,id_perfil,fecha_inicio,fecha_fin,creado_en,actualizado_en"
    )
    .eq("id_perfil", profileId)
    .order("fecha_inicio", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestError) throw latestError;
  const latestRecords = latestData
    ? [mapCycleRecord(latestData as CycleRecordRow)]
    : [];
  assertCycleStartAllowed(latestRecords, startDate);

  const { data, error } = await supabase
    .schema("Group_By")
    .from("registros_ciclo")
    .insert({ id_perfil: profileId, fecha_inicio: startDate })
    .select(
      "id_registro_ciclo,id_perfil,fecha_inicio,fecha_fin,creado_en,actualizado_en"
    )
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error(
        "Ya existe un periodo abierto o un registro con esa fecha"
      );
    }
    if (error.code === "23P01") {
      throw new Error("El periodo se cruza con otro registro del historial");
    }
    throw error;
  }

  return mapCycleRecord(data as CycleRecordRow);
}

export async function finishCycle(
  profileId: string,
  record: CycleRecord,
  endDate: string
): Promise<CycleRecord> {
  assertCycleEndAllowed(record, endDate);

  const { data, error } = await supabase
    .schema("Group_By")
    .from("registros_ciclo")
    .update({ fecha_fin: endDate })
    .eq("id_registro_ciclo", record.id)
    .eq("id_perfil", profileId)
    .select(
      "id_registro_ciclo,id_perfil,fecha_inicio,fecha_fin,creado_en,actualizado_en"
    )
    .single();

  if (error) throw error;
  return mapCycleRecord(data as CycleRecordRow);
}

export async function deleteCycleRecord(
  profileId: string,
  recordId: string
): Promise<void> {
  const { error } = await supabase
    .schema("Group_By")
    .from("registros_ciclo")
    .delete()
    .eq("id_registro_ciclo", recordId)
    .eq("id_perfil", profileId);

  if (error) throw error;
}

export async function deleteAllCycleRecords(profileId: string): Promise<void> {
  const { error } = await supabase
    .schema("Group_By")
    .from("registros_ciclo")
    .delete()
    .eq("id_perfil", profileId);

  if (error) throw error;
}
