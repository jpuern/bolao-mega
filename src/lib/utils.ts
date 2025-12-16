// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formatar número com 2 dígitos (01, 02, ...)
export function formatarNumero(num: number): string {
  return num.toString().padStart(2, "0");
}

// Formatar valor em reais
export function formatarDinheiro(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

// Formatar telefone
export function formatarTelefone(telefone: string): string {
  const limpo = telefone.replace(/\D/g, "");
  if (limpo.length === 11) {
    return `(${limpo.slice(0, 2)}) ${limpo.slice(2, 7)}-${limpo.slice(7)}`;
  }
  return telefone;
}

// Limpar telefone (só números)
export function limparTelefone(telefone: string): string {
  return telefone.replace(/\D/g, "");
}

// Validar telefone brasileiro
export function validarTelefone(telefone: string): boolean {
  const limpo = limparTelefone(telefone);
  return limpo.length === 11 && limpo[2] === "9";
}

// Calcular acertos entre dois arrays de números
export function calcularAcertos(
  numerosJogo: number[],
  numerosSorteio: number[]
): { acertos: number; numerosAcertados: number[] } {
  const numerosAcertados = numerosJogo.filter((n) =>
    numerosSorteio.includes(n)
  );
  return {
    acertos: numerosAcertados.length,
    numerosAcertados,
  };
}

// Gerar números aleatórios únicos
export function gerarNumerosAleatorios(
  quantidade: number,
  max: number = 60,
  excluir: number[] = []
): number[] {
  const disponiveis = Array.from({ length: max }, (_, i) => i + 1).filter(
    (n) => !excluir.includes(n)
  );

  const selecionados: number[] = [];
  for (let i = 0; i < quantidade && disponiveis.length > 0; i++) {
    const idx = Math.floor(Math.random() * disponiveis.length);
    selecionados.push(disponiveis.splice(idx, 1)[0]);
  }

  return selecionados.sort((a, b) => a - b);
}

// Formatar data
export function formatarData(data: string | Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(data));
}

// Formatar data e hora
export function formatarDataHora(data: string | Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(data));
}

// Tempo restante para uma data
export function tempoRestante(dataFutura: string | Date): string {
  const agora = new Date();
  const futuro = new Date(dataFutura);
  const diff = futuro.getTime() - agora.getTime();

  if (diff <= 0) return "Encerrado";

  const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
  const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (dias > 0) return `${dias}d ${horas}h ${minutos}min`;
  if (horas > 0) return `${horas}h ${minutos}min`;
  return `${minutos}min`;
}
