"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Trophy,
  Loader2,
} from "lucide-react";
import { formatarDinheiro } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface DadosFinanceiros {
  totalArrecadado: number;
  taxaOrganizador: number;
  premiacaoTotal: number;
  saldoPendente: number;
}

interface Transacao {
  id: string;
  tipo: "entrada" | "saida";
  descricao: string;
  valor: number;
  data: string;
}

export default function FinanceiroPage() {
  const [loading, setLoading] = useState(true);
  const [dados, setDados] = useState<DadosFinanceiros>({
    totalArrecadado: 0,
    taxaOrganizador: 0,
    premiacaoTotal: 0,
    saldoPendente: 0,
  });
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);

  const supabase = createClient();

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      console.log('💰 [Financeiro] Carregando dados...');

      // Buscar todos os jogos pagos
      const { data: jogosPagos, error: jogosError } = await supabase
        .from("jogos")
        .select("id, nome, valor, created_at")
        .eq("status", "pago")
        .order("created_at", { ascending: false });

      if (jogosError) throw jogosError;

      console.log('💰 [Financeiro] Jogos pagos:', jogosPagos?.length || 0);

      // Calcular totais
      const totalArrecadado = (jogosPagos || []).reduce((sum, jogo) => sum + jogo.valor, 0);
      const taxaOrganizador = totalArrecadado * 0.10; // 10% de taxa
      const premiacaoTotal = totalArrecadado - taxaOrganizador;

      setDados({
        totalArrecadado,
        taxaOrganizador,
        premiacaoTotal,
        saldoPendente: premiacaoTotal, // Por enquanto, todo o valor está pendente
      });

      // Criar lista de transações (últimos 10 jogos)
      const transacoesEntrada: Transacao[] = (jogosPagos || [])
        .slice(0, 10)
        .map((jogo) => ({
          id: jogo.id,
          tipo: "entrada" as const,
          descricao: `Jogo - ${jogo.nome}`,
          valor: jogo.valor,
          data: jogo.created_at,
        }));

      setTransacoes(transacoesEntrada);

      console.log('✅ [Financeiro] Dados carregados com sucesso');
    } catch (error) {
      console.error("❌ [Financeiro] Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados financeiros");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Financeiro</h1>
        <p className="text-gray-500 mt-1">Controle financeiro do bolão</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Arrecadado</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatarDinheiro(dados.totalArrecadado)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Taxa Organizador (10%)</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatarDinheiro(dados.taxaOrganizador)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <PiggyBank className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Premiação Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatarDinheiro(dados.premiacaoTotal)}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Saldo Pendente</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatarDinheiro(dados.saldoPendente)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transações */}
      <Card>
        <CardHeader>
          <CardTitle>Últimas Transações</CardTitle>
        </CardHeader>
        <CardContent>
          {transacoes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Nenhuma transação encontrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transacoes.map((transacao) => (
                <div
                  key={transacao.id}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${transacao.tipo === "entrada"
                        ? "bg-green-100"
                        : "bg-red-100"
                        }`}
                    >
                      {transacao.tipo === "entrada" ? (
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {transacao.descricao}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(transacao.data).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`font-bold ${transacao.tipo === "entrada"
                      ? "text-green-600"
                      : "text-red-600"
                      }`}
                  >
                    {transacao.tipo === "entrada" ? "+" : "-"}
                    {formatarDinheiro(transacao.valor)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
