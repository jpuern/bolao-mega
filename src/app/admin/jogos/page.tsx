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
  Download,
} from "lucide-react";
import { formatarDinheiro } from "@/lib/utils";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { exportToCSV, formatJogoForExport } from "@/lib/utils/export";

interface Jogo {
  id: string;
  nome: string;
  whatsapp: string;
  numeros: number[];
  valor: number;
  status: string;
  created_at: string;
  bolao: {
    id: string;
    nome: string;
    numero?: number;
    concurso?: string;
  } | null;
}

interface Bolao {
  id: string;
  nome: string;
  numero?: number;
  concurso?: string;
}

export default function JogosPage() {
  const [jogos, setJogos] = useState<Jogo[]>([]);
  const [boloes, setBoloes] = useState<Bolao[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroBolao, setFiltroBolao] = useState<string>("todos");
  const [jogoSelecionado, setJogoSelecionado] = useState<Jogo | null>(null);
  const [jogoParaCancelar, setJogoParaCancelar] = useState<Jogo | null>(null);
  const [atualizando, setAtualizando] = useState<string | null>(null);

  const supabase = createClient();

  // Carregar jogos e bolões
  const carregarDados = async () => {
    setLoading(true);
    console.log('🔍 [Admin Jogos] Iniciando carregamento de dados...');
    try {
      // Buscar bolões para o filtro
      const { data: boloesData, error: boloesError } = await supabase
        .from("boloes")
        .select("id, nome, concurso")
        .order("concurso", { ascending: false });

      console.log('📊 [Admin Jogos] Bolões carregados:', boloesData?.length || 0);
      if (boloesError) console.error('❌ [Admin Jogos] Erro ao carregar bolões:', boloesError);
      setBoloes(boloesData || []);

      // Buscar jogos SEM join
      const { data: jogosData, error } = await supabase
        .from("jogos")
        .select("*")
        .order("created_at", { ascending: false });

      console.log('🎮 [Admin Jogos] Jogos retornados:', jogosData?.length || 0);
      if (error) {
        console.error('❌ [Admin Jogos] Erro ao carregar jogos:', error);
        console.error('❌ [Admin Jogos] Detalhes do erro:', JSON.stringify(error, null, 2));
        throw error;
      }

      // Buscar dados dos bolões de uma vez (evitar N+1 queries)
      const bolaoIds = [...new Set((jogosData || []).map(j => j.bolao_id).filter(Boolean))];
      console.log('🔍 [Admin Jogos] Bolão IDs únicos:', bolaoIds);

      let boloesMap = new Map();
      if (bolaoIds.length > 0) {
        const { data: boloesJogos, error: boloesJogosError } = await supabase
          .from("boloes")
          .select("id, nome, concurso")
          .in("id", bolaoIds);

        if (boloesJogosError) {
          console.error('❌ [Admin Jogos] Erro ao carregar bolões dos jogos:', boloesJogosError);
        } else {
          // Criar mapa para lookup rápido
          (boloesJogos || []).forEach(bolao => {
            boloesMap.set(bolao.id, bolao);
          });
          console.log('✅ [Admin Jogos] Bolões carregados:', boloesMap.size);
        }
      }

      // Mapear bolões aos jogos
      const jogosComBolao = (jogosData || []).map(jogo => ({
        ...jogo,
        bolao: jogo.bolao_id ? boloesMap.get(jogo.bolao_id) || null : null,
      }));

      console.log('✅ [Admin Jogos] Jogos com bolão:', jogosComBolao.length);
      setJogos(jogosComBolao);
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
      const updateData = {
        status: novoStatus,
      };

      const { error } = await supabase
        .from("jogos")
        .update(updateData)
        .eq("id", jogoId);

      if (error) throw error;

      // Atualizar lista local
      setJogos((prev) =>
        prev.map((j) =>
          j.id === jogoId
            ? { ...j, status: novoStatus }
            : j
        )
      );

      toast.success(
        novoStatus === "pago"
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

  // Exportar jogos
  const handleExportar = () => {
    const dadosExport = jogosFiltrados.map(formatJogoForExport);
    exportToCSV(dadosExport, `jogos_${new Date().toISOString().split('T')[0]}`);
    toast.success("Jogos exportados com sucesso!");
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
      case "pago":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            Pago
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
    validados: jogosFiltrados.filter((j) => j.status === "pago").length,
    pendentes: jogosFiltrados.filter((j) => j.status === "pendente").length,
    arrecadado: jogosFiltrados
      .filter((j) => j.status === "pago")
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
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExportar}
            disabled={jogosFiltrados.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
          <Button variant="outline" onClick={carregarDados}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
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
                <SelectItem value="pago">Pagos</SelectItem>
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
                    #{bolao.concurso || bolao.numero || '?'} - {bolao.nome}
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
                            #{jogo.bolao.concurso || jogo.bolao.numero || '?'}
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
                              onClick={() => setJogoParaCancelar(jogo)}
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
          <Card className="w-full max-w-md bg-white shadow-2xl">
            <CardHeader className="border-b bg-gradient-to-r from-green-50 to-blue-50">
              <CardTitle className="flex items-center justify-between text-gray-900">
                <span>Detalhes do Jogo</span>
                {getStatusBadge(jogoSelecionado.status)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Info */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-700 font-medium">Jogador:</span>
                  <span className="font-semibold text-gray-900">
                    {jogoSelecionado.nome}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-700 font-medium">WhatsApp:</span>
                  <a
                    href={`https://wa.me/55${jogoSelecionado.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:underline"
                  >
                    {formatarWhatsApp(jogoSelecionado.whatsapp)}
                  </a>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-700 font-medium">Bolão:</span>
                  <span className="font-semibold text-gray-900">
                    {jogoSelecionado.bolao
                      ? `#${jogoSelecionado.bolao.concurso} - ${jogoSelecionado.bolao.nome}`
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-700 font-medium">Valor:</span>
                  <span className="font-semibold text-green-700">
                    {formatarDinheiro(jogoSelecionado.valor)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Data:</span>
                  <span>{formatarData(jogoSelecionado.created_at)}</span>
                </div>

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

      {/* Modal de Confirmação de Cancelamento */}
      {jogoParaCancelar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white shadow-2xl">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-red-600">
                <XCircle className="w-5 h-5" />
                Cancelar Jogo
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  <strong>Atenção!</strong> Esta ação não pode ser desfeita.
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <p className="text-gray-700">
                  Você está prestes a cancelar o jogo de:
                </p>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-semibold text-gray-900">{jogoParaCancelar.nome}</p>
                  <p className="text-gray-600">{formatarWhatsApp(jogoParaCancelar.whatsapp)}</p>
                  <p className="text-green-600 font-medium">{formatarDinheiro(jogoParaCancelar.valor)}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setJogoParaCancelar(null)}
                  disabled={atualizando === jogoParaCancelar.id}
                >
                  Não, voltar
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  onClick={() => {
                    alterarStatus(jogoParaCancelar.id, "cancelado");
                    setJogoParaCancelar(null);
                  }}
                  disabled={atualizando === jogoParaCancelar.id}
                >
                  {atualizando === jogoParaCancelar.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Cancelando...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-2" />
                      Sim, cancelar
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
