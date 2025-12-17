import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  buscarEstatisticasGerais,
  buscarJogosRecentes,
} from "@/lib/services/estatisticas";
import { formatarDinheiro } from "@/lib/utils";
import {
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Ticket,
} from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const [stats, jogosRecentes] = await Promise.all([
    buscarEstatisticasGerais(),
    buscarJogosRecentes(5),
  ]);

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Visão geral do sistema de bolões
          </p>
        </div>
        <Link href="/admin/boloes/novo">
          <Button className="bg-green-600 hover:bg-green-700">
            + Novo Bolão
          </Button>
        </Link>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Arrecadado */}
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Total Arrecadado
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatarDinheiro(stats.totalArrecadado)}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  +{formatarDinheiro(stats.arrecadadoHoje)} hoje
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total de Jogos */}
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Total de Jogos
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.totalJogos}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.jogosValidados} validados
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Ticket className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Jogos Pendentes */}
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Pendentes
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.jogosPendentes}
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  Aguardando pagamento
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bolões */}
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Bolões</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.totalBoloes}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  {stats.boloesAtivos} ativo(s)
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Jogos Recentes e Ações Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Jogos Recentes */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Jogos Recentes</CardTitle>
            <Link href="/admin/jogos">
              <Button variant="ghost" size="sm">
                Ver todos
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {jogosRecentes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum jogo registrado ainda</p>
              </div>
            ) : (
              <div className="space-y-4">
                {jogosRecentes.map((jogo) => (
                  <div
                    key={jogo.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          jogo.status === "validado"
                            ? "bg-green-100"
                            : jogo.status === "pendente"
                            ? "bg-yellow-100"
                            : "bg-red-100"
                        }`}
                      >
                        {jogo.status === "validado" ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : jogo.status === "pendente" ? (
                          <Clock className="w-5 h-5 text-yellow-600" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {jogo.nome}
                        </p>
                        <p className="text-sm text-gray-500">
                          {jogo.bolao?.nome || "Bolão"} •{" "}
                          {formatarData(jogo.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatarDinheiro(jogo.valor)}
                      </p>
                      <Badge
                        variant={
                          jogo.status === "validado"
                            ? "default"
                            : jogo.status === "pendente"
                            ? "secondary"
                            : "destructive"
                        }
                        className={
                          jogo.status === "validado"
                            ? "bg-green-100 text-green-800"
                            : ""
                        }
                      >
                        {jogo.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ações Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/boloes/novo" className="block">
              <Button variant="outline" className="w-full justify-start h-12">
                <TrendingUp className="w-5 h-5 mr-3 text-green-600" />
                Criar novo bolão
              </Button>
            </Link>
            <Link href="/admin/jogos" className="block">
              <Button variant="outline" className="w-full justify-start h-12">
                <Ticket className="w-5 h-5 mr-3 text-blue-600" />
                Gerenciar jogos
              </Button>
            </Link>
            <Link href="/admin/boloes" className="block">
              <Button variant="outline" className="w-full justify-start h-12">
                <Users className="w-5 h-5 mr-3 text-purple-600" />
                Ver bolões
              </Button>
            </Link>
            <Link href="/" className="block">
              <Button variant="outline" className="w-full justify-start h-12">
                <ArrowRight className="w-5 h-5 mr-3 text-gray-600" />
                Ver site público
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
