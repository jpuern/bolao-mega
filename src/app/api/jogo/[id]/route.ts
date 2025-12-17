import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    // Chave PIX do ambiente ou fallback
    const chavePix = process.env.PIX_CHAVE || "";

    // Gerar QR Code simples (para demonstração)
    const pixData = {
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
        `PIX:${chavePix}:${jogo.valor}:${jogo.id}`
      )}`,
      pixCopiaECola: chavePix, // Simplificado - usar chave direta
      chave: chavePix,
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
      bolao: Array.isArray(jogo.bolao) ? jogo.bolao[0] || null : jogo.bolao,
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
