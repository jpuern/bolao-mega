import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CONFIG } from "@/constants";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Buscar jogo com dados do bolão
    const { data: jogo, error } = await supabase
      .from("jogos")
      .select(`
        *,
        bolao:boloes(id, nome, numero)
      `)
      .eq("id", id)
      .single();

    if (error || !jogo) {
      return NextResponse.json(
        { error: "Jogo não encontrado" },
        { status: 404 }
      );
    }

    // Gerar dados do PIX (mesmo padrão da criação)
    const pixData = {
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
        `PIX:${CONFIG.PIX.CHAVE}:${jogo.valor}:${jogo.id}`
      )}`,
      pixCopiaECola: gerarPixCopiaECola(CONFIG.PIX.CHAVE, jogo.valor, jogo.id),
    };

    // Calcular expiração (30 min após criação se pendente)
    const criadoEm = new Date(jogo.created_at).getTime();
    const expiraEm = new Date(criadoEm + 30 * 60 * 1000).toISOString();

    return NextResponse.json({
      id: jogo.id,
      nome: jogo.nome_participante,
      whatsapp: jogo.whatsapp,
      numeros: jogo.numeros,
      valor: jogo.valor,
      status: jogo.status,
      bolao: jogo.bolao,
      expiraEm,
      pix: pixData,
      criadoEm: jogo.created_at,
    });
  } catch (error) {
    console.error("Erro ao buscar jogo:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Função auxiliar para gerar código PIX Copia e Cola
function gerarPixCopiaECola(chave: string, valor: number, txid: string): string {
  const valorFormatado = valor.toFixed(2).replace(".", "");
  return `00020126580014br.gov.bcb.pix0136${chave}5204000053039865404${valorFormatado}5802BR5913BOLAO MEGA6008BRASILIA62070503***${txid.slice(-8)}6304`;
}
