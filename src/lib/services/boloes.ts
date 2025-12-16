import { createClient } from "@/lib/supabase/client";
import { Bolao, BolaoFormData } from "@/types";

// Listar todos os bolões
export async function listarBoloes() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("boloes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Bolao[];
}

// Buscar bolão por ID
export async function buscarBolao(id: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("boloes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Bolao;
}

// Buscar bolão ativo (para página pública)
export async function buscarBolaoAtivo() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("boloes")
    .select("*")
    .eq("status", "ativo")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows
  return data as Bolao | null;
}

// Criar novo bolão
export async function criarBolao(dados: BolaoFormData) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("boloes")
    .insert([dados])
    .select()
    .single();

  if (error) throw error;
  return data as Bolao;
}

// Atualizar bolão
export async function atualizarBolao(id: string, dados: Partial<BolaoFormData>) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("boloes")
    .update({ ...dados, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Bolao;
}

// Excluir bolão
export async function excluirBolao(id: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from("boloes")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

// Contar jogos de um bolão
export async function contarJogosBolao(bolaoId: string) {
  const supabase = createClient();

  const { count, error } = await supabase
    .from("jogos")
    .select("*", { count: "exact", head: true })
    .eq("bolao_id", bolaoId);

  if (error) throw error;
  return count || 0;
}
