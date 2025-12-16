import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Webhook para processar pagamentos
    return NextResponse.json({ message: 'Webhook processado' });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao processar webhook' }, { status: 500 });
  }
}
