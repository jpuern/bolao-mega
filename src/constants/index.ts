// src/constants/index.ts
export const CONFIG = {
  // Valores
  VALOR_JOGO_PADRAO: 50,
  TAXA_ORGANIZADOR_PADRAO: 10,

  // Números
  NUMEROS_POR_JOGO: 10,
  NUMERO_MAXIMO: 60,
  NUMERO_MINIMO: 1,

  // Premiação (%)
  PREMIACAO: {
    CAMPEAO: 60,
    VICE: 20,
    TERCEIRO: 10,
    QUARTO: 7,
    QUINTO: 3,
    MENOS_ACERTOS: 18,
  },

  // App
  NOME_APP: "Mega de Ouro",
  DESCRICAO_APP: "Bolão online da Mega-Sena",

  // PIX - ADICIONAR ISSO
  PIX: {
    CHAVE: "04917091373", // Substitua pela chave real
    NOME_BENEFICIARIO: "João Pedro da Costa Ribeiro",
    CIDADE: "RUSSAS",
  },
} as const;

// Tipos de status
export const STATUS_JOGO = {
  AGUARDANDO_PAGAMENTO: "aguardando_pagamento",
  CONFIRMADO: "confirmado",
  CANCELADO: "cancelado",
} as const;

export const STATUS_SORTEIO = {
  ABERTO: "aberto",
  FECHADO: "fechado",
  FINALIZADO: "finalizado",
} as const;
