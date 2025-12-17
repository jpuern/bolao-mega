import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(
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

    // Buscar jogo
    console.log(`[Confirmar] Buscando jogo com ID: ${id}`);
    const { data: jogo, error: jogoError } = await supabase
      .from("jogos")
      .select("id, status")
      .eq("id", id)
      .single();

    if (jogoError || !jogo) {
      console.error("[Confirmar] Erro ou jogo não encontrado:", jogoError);
      return NextResponse.json(
        {
          error: "Jogo não encontrado",
          details: jogoError
        },
        { status: 404 }
      );
    }

    if (jogo.status === "pago") {
      return NextResponse.json({
        success: true,
        message: "Jogo já estava confirmado",
        jaConfirmado: true,
      });
    }

    if (jogo.status === "cancelado") {
      return NextResponse.json(
        { error: "Este jogo foi cancelado" },
        { status: 400 }
      );
    }

    // Atualizar status para confirmado
    const { error: updateError } = await supabase
      .from("jogos")
      .update({
        status: "pago",
      })
      .eq("id", id);

    if (updateError) {
      console.error("Erro ao atualizar jogo:", updateError);
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      message: "Pagamento confirmado com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao confirmar pagamento:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
