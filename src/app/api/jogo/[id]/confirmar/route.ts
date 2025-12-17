import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Buscar jogo
    const { data: jogo, error: jogoError } = await supabase
      .from("jogos")
      .select("id, status")
      .eq("id", id)
      .single();

    if (jogoError || !jogo) {
      return NextResponse.json(
        { error: "Jogo não encontrado" },
        { status: 404 }
      );
    }

    if (jogo.status === "validado") {
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

    // Atualizar status para validado
    const { error: updateError } = await supabase
      .from("jogos")
      .update({
        status: "validado",
        pago_em: new Date().toISOString(),
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
