"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { buscarBolao, atualizarBolao } from "@/lib/services/boloes";
import { BolaoFormData } from "@/types";

export default function EditarBolaoPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const [form, setForm] = useState<BolaoFormData>({
    nome: "",
    numero: 1,
    valor_jogo: 5,
    taxa_organizador: 10,
    data_inicio: "",
    data_encerramento: "",
    status: "ativo",
  });

  // Carregar bolão
  useEffect(() => {
    const carregar = async () => {
      try {
        const bolao = await buscarBolao(id);
        console.log('📝 [Editar Bolão] Dados carregados:', bolao);

        // Mapear campos do banco para o formulário
        setForm({
          nome: bolao.nome,
          numero: bolao.concurso ? parseInt(bolao.concurso) : bolao.numero,
          valor_jogo: bolao.valor_cota,
          taxa_organizador: bolao.taxa_organizador || 10,
          data_inicio: bolao.data_sorteio || '', // Usar data_sorteio como data_inicio
          data_encerramento: bolao.data_sorteio || '',
          status: bolao.status,
        });
      } catch (error) {
        setErro("Bolão não encontrado");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    // Validações
    if (!form.nome.trim()) {
      setErro("Nome é obrigatório");
      return;
    }
    if (form.numero <= 0) {
      setErro("Número do bolão é obrigatório");
      return;
    }
    if (!form.data_inicio) {
      setErro("Data de início é obrigatória");
      return;
    }
    if (!form.data_encerramento) {
      setErro("Data de encerramento é obrigatória");
      return;
    }
    if (form.valor_jogo <= 0) {
      setErro("Valor do jogo deve ser maior que zero");
      return;
    }

    try {
      setSalvando(true);
      await atualizarBolao(id, form);
      router.push("/admin/boloes");
    } catch (error) {
      setErro("Erro ao atualizar bolão. Tente novamente.");
      console.error(error);
    } finally {
      setSalvando(false);
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
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/boloes"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Editar Bolão</h1>
        <p className="text-gray-600">Atualize as informações do bolão</p>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border p-6 space-y-4">
        {/* Nome */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome do Bolão *
          </label>
          <input
            type="text"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Ex: Mega da Virada 2025"
          />
        </div>

        {/* Número do Bolão */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número do Bolão *
          </label>
          <input
            type="number"
            min="1"
            value={form.numero}
            onChange={(e) => setForm({ ...form, numero: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="1"
          />
        </div>

        {/* Datas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de Início *
            </label>
            <input
              type="date"
              value={form.data_inicio}
              onChange={(e) => setForm({ ...form, data_inicio: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de Encerramento *
            </label>
            <input
              type="date"
              value={form.data_encerramento}
              onChange={(e) => setForm({ ...form, data_encerramento: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        {/* Valores */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor do Jogo (R$) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.valor_jogo}
              onChange={(e) =>
                setForm({ ...form, valor_jogo: parseFloat(e.target.value) || 0 })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="5.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Taxa do Organizador (%)
            </label>
            <input
              type="number"
              step="1"
              min="0"
              max="100"
              value={form.taxa_organizador}
              onChange={(e) =>
                setForm({ ...form, taxa_organizador: parseFloat(e.target.value) || 0 })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="10"
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={form.status}
            onChange={(e) =>
              setForm({
                ...form,
                status: e.target.value as "ativo" | "encerrado" | "cancelado",
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="ativo">Ativo</option>
            <option value="encerrado">Encerrado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        {/* Erro */}
        {erro && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
            {erro}
          </div>
        )}

        {/* Botões */}
        <div className="flex gap-3 pt-4">
          <Link href="/admin/boloes" className="flex-1">
            <Button type="button" variant="outline" className="w-full">
              Cancelar
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={salvando}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {salvando ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
