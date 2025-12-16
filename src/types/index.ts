// Tipos principais do sistema

export interface Bolao {
  id: string;
  numero: number;
  nome: string;
  valor_jogo: number;
  taxa_organizador: number;
  data_inicio: string;
  data_encerramento: string;
  status: "ativo" | "encerrado" | "cancelado";
  created_at: string;
  updated_at?: string;
}

export interface Jogo {
  id: string;
  bolao_id: string;
  nome_participante: string;
  whatsapp: string;
  numeros: number[];
  valor: number;
  status: "pendente" | "validado" | "cancelado";
  payment_id?: string;
  pago_em?: string;
  created_at: string;
  // Campos calculados/joins
  acertos?: number;
  numeros_acertados?: number[];
  // Relacionamento
  bolao?: Bolao;
}

export interface Sorteio {
  id: number;
  concurso: number;
  numeros: number[];
  data_sorteio: string;
  acumulou: boolean;
  premio_acumulado?: number;
  created_at: string;
}

export interface Resultado {
  id: string;
  jogo_id: string;
  sorteio_id: number;
  acertos: number;
  numeros_acertados: number[];
  created_at: string;
}

export interface Participante {
  whatsapp: string;
  nome: string;
  total_jogos: number;
  jogos: Jogo[];
}

// Tipos para API
export interface CriarPixResponse {
  jogoId: string;
  qrCode: string;
  qrCodeBase64: string;
  pixCopiaECola: string;
  expiracao: string;
}

export interface SorteioAPI {
  concurso: number;
  data: string;
  dezenas: string[];
  acumulou: boolean;
  valorAcumulado: number;
  proximoConcurso: number;
  dataProximoConcurso: string;
}

// Tipos para formulários
export interface BolaoFormData {
  nome: string;
  numero: number;
  valor_jogo: number;
  taxa_organizador: number;
  data_inicio: string;
  data_encerramento: string;
  status: "ativo" | "encerrado" | "cancelado";
}

export interface JogoFormData {
  nome_participante: string;
  whatsapp: string;
  numeros: number[];
}
