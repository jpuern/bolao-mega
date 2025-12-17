import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CONFIG } from "@/constants";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bolaoId, nome, whatsapp, numeros, valor } = body;

    // Validações básicas
    if (!bolaoId) {
      return NextResponse.json(
        { error: "Bolão não informado" },
        { status: 400 }
      );
    }

    if (!nome || nome.trim().length < 3) {
      return NextResponse.json(
        { error: "Nome deve ter pelo menos 3 caracteres" },
        { status: 400 }
      );
    }

    if (!whatsapp || whatsapp.replace(/\D/g, "").length !== 11) {
      return NextResponse.json(
        { error: "WhatsApp inválido" },
        { status: 400 }
      );
    }

    if (!numeros || numeros.length !== CONFIG.NUMEROS_POR_JOGO) {
      return NextResponse.json(
        { error: `Selecione exatamente ${CONFIG.NUMEROS_POR_JOGO} números` },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verificar se o bolão existe e está ativo
    const { data: bolao, error: bolaoError } = await supabase
      .from("boloes")
      .select("*")
      .eq("id", bolaoId)
      .eq("status", "ativo")
      .single();

    if (bolaoError || !bolao) {
      return NextResponse.json(
        { error: "Bolão não encontrado ou não está ativo" },
        { status: 400 }
      );
    }

    // Usar valor do bolão ou valor enviado
    const valorJogo = valor || bolao.valor_jogo || CONFIG.VALOR_JOGO_PADRAO;

    // Criar o jogo no banco
    const { data: jogo, error: jogoError } = await supabase
      .from("jogos")
      .insert([
        {
          bolao_id: bolaoId,
          nome: nome.trim(),
          whatsapp: whatsapp.replace(/\D/g, ""),
          numeros: numeros.sort((a: number, b: number) => a - b),
          valor: valorJogo,
          status: "pendente",
        },
      ])
      .select()
      .single();

    if (jogoError) {
      console.error("Erro ao criar jogo:", jogoError);
      return NextResponse.json(
        { error: "Erro ao registrar jogo" },
        { status: 500 }
      );
    }

    // Dados do PIX (simulado - substitua pela integração real depois)
    const pixData = {
      chave: CONFIG.PIX.CHAVE,
      valor: valorJogo,
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
        `PIX:${CONFIG.PIX.CHAVE}:${valorJogo}:${jogo.id}`
      )}`,
      pixCopiaECola: gerarPixCopiaECola(CONFIG.PIX.CHAVE, valorJogo, jogo.id),
    };

    // Atualizar jogo com payment_id (opcional, para rastreio)
    await supabase
      .from("jogos")
      .update({ payment_id: `PIX-${jogo.id}` })
      .eq("id", jogo.id);

    return NextResponse.json({
      success: true,
      jogoId: jogo.id,
      pix: pixData,
      expiraEm: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    console.error("Erro ao criar PIX:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Função auxiliar para gerar código PIX Copia e Cola (simplificado)
function gerarPixCopiaECola(chave: string, valor: number, txid: string): string {
  // Este é um código simplificado - em produção use uma lib como 'pix-utils'
  const valorFormatado = valor.toFixed(2).replace(".", "");
  
  return `00020126580014br.gov.bcb.pix0136${chave}5204000053039865404${valorFormatado}5802BR5913BOLAO MEGA6008BRASILIA62070503***${txid.slice(-8)}6304`;
}
