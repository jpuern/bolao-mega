"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Trophy,
} from "lucide-react";
import { formatarDinheiro } from "@/lib/utils";

// Dados mock
const financeiro = {
  totalArrecadado: 9550,
  taxaOrganizador: 955,
  premiacaoTotal: 8595,
  premiosPagos: 4100,
  saldoPendente: 4495,
};

const ultimasTransacoes = [
  { id: "1", tipo: "entrada", descricao: "Jogo #123 - Maria Silva", valor: 50, data: "2025-12-12" },
  { id: "2", tipo: "entrada", descricao: "Jogo #122 - João Pedro", valor: 50, data: "2025-12-12" },
  { id: "3", tipo: "saida", descricao: "Prêmio - Concurso 2.814", valor: 2050, data: "2025-12-11" },
  { id: "4", tipo: "entrada", descricao: "Jogo #121 - Ana Costa", valor: 50, data: "2025-12-11" },
  { id: "5", tipo: "saida", descricao: "Prêmio - Concurso 2.813", valor: 2050, data: "2025-12-07" },
];

export default function FinanceiroPage() {
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
                  {formatarDinheiro(financeiro.totalArrecadado)}
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
                  {formatarDinheiro(financeiro.taxaOrganizador)}
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
                <p className="text-sm text-gray-500">Prêmios Pagos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatarDinheiro(financeiro.premiosPagos)}
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
                  {formatarDinheiro(financeiro.saldoPendente)}
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
          <div className="space-y-4">
            {ultimasTransacoes.map((transacao) => (
              <div
                key={transacao.id}
                className="flex items-center justify-between py-3 border-b last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transacao.tipo === "entrada"
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
                      {new Date(transacao.data).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
                <span
                  className={`font-bold ${
                    transacao.tipo === "entrada"
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
        </CardContent>
      </Card>
    </div>
  );
}
