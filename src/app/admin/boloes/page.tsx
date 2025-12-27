"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trophy,
  Calendar,
  Users,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Loader2,
  Search,
  Download,
  Filter,
} from "lucide-react";
import { formatarDinheiro } from "@/lib/utils";
import { toast } from "sonner";
import { Bolao, BolaoFormData } from "@/types";
import {
  listarBoloes,
  criarBolao,
  excluirBolao,
  atualizarBolao,
} from "@/lib/services/boloes";
import { exportToCSV, formatBolaoForExport } from "@/lib/utils/export";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function BoloesPage() {
  const [boloes, setBoloes] = useState<Bolao[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");

  // Modal criar bolão
  const [modalAberto, setModalAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState<BolaoFormData>({
    nome: "",
    numero: 1,
    valor_jogo: 5,
    taxa_organizador: 10,
    data_inicio: "",
    data_encerramento: "",
    status: "ativo",
  });

  // Modal resultado
  const [modalResultado, setModalResultado] = useState<Bolao | null>(null);
  const [numerosSorteados, setNumerosSorteados] = useState<number[]>([]);

  // Excluindo
  const [excluindo, setExcluindo] = useState<string | null>(null);

  // Carregar bolões
  const carregarBoloes = async () => {
    try {
      setLoading(true);
      const dados = await listarBoloes();
      setBoloes(dados);
    } catch (error) {
      toast.error("Erro ao carregar bolões");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarBoloes();
  }, []);

  // Criar bolão
  const handleCriarBolao = async () => {
    if (!form.nome.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    if (!form.data_inicio || !form.data_encerramento) {
      toast.error("Datas são obrigatórias");
      return;
    }

    try {
      setSalvando(true);
      const novoBolao = await criarBolao(form);
      setBoloes([novoBolao, ...boloes]);
      toast.success("Bolão criado com sucesso!");
      setModalAberto(false);
      setForm({
        nome: "",
        numero: boloes.length + 1,
        valor_jogo: 5,
        taxa_organizador: 10,
        data_inicio: "",
        data_encerramento: "",
        status: "ativo",
      });
    } catch (error) {
      toast.error("Erro ao criar bolão");
      console.error(error);
    } finally {
      setSalvando(false);
    }
  };

  // Excluir bolão
  const handleExcluir = async (bolao: Bolao) => {
    if (!confirm(`Excluir o bolão "${bolao.nome}"?`)) return;

    try {
      setExcluindo(bolao.id);
      await excluirBolao(bolao.id);
      setBoloes(boloes.filter((b) => b.id !== bolao.id));
      toast.success("Bolão excluído!");
    } catch (error) {
      toast.error("Erro ao excluir. Verifique se não há jogos vinculados.");
      console.error(error);
    } finally {
      setExcluindo(null);
    }
  };

  // Toggle número sorteado
  const toggleNumero = (num: number) => {
    if (numerosSorteados.includes(num)) {
      setNumerosSorteados(numerosSorteados.filter((n) => n !== num));
    } else if (numerosSorteados.length < 6) {
      setNumerosSorteados([...numerosSorteados, num].sort((a, b) => a - b));
    }
  };

  // Salvar resultado (TODO: integrar com tabela de sorteios)
  const salvarResultado = async () => {
    if (numerosSorteados.length !== 6) {
      toast.error("Selecione exatamente 6 números");
      return;
    }

    try {
      setSalvando(true);
      // Por enquanto, apenas encerra o bolão
      // TODO: Criar sorteio e calcular ganhadores
      if (modalResultado) {
        await atualizarBolao(modalResultado.id, { status: "encerrado" });
        setBoloes(
          boloes.map((b) =>
            b.id === modalResultado.id ? { ...b, status: "encerrado" } : b
          )
        );
      }
      toast.success("Resultado salvo! Bolão encerrado.");
      setModalResultado(null);
      setNumerosSorteados([]);
    } catch (error) {
      toast.error("Erro ao salvar resultado");
      console.error(error);
    } finally {
      setSalvando(false);
    }
  };

  // Exportar bolões
  const handleExportar = () => {
    const dadosExport = boloesFiltrados.map(formatBolaoForExport);
    exportToCSV(dadosExport, `boloes_${new Date().toISOString().split('T')[0]}`);
    toast.success("Bolões exportados com sucesso!");
  };

  // Filtrar bolões
  const boloesFiltrados = boloes.filter((b) => {
    const matchBusca = b.nome.toLowerCase().includes(busca.toLowerCase()) ||
      b.numero.toString().includes(busca);
    const matchStatus = filtroStatus === "todos" || b.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  // Formatadores
  const formatarData = (data: string) => {
    return new Date(data + "T00:00:00").toLocaleDateString("pt-BR");
  };

  const getStatusBadge = (status: string) => {
    const config = {
      ativo: { class: "bg-green-100 text-green-700", label: "Ativo" },
      encerrado: { class: "bg-gray-100 text-gray-700", label: "Encerrado" },
      cancelado: { class: "bg-red-100 text-red-700", label: "Cancelado" },
    };
    const s = config[status as keyof typeof config];
    return <Badge className={s.class}>{s.label}</Badge>;
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bolões</h1>
          <p className="text-gray-500 mt-1">Gerencie os bolões da Mega-Sena</p>
        </div>
        <Link href="/admin/boloes/novo">
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="w-5 h-5 mr-2" />
            Novo Bolão
          </Button>
        </Link>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Buscar por nome ou número..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="ativo">Ativos</SelectItem>
            <SelectItem value="encerrado">Encerrados</SelectItem>
            <SelectItem value="cancelado">Cancelados</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={handleExportar}
          disabled={boloesFiltrados.length === 0}
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Lista de Bolões */}
      {boloesFiltrados.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum bolão encontrado
            </h3>
            <p className="text-gray-500 mb-4">
              {busca
                ? "Tente buscar por outro termo"
                : "Crie seu primeiro bolão para começar"}
            </p>
            {!busca && (
              <Link href="/admin/boloes/novo">
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Bolão
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {boloesFiltrados.map((bolao) => (
            <Card key={bolao.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Trophy className="w-7 h-7 text-yellow-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-xl font-bold">{bolao.nome}</h3>
                        {getStatusBadge(bolao.status)}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Trophy className="w-4 h-4" />
                          Bolão #{bolao.concurso || bolao.numero || 'N/A'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Sorteio: {bolao.data_sorteio ? formatarData(bolao.data_sorteio) : 'N/A'}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {formatarDinheiro(bolao.valor_cota)}/jogo
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex gap-2 flex-wrap">
                    <Link href={`/admin/boloes/${bolao.id}/editar`}>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                    </Link>
                    {bolao.status === "ativo" && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setModalResultado(bolao);
                          setNumerosSorteados([]);
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Trophy className="w-4 h-4 mr-1" />
                        Resultado
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => handleExcluir(bolao)}
                      disabled={excluindo === bolao.id}
                    >
                      {excluindo === bolao.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Novo Bolão */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="w-full max-w-lg my-8">
            <CardHeader>
              <CardTitle>Criar Novo Bolão</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Nome */}
              <div className="space-y-2">
                <Label>Nome do Bolão *</Label>
                <Input
                  placeholder="Ex: Mega da Virada 2025"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                />
              </div>

              {/* Número */}
              <div className="space-y-2">
                <Label>Número do Bolão *</Label>
                <Input
                  type="number"
                  min="1"
                  value={form.numero}
                  onChange={(e) =>
                    setForm({ ...form, numero: parseInt(e.target.value) || 0 })
                  }
                />
              </div>

              {/* Datas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data Início *</Label>
                  <Input
                    type="date"
                    value={form.data_inicio}
                    onChange={(e) =>
                      setForm({ ...form, data_inicio: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data Encerramento *</Label>
                  <Input
                    type="date"
                    value={form.data_encerramento}
                    onChange={(e) =>
                      setForm({ ...form, data_encerramento: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Valores */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor do Jogo (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.valor_jogo}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        valor_jogo: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Taxa Organizador (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={form.taxa_organizador}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        taxa_organizador: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setModalAberto(false)}
                  disabled={salvando}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={handleCriarBolao}
                  disabled={salvando}
                >
                  {salvando ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Criar Bolão"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal Inserir Resultado */}
      {modalResultado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl my-8 bg-white shadow-2xl">
            <CardHeader className="border-b bg-gradient-to-r from-green-50 to-yellow-50">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Trophy className="w-5 h-5 text-yellow-600" />
                Inserir Resultado - {modalResultado.nome} ({numerosSorteados.length}/6)
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">Selecione os 6 números sorteados</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Números selecionados */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-3">Números Sorteados:</p>
                <div className="flex gap-3 min-h-[50px] flex-wrap">
                  {numerosSorteados.length > 0 ? (
                    numerosSorteados.map((num) => (
                      <div
                        key={num}
                        className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md"
                      >
                        {num.toString().padStart(2, "0")}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">Selecione 6 números abaixo</p>
                  )}
                </div>
              </div>

              {/* Grid de números */}
              <div className="grid grid-cols-10 gap-2">
                {Array.from({ length: 60 }, (_, i) => i + 1).map((num) => {
                  const selecionado = numerosSorteados.includes(num);
                  return (
                    <button
                      key={num}
                      onClick={() => toggleNumero(num)}
                      disabled={!selecionado && numerosSorteados.length >= 6}
                      className={`
                        aspect-square rounded-full font-bold text-sm
                        flex items-center justify-center transition-all
                        ${selecionado
                          ? "bg-green-600 text-white shadow-lg scale-110"
                          : "bg-white border-2 border-gray-300 text-gray-800 hover:border-green-500 hover:bg-green-50"
                        }
                        disabled:opacity-40 disabled:cursor-not-allowed
                      `}
                    >
                      {num.toString().padStart(2, "0")}
                    </button>
                  );
                })}
              </div>

              {/* Botões */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setModalResultado(null);
                    setNumerosSorteados([]);
                  }}
                  disabled={salvando}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={salvarResultado}
                  disabled={numerosSorteados.length !== 6 || salvando}
                >
                  {salvando ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Resultado"
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
