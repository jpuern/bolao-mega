"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Eye,
  Phone,
  Loader2,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { formatarDinheiro } from "@/lib/utils";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface Jogo {
  id: string;
  nome: string;
  whatsapp: string;
  numeros: number[];
  valor: number;
  status: string;
  created_at: string;
  pago_em: string | null;
  bolao: {
    id: string;
    nome: string;
    numero: number;
  } | null;
}

interface Bolao {
  id: string;
  nome: string;
  numero: number;
}

export default function JogosPage() {
  const [jogos, setJogos] = useState<Jogo[]>([]);
  const [boloes, setBoloes] = useState<Bolao[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroBolao, setFiltroBolao] = useState<string>("todos");
  const [jogoSelecionado, setJogoSelecionado] = useState<Jogo | null>(null);
  const [atualizando, setAtualizando] = useState<string | null>(null);

  const supabase = createClient();

  // Carregar jogos e bolões
  const carregarDados = async () => {
    setLoading(true);
    try {
      // Buscar bolões para o filtro
      const { data: boloesData } = await supabase
        .from("boloes")
        .select("id, nome, numero")
        .order("numero", { ascending: false });

      setBoloes(boloesData || []);

      // Buscar jogos com dados do bolão
      const { data: jogosData, error } = await supabase
        .from("jogos")
        .select(`
          id,
          nome,
          whatsapp,
          numeros,
          valor,
          status,
          created_at,
          pago_em,
          bolao:boloes(id, nome, numero)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transformar dados
      const jogosFormatados = (jogosData || []).map((jogo) => ({
        ...jogo,
        bolao: Array.isArray(jogo.bolao) ? jogo.bolao[0] || null : jogo.bolao,
      }));

      setJogos(jogosFormatados);
    } catch (error) {
      console.error("Erro ao carregar jogos:", error);
      toast.error("Erro ao carregar jogos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Filtrar jogos
  const jogosFiltrados = jogos.filter((jogo) => {
    const matchBusca =
      jogo.nome.toLowerCase().includes(busca.toLowerCase()) ||
      jogo.whatsapp.includes(busca);

    const matchStatus =
      filtroStatus === "todos" || jogo.status === filtroStatus;

    const matchBolao =
      filtroBolao === "todos" || jogo.bolao?.id === filtroBolao;

    return matchBusca && matchStatus && matchBolao;
  });

  // Alterar status do jogo
  const alterarStatus = async (jogoId: string, novoStatus: string) => {
    setAtualizando(jogoId);
    try {
      const updateData: { status: string; pago_em?: string | null } = {
        status: novoStatus,
      };

      // Se validando, adiciona data de pagamento
      if (novoStatus === "validado") {
        updateData.pago_em = new Date().toISOString();
      } else {
        updateData.pago_em = null;
      }

      const { error } = await supabase
        .from("jogos")
        .update(updateData)
        .eq("id", jogoId);

      if (error) throw error;

      // Atualizar lista local
      setJogos((prev) =>
        prev.map((j) =>
          j.id === jogoId
            ? { ...j, status: novoStatus, pago_em: updateData.pago_em || null }
            : j
        )
      );

      toast.success(
        novoStatus === "validado"
          ? "Jogo validado com sucesso!"
          : "Status atualizado!"
      );
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status");
    } finally {
      setAtualizando(null);
    }
  };

  const formatarWhatsApp = (numero: string) => {
    if (numero.length !== 11) return numero;
    return `(${numero.slice(0, 2)}) ${numero.slice(2, 7)}-${numero.slice(7)}`;
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "validado":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            Validado
          </Badge>
        );
      case "pendente":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
            Pendente
          </Badge>
        );
      case "cancelado":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
            Cancelado
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Estatísticas rápidas
  const stats = {
    total: jogosFiltrados.length,
    validados: jogosFiltrados.filter((j) => j.status === "validado").length,
    pendentes: jogosFiltrados.filter((j) => j.status === "pendente").length,
    arrecadado: jogosFiltrados
      .filter((j) => j.status === "validado")
      .reduce((acc, j) => acc + j.valor, 0),
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Jogos</h1>
          <p className="text-gray-500 mt-1">Gerenciar todos os jogos</p>
        </div>
        <Button variant="outline" onClick={carregarDados}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-gray-500">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.validados}</p>
            <p className="text-sm text-gray-500">Validados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.pendentes}</p>
            <p className="text-sm text-gray-500">Pendentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {formatarDinheiro(stats.arrecadado)}
            </p>
            <p className="text-sm text-gray-500">Arrecadado</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou WhatsApp..."
                className="pl-10"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="validado">Validados</SelectItem>
                <SelectItem value="pendente">Pendentes</SelectItem>
                <SelectItem value="cancelado">Cancelados</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroBolao} onValueChange={setFiltroBolao}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Bolão" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os bolões</SelectItem>
                {boloes.map((bolao) => (
                  <SelectItem key={bolao.id} value={bolao.id}>
                    #{bolao.numero} - {bolao.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Jogos ({jogosFiltrados.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {jogosFiltrados.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>Nenhum jogo encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Jogador</TableHead>
                    <TableHead>WhatsApp</TableHead>
                    <TableHead>Bolão</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jogosFiltrados.map((jogo) => (
                    <TableRow key={jogo.id}>
                      <TableCell className="font-medium">
                        {jogo.nome}
                      </TableCell>
                      <TableCell>
                        <a
                          href={`https://wa.me/55${jogo.whatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-green-600 hover:underline"
                        >
                          <Phone className="w-4 h-4" />
                          {formatarWhatsApp(jogo.whatsapp)}
                        </a>
                      </TableCell>
                      <TableCell>
                        {jogo.bolao ? (
                          <span className="text-sm">
                            #{jogo.bolao.numero}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>{formatarDinheiro(jogo.valor)}</TableCell>
                      <TableCell>{getStatusBadge(jogo.status)}</TableCell>
                      <TableCell className="text-sm">
                        {formatarData(jogo.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setJogoSelecionado(jogo)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {jogo.status === "pendente" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => alterarStatus(jogo.id, "validado")}
                              disabled={atualizando === jogo.id}
                            >
                              {atualizando === jogo.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-4 h-4" />
                              )}
                            </Button>
                          )}
                          {jogo.status !== "cancelado" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => alterarStatus(jogo.id, "cancelado")}
                              disabled={atualizando === jogo.id}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      {jogoSelecionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Detalhes do Jogo</span>
                {getStatusBadge(jogoSelecionado.status)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Info */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Jogador:</span>
                  <span className="font-medium">
                    {jogoSelecionado.nome}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">WhatsApp:</span>
                  <a
                    href={`https://wa.me/55${jogoSelecionado.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:underline"
                  >
                    {formatarWhatsApp(jogoSelecionado.whatsapp)}
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Bolão:</span>
                  <span className="font-medium">
                    {jogoSelecionado.bolao
                      ? `#${jogoSelecionado.bolao.numero} - ${jogoSelecionado.bolao.nome}`
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Valor:</span>
                  <span className="font-medium text-green-600">
                    {formatarDinheiro(jogoSelecionado.valor)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Data:</span>
                  <span>{formatarData(jogoSelecionado.created_at)}</span>
                </div>
                {jogoSelecionado.pago_em && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Pago em:</span>
                    <span>{formatarData(jogoSelecionado.pago_em)}</span>
                  </div>
                )}
              </div>

              <hr />

              {/* Números */}
              <div>
                <p className="text-sm text-gray-500 mb-3">Números escolhidos:</p>
                <div className="flex flex-wrap gap-2">
                  {jogoSelecionado.numeros.map((num) => (
                    <div
                      key={num}
                      className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm"
                    >
                      {num.toString().padStart(2, "0")}
                    </div>
                  ))}
                </div>
              </div>

              <hr />

              {/* Ações */}
              <div className="flex gap-2">
                {jogoSelecionado.status === "pendente" && (
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      alterarStatus(jogoSelecionado.id, "validado");
                      setJogoSelecionado(null);
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Validar
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setJogoSelecionado(null)}
                >
                  Fechar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
