import { createClient } from "@/lib/supabase/server";

export interface EstatisticasGerais {
  totalBoloes: number;
  boloesAtivos: number;
  totalJogos: number;
  jogosValidados: number;
  jogosPendentes: number;
  totalArrecadado: number;
  arrecadadoHoje: number;
}

export interface JogoRecente {
  id: string;
  nome_participante: string;
  numeros: number[];
  valor: number;
  status: string;
  created_at: string;
  bolao: {
    nome: string;
    numero: number;
  } | null;
}

export async function buscarEstatisticasGerais(): Promise<EstatisticasGerais> {
  const supabase = await createClient();

  // Buscar bolões
  const { data: boloes } = await supabase
    .from("boloes")
    .select("id, status");

  // Buscar jogos
  const { data: jogos } = await supabase
    .from("jogos")
    .select("id, status, valor, created_at, pago_em");

  const totalBoloes = boloes?.length || 0;
  const boloesAtivos = boloes?.filter((b) => b.status === "ativo").length || 0;

  const totalJogos = jogos?.length || 0;
  const jogosValidados = jogos?.filter((j) => j.status === "validado").length || 0;
  const jogosPendentes = jogos?.filter((j) => j.status === "pendente").length || 0;

  const totalArrecadado = jogos
    ?.filter((j) => j.status === "validado")
    .reduce((acc, j) => acc + (j.valor || 0), 0) || 0;

  // Arrecadado hoje
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const arrecadadoHoje = jogos
    ?.filter((j) => {
      if (j.status !== "validado" || !j.pago_em) return false;
      const pagoEm = new Date(j.pago_em);
      return pagoEm >= hoje;
    })
    .reduce((acc, j) => acc + (j.valor || 0), 0) || 0;

  return {
    totalBoloes,
    boloesAtivos,
    totalJogos,
    jogosValidados,
    jogosPendentes,
    totalArrecadado,
    arrecadadoHoje,
  };
}

export async function buscarJogosRecentes(limite = 5): Promise<JogoRecente[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("jogos")
    .select(`
      id,
      nome_participante,
      numeros,
      valor,
      status,
      created_at,
      bolao:boloes(nome, numero)
    `)
    .order("created_at", { ascending: false })
    .limit(limite);

  if (error) {
    console.error("Erro ao buscar jogos recentes:", error);
    return [];
  }

  // Transformar dados para o formato correto
  return (data || []).map((jogo) => ({
    id: jogo.id,
    nome_participante: jogo.nome_participante,
    numeros: jogo.numeros,
    valor: jogo.valor,
    status: jogo.status,
    created_at: jogo.created_at,
    // Supabase retorna array para relações, pegamos o primeiro item
    bolao: Array.isArray(jogo.bolao) ? jogo.bolao[0] || null : jogo.bolao,
  }));
}

export async function buscarEstatisticasPorBolao(bolaoId: string) {
  const supabase = await createClient();

  const { data: jogos } = await supabase
    .from("jogos")
    .select("status, valor")
    .eq("bolao_id", bolaoId);

  if (!jogos) {
    return { total: 0, validados: 0, pendentes: 0, arrecadado: 0 };
  }

  return {
    total: jogos.length,
    validados: jogos.filter((j) => j.status === "validado").length,
    pendentes: jogos.filter((j) => j.status === "pendente").length,
    arrecadado: jogos
      .filter((j) => j.status === "validado")
      .reduce((acc, j) => acc + (j.valor || 0), 0),
  };
}
