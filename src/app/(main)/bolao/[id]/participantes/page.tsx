"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Download,
  Users,
  Lock,
  Unlock,
  Loader2,
  Calendar,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { formatarDinheiro } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface Bolao {
  id: string;
  nome: string;
  concurso: string;
  status: string;
  data_sorteio: string;
  valor_cota: number;
}

interface Jogo {
  id: string;
  nome: string;
  numeros: number[];
  status: string;
  created_at: string;
}

export default function ParticipantesPage() {
  const params = useParams();
  const router = useRouter();
  const bolaoId = params.id as string;

  const [bolao, setBolao] = useState<Bolao | null>(null);
  const [jogos, setJogos] = useState<Jogo[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  // Verificar se pode mostrar números (após início do sorteio)
  const podeVerNumeros = () => {
    if (!bolao) return false;
    // Mostra números se bolão estiver encerrado ou sorteado
    if (bolao.status === "encerrado" || bolao.status === "sorteado") {
      return true;
    }
    // Ou se a data do sorteio já passou
    const agora = new Date();
    const dataSorteio = new Date(bolao.data_sorteio);
    return agora >= dataSorteio;
  };

  // Carregar dados
  useEffect(() => {
    async function carregar() {
      try {
        // Buscar bolão
        const { data: bolaoData, error: bolaoError } = await supabase
          .from("boloes")
          .select("id, nome, concurso, status, data_sorteio, valor_cota")
          .eq("id", bolaoId)
          .single();

        if (bolaoError || !bolaoData) {
          router.push("/");
          return;
        }

        setBolao(bolaoData);

        // Buscar jogos validados
        const { data: jogosData } = await supabase
          .from("jogos")
          .select("id, nome, numeros, status, created_at")
          .eq("bolao_id", bolaoId)
          .eq("status", "pago")
          .order("created_at", { ascending: true });

        setJogos(jogosData || []);
      } catch (error) {
        console.error("Erro ao carregar:", error);
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, [bolaoId, router, supabase]);

  // Gerar PDF
  const gerarPDF = () => {
    if (!bolao || jogos.length === 0) return;

    const doc = new jsPDF();
    const mostrarNumeros = podeVerNumeros();

    // Título
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(`Bolão ${bolao.nome}`, 14, 22);

    // Info do bolão
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Concurso: ${bolao.concurso}`, 14, 32);
    doc.text(
      `Data do Sorteio: ${new Date(bolao.data_sorteio).toLocaleDateString("pt-BR")}`,
      14,
      38
    );
    doc.text(`Total de Jogos: ${jogos.length}`, 14, 44);
    doc.text(
      `Valor Arrecadado: ${formatarDinheiro(jogos.length * bolao.valor_cota)}`,
      14,
      50
    );
    doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 14, 56);

    // Linha separadora
    doc.setLineWidth(0.5);
    doc.line(14, 61, 196, 61);

    // Tabela de jogos
    const dadosTabela = jogos.map((jogo, index) => [
      (index + 1).toString().padStart(3, "0"),
      jogo.nome,
      mostrarNumeros
        ? jogo.numeros.map((n) => n.toString().padStart(2, "0")).join(" - ")
        : "🔒 Números ocultos até o sorteio",
      new Date(jogo.created_at).toLocaleDateString("pt-BR"),
    ]);

    autoTable(doc, {
      startY: 66,
      head: [["#", "Participante", "Números", "Data"]],
      body: dadosTabela,
      theme: "grid",
      headStyles: {
        fillColor: [34, 197, 94], // Verde
        textColor: 255,
        fontStyle: "bold",
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 15, halign: "center" },
        1: { cellWidth: 50 },
        2: { cellWidth: 85 },
        3: { cellWidth: 30, halign: "center" },
      },
    });

    // Rodapé
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128);
      doc.text(
        `Bolão Mega de Ouro - Página ${i} de ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );
    }

    // Download
    doc.save(`bolao-${bolao.concurso}-participantes.pdf`);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!bolao) {
    return null;
  }

  const mostrarNumeros = podeVerNumeros();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="container mx-auto px-4 py-8">
          <Link
            href="/"
            className="inline-flex items-center text-green-100 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Link>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge className="bg-white/20 text-white hover:bg-white/30">
                  Concurso {bolao.concurso}
                </Badge>
                <Badge
                  className={
                    bolao.status === "ativo"
                      ? "bg-green-400 text-green-900"
                      : "bg-gray-400 text-gray-900"
                  }
                >
                  {bolao.status === "ativo" ? "Em andamento" : bolao.status}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold">{bolao.nome}</h1>
              <p className="text-green-100 mt-1 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Sorteio: {new Date(bolao.data_sorteio).toLocaleDateString("pt-BR")}
              </p>
            </div>

            <Button
              onClick={gerarPDF}
              className="bg-white text-green-700 hover:bg-green-50"
              disabled={jogos.length === 0}
            >
              <Download className="w-5 h-5 mr-2" />
              Baixar PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{jogos.length}</p>
              <p className="text-sm text-gray-500">Participantes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{jogos.length * 10}</p>
              <p className="text-sm text-gray-500">Números jogados</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">
                {formatarDinheiro(jogos.length * bolao.valor_cota)}
              </p>
              <p className="text-sm text-gray-500">Arrecadado</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              {mostrarNumeros ? (
                <Unlock className="w-8 h-8 text-green-600 mx-auto mb-2" />
              ) : (
                <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              )}
              <p className="text-sm font-medium">
                {mostrarNumeros ? "Números visíveis" : "Números ocultos"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Distribuição do Prêmio */}
        <Card className="mb-6 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Trophy className="w-5 h-5" />
              Distribuição do Prêmio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="font-semibold text-gray-900">Prêmio Total:</span>
                <span className="text-2xl font-bold text-green-700">
                  {formatarDinheiro(jogos.length * bolao.valor_cota)}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center p-2 bg-white rounded">
                  <span className="text-gray-700">🏆 10 acertos (1º lugar)</span>
                  <span className="font-semibold text-green-700">
                    70% = {formatarDinheiro((jogos.length * bolao.valor_cota) * 0.7 * 0.9)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white rounded">
                  <span className="text-gray-700">🥈 9 acertos (2º lugar)</span>
                  <span className="font-semibold text-green-700">
                    10% = {formatarDinheiro((jogos.length * bolao.valor_cota) * 0.1 * 0.9)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white rounded">
                  <span className="text-gray-700">🥉 Menos acertos (3º lugar)</span>
                  <span className="font-semibold text-green-700">
                    20% = {formatarDinheiro((jogos.length * bolao.valor_cota) * 0.2 * 0.9)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-100 rounded">
                  <span className="text-gray-700">👤 Taxa do organizador</span>
                  <span className="font-semibold text-gray-700">
                    10% = {formatarDinheiro((jogos.length * bolao.valor_cota) * 0.1)}
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-600 mt-3 pt-3 border-t">
                💡 Em caso de empate, o prêmio será dividido igualmente entre os ganhadores
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Aviso sobre números */}
        {!mostrarNumeros && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="p-4 flex items-center gap-3">
              <Lock className="w-6 h-6 text-yellow-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-yellow-800">
                  Números ocultos para garantir transparência
                </p>
                <p className="text-sm text-yellow-700">
                  Os números de cada participante serão revelados apenas após o
                  início do sorteio oficial da Mega-Sena.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de participantes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Participantes ({jogos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {jogos.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Nenhum participante ainda</p>
                <p className="text-sm">Seja o primeiro a participar!</p>
                <Link href="/jogar">
                  <Button className="mt-4 bg-green-600 hover:bg-green-700">
                    Fazer meu jogo
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {jogos.map((jogo, index) => (
                  <div
                    key={jogo.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 rounded-lg gap-3"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center font-bold text-green-700">
                        {(index + 1).toString().padStart(2, "0")}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {jogo.nome}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatarData(jogo.created_at)}
                        </p>
                      </div>
                    </div>

                    {/* Números */}
                    <div className="flex flex-wrap gap-1.5 md:gap-2">
                      {mostrarNumeros ? (
                        jogo.numeros.map((num) => (
                          <div
                            key={num}
                            className="w-8 h-8 md:w-9 md:h-9 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-xs md:text-sm"
                          >
                            {num.toString().padStart(2, "0")}
                          </div>
                        ))
                      ) : (
                        <>
                          {Array.from({ length: 10 }).map((_, i) => (
                            <div
                              key={i}
                              className="w-8 h-8 md:w-9 md:h-9 bg-gray-300 rounded-full flex items-center justify-center"
                            >
                              <Lock className="w-3 h-3 text-gray-500" />
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* CTA */}
        {bolao.status === "ativo" && (
          <div className="mt-8 text-center">
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-2">Quer participar?</h3>
                <p className="text-green-100 mb-4">
                  Faça seu jogo agora por apenas{" "}
                  {formatarDinheiro(bolao.valor_cota)}
                </p>
                <Link href="/jogar">
                  <Button
                    size="lg"
                    className="bg-white text-green-600 hover:bg-green-50"
                  >
                    Fazer meu jogo
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
