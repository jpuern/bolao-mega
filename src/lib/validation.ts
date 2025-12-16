import { z } from "zod";
import { CONFIG } from "@/constants";

// Schema para criar um novo jogo
export const criarJogoSchema = z.object({
  nome: z
    .string()
    .min(3, "Nome deve ter no mínimo 3 caracteres")
    .max(100, "Nome muito longo"),
  whatsapp: z
    .string()
    .regex(
      /^\(?[1-9]{2}\)?\s?9[0-9]{4}-?[0-9]{4}$/,
      "WhatsApp inválido. Use o formato (88) 99999-9999"
    ),
  numeros: z
    .array(z.number().min(1).max(60))
    .length(
      CONFIG.NUMEROS_POR_JOGO,
      `Selecione exatamente ${CONFIG.NUMEROS_POR_JOGO} números`
    ),
});

export type CriarJogoInput = z.infer<typeof criarJogoSchema>;

// Schema para criar bolão (admin)
export const criarBolaoSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  valor_jogo: z.number().min(1, "Valor deve ser maior que R$ 1,00"),
  taxa_organizador: z.number().min(0).max(30, "Taxa máxima é 30%"),
  data_encerramento: z.string().datetime(),
});

export type CriarBolaoInput = z.infer<typeof criarBolaoSchema>;

// Schema para busca/filtros
export const filtroJogosSchema = z.object({
  busca: z.string().optional(),
  status: z.enum(["todos", "pendente", "validado", "cancelado"]).optional(),
  bolao_id: z.string().uuid().optional(),
});

export type FiltroJogosInput = z.infer<typeof filtroJogosSchema>;
