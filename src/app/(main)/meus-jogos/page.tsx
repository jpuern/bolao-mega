"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Loader2,
  Phone,
  Calendar,
  Ticket,
  Lock,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { formatarDinheiro } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface Bolao {
  id: string;
  nome: string;
  status: string;
  data_sorteio: string;
}

interface Jogo {
  id: string;
  nome: string;
  numeros: number[];
  valor: number;
  status: string;
  created_at: string;
  bolao: Bolao | null;
}

export default function MeusJogosPage() {
  const [whatsapp, setWhatsapp] = useState("");
  const [jogos, setJogos] = useState<Jogo[]>([]);
  const [loading, setLoading] = useState(false);
  const [buscou, setBuscou] = useState(false);

  const supabase = createClient();

  // Formatar input de WhatsApp
  const formatarInputWhatsApp = (valor: string) => {
    // Remove tudo que não é número
    const numeros = valor.replace(/\D/g, "");

    // Limita a 11 dígitos
    const limitado = numeros.slice(0, 11);

    // Formata: (88) 99999-9999
    if (limitado.length <= 2) {
      return limitado;
    } else if (limitado.length <= 7) {
      return `(${limitado.slice(0, 2)}) ${limitado.slice(2)}`;
    } else {
      return `(${limitado.slice(0, 2)}) ${limitado.slice(2, 7)}-${limitado.slice(7)}`;
    }
  };

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWhatsapp(formatarInputWhatsApp(e.target.value));
  };

  // Buscar jogos
  const buscarJogos = async () => {
    const numeroLimpo = whatsapp.replace(/\D/g, "");

    if (numeroLimpo.length !== 11) {
      return;
    }

    setLoading(true);
    setBuscou(true);

    try {
      const { data, error } = await supabase
        .from("jogos")
        .select(`
          id,
          nome,
          numeros,
          valor,
          status,
          created_at,
          bolao:boloes(id, nome, status, data_sorteio)
        `)
        .eq("whatsapp", numeroLimpo)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transformar dados
      const jogosFormatados = (data || []).map((jogo) => ({
        ...jogo,
        bolao: Array.isArray(jogo.bolao) ? jogo.bolao[0] || null : jogo.bolao,
      }));

      setJogos(jogosFormatados);
    } catch (error) {
      console.error("Erro ao buscar jogos:", error);
    } finally {
      setLoading(false);
    }
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
          <Badge className="bg-green-100 text-green-700">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Confirmado
          </Badge>
        );
      case "pendente":
        return (
          <Badge className="bg-yellow-100 text-yellow-700">
            <Clock className="w-3 h-3 mr-1" />
            Aguardando pagamento
          </Badge>
        );
      case "cancelado":
        return (
          <Badge className="bg-red-100 text-red-700">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelado
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Estatísticas
  const stats = {
    total: jogos.length,
    confirmados: jogos.filter((j) => j.status === "pago").length,
    pendentes: jogos.filter((j) => j.status === "pendente").length,
    investido: jogos
      .filter((j) => j.status === "pago")
      .reduce((acc, j) => acc + j.valor, 0),
  };

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
            Voltar para início
          </Link>

          <h1 className="text-3xl font-bold">Meus Jogos</h1>
          <p className="text-green-100 mt-1">
            Consulte todos os seus jogos pelo WhatsApp
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Busca */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-green-600" />
              Digite seu WhatsApp
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder="(88) 99999-9999"
                value={whatsapp}
                onChange={handleWhatsAppChange}
                className="text-lg"
                onKeyDown={(e) => e.key === "Enter" && buscarJogos()}
              />
              <Button
                onClick={buscarJogos}
                disabled={whatsapp.replace(/\D/g, "").length !== 11 || loading}
                className="bg-green-600 hover:bg-green-700 px-6"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Use o mesmo número cadastrado na hora do jogo
            </p>
          </CardContent>
        </Card>

        {/* Resultados */}
        {buscou && !loading && (
          <>
            {jogos.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    Nenhum jogo encontrado
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Não encontramos jogos para este WhatsApp.
                    <br />
                    Verifique se digitou corretamente.
                  </p>
                  <Link href="/jogar">
                    <Button className="bg-green-600 hover:bg-green-700">
                      Fazer meu primeiro jogo
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Estatísticas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold">{stats.total}</p>
                      <p className="text-xs text-gray-500">Total</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {stats.confirmados}
                      </p>
                      <p className="text-xs text-gray-500">Confirmados</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-yellow-600">
                        {stats.pendentes}
                      </p>
                      <p className="text-xs text-gray-500">Pendentes</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {formatarDinheiro(stats.investido)}
                      </p>
                      <p className="text-xs text-gray-500">Investido</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Lista de jogos */}
                <div className="space-y-4">
                  {jogos.map((jogo) => (
                    <Card key={jogo.id} className="overflow-hidden">
                      {/* Header do card */}
                      <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-700">
                            {jogo.bolao?.nome || "Bolão"}
                          </span>
                        </div>
                        {getStatusBadge(jogo.status)}
                      </div>

                      <CardContent className="p-4">
                        {/* Info */}
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatarData(jogo.created_at)}
                          </span>
                          <span className="font-medium text-green-600">
                            {formatarDinheiro(jogo.valor)}
                          </span>
                        </div>

                        {/* Números */}
                        <div>
                          <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                            <Ticket className="w-4 h-4" />
                            Seus números:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {jogo.numeros.map((num) => (
                              <div
                                key={num}
                                className="w-9 h-9 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm"
                              >
                                {num.toString().padStart(2, "0")}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Data do sorteio */}
                        {jogo.bolao && (
                          <div className="mt-4 pt-4 border-t text-sm text-gray-500">
                            Sorteio:{" "}
                            <span className="font-medium">
                              {new Date(jogo.bolao.data_sorteio).toLocaleDateString(
                                "pt-BR",
                                {
                                  weekday: "long",
                                  day: "2-digit",
                                  month: "long",
                                }
                              )}
                            </span>
                          </div>
                        )}

                        {/* Aviso de pendente */}
                        {jogo.status === "pendente" && (
                          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <p className="text-sm text-yellow-800">
                              ⚠️ Seu jogo ainda não foi confirmado. Efetue o
                              pagamento e envie o comprovante.
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* CTA para novo jogo */}
                <Card className="mt-8 bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
                  <CardContent className="p-6 text-center">
                    <h3 className="text-xl font-bold mb-2">
                      Quer aumentar suas chances?
                    </h3>
                    <p className="text-green-100 mb-4">
                      Faça mais jogos e multiplique suas possibilidades!
                    </p>
                    <Link href="/jogar">
                      <Button className="bg-white text-green-600 hover:bg-green-50">
                        Fazer novo jogo
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
