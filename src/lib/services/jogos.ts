import { createClient } from "@/lib/supabase/client";
import { Jogo, JogoFormData } from "@/types";

// Criar novo jogo
export async function criarJogo(bolaoId: string, dados: JogoFormData, valor: number) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("jogos")
    .insert([
      {
        bolao_id: bolaoId,
        nome_participante: dados.nome_participante,
        whatsapp: dados.whatsapp,
        numeros: dados.numeros,
        valor: valor,
        status: "pendente",
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data as Jogo;
}

// Listar jogos de um bolão
export async function listarJogosBolao(bolaoId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("jogos")
    .select("*")
    .eq("bolao_id", bolaoId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Jogo[];
}

// Listar todos os jogos (admin)
export async function listarTodosJogos() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("jogos")
    .select(`
      *,
      bolao:boloes(id, nome, numero)
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Jogo[];
}

// Buscar jogo por ID
export async function buscarJogo(id: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("jogos")
    .select(`
      *,
      bolao:boloes(*)
    `)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Jogo;
}

// Atualizar status do jogo
export async function atualizarStatusJogo(id: string, status: "pendente" | "validado" | "cancelado") {
  const supabase = createClient();

  const updateData: Record<string, unknown> = { status };
  
  if (status === "validado") {
    updateData.pago_em = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("jogos")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Jogo;
}

// Buscar jogos por WhatsApp
export async function buscarJogosPorWhatsapp(whatsapp: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("jogos")
    .select(`
      *,
      bolao:boloes(id, nome, numero, status)
    `)
    .eq("whatsapp", whatsapp)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Jogo[];
}

// Excluir jogo
export async function excluirJogo(id: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from("jogos")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

// Estatísticas do bolão
export async function estatisticasBolao(bolaoId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("jogos")
    .select("status, valor")
    .eq("bolao_id", bolaoId);

  if (error) throw error;

  const total = data.length;
  const validados = data.filter((j) => j.status === "validado").length;
  const pendentes = data.filter((j) => j.status === "pendente").length;
  const arrecadado = data
    .filter((j) => j.status === "validado")
    .reduce((acc, j) => acc + j.valor, 0);

  return { total, validados, pendentes, arrecadado };
}
