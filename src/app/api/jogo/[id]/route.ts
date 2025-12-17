import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import fs from 'fs';
import path from 'path';

function logToFile(message: string) {
  const logPath = path.join(process.cwd(), 'debug.log');
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logPath, `[${timestamp}] ${message}\n`);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let supabase;
    try {
      supabase = createServiceClient();
    } catch (error) {
      console.error("Erro ao criar cliente Supabase:", error);
      return NextResponse.json(
        { error: "Erro de configuração do servidor" },
        { status: 500 }
      );
    }

    // Buscar jogo com dados do bolão
    logToFile(`[GET Jogo] Buscando ID: ${id}`);
    const { data: jogo, error } = await supabase
      .from("jogos")
      .select(`
        *,
        bolao:boloes(id, nome)
      `)
      .eq("id", id)
      .single();

    if (error || !jogo) {
      logToFile(`[GET Jogo] Erro ou não encontrado. ID: ${id}. Erro: ${JSON.stringify(error)}`);
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
      nome: jogo.nome,
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
