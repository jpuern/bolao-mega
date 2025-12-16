import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // API route para obter sorteios
    return NextResponse.json({ sorteios: [] });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar sorteios' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // API route para criar sorteios
    return NextResponse.json({ message: 'Sorteio criado' });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar sorteio' }, { status: 500 });
  }
}
