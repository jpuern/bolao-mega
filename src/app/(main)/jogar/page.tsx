"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SeletorNumeros } from "@/components/bolao/SeletorNumeros";
import { CartelaNumeros } from "@/components/bolao/CartelaNumeros";
import { ArrowLeft, ArrowRight, Check, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { CONFIG } from "@/constants";
import { formatarDinheiro } from "@/lib/utils";
import { Bolao } from "@/types";
import { createClient } from "@/lib/supabase/client";

type Etapa = "dados" | "numeros" | "confirmacao";

export default function JogarPage() {
  const router = useRouter();
  const [etapa, setEtapa] = useState<Etapa>("dados");
  const [loading, setLoading] = useState(false);
  const [carregando, setCarregando] = useState(true);

  // Bolão ativo
  const [bolaoAtivo, setBolaoAtivo] = useState<Bolao | null>(null);

  // Dados do formulário
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [numeros, setNumeros] = useState<number[]>([]);

  // Buscar bolão ativo
  useEffect(() => {
    const buscarBolao = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("boloes")
          .select("*")
          .eq("status", "ativo")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== "PGRST116") {
          throw error;
        }

        setBolaoAtivo(data);
      } catch (error) {
        console.error("Erro ao buscar bolão:", error);
        toast.error("Erro ao carregar bolão");
      } finally {
        setCarregando(false);
      }
    };

    buscarBolao();
  }, []);

  // Valor do jogo (do bolão ou padrão)
  const valorJogo = bolaoAtivo?.valor_jogo || CONFIG.VALOR_JOGO_PADRAO;

  // Validações
  const dadosValidos = nome.trim().length >= 3 && whatsapp.replace(/\D/g, "").length === 11;
  const numerosValidos = numeros.length === CONFIG.NUMEROS_POR_JOGO;

  // Formatar WhatsApp enquanto digita
  const formatarWhatsApp = (valor: string) => {
    const limpo = valor.replace(/\D/g, "").slice(0, 11);
    if (limpo.length <= 2) return limpo;
    if (limpo.length <= 7) return `(${limpo.slice(0, 2)}) ${limpo.slice(2)}`;
    return `(${limpo.slice(0, 2)}) ${limpo.slice(2, 7)}-${limpo.slice(7)}`;
  };

  // Avançar etapa
  const avancar = () => {
    if (etapa === "dados" && dadosValidos) {
      setEtapa("numeros");
    } else if (etapa === "numeros" && numerosValidos) {
      setEtapa("confirmacao");
    }
  };

  // Voltar etapa
  const voltar = () => {
    if (etapa === "numeros") setEtapa("dados");
    if (etapa === "confirmacao") setEtapa("numeros");
  };

  // Finalizar e ir para pagamento
  const finalizarJogo = async () => {
    if (!bolaoAtivo) {
      toast.error("Nenhum bolão ativo no momento");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/pagamento/criar-pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bolaoId: bolaoAtivo.id,
          nome: nome.trim(),
          whatsapp: whatsapp.replace(/\D/g, ""),
          numeros,
          valor: valorJogo,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao criar jogo");
      }

      const data = await response.json();

      // Redirecionar para página de pagamento
      router.push(`/pagamento/${data.jogoId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao processar jogo. Tente novamente.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Loading inicial
  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  // Sem bolão ativo
  if (!bolaoAtivo) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-green-600 text-white py-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => router.push("/")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-bold">Fazer Jogo</h1>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Nenhum bolão ativo
              </h2>
              <p className="text-gray-600 mb-6">
                No momento não há bolões abertos para participação. 
                Volte mais tarde!
              </p>
              <Button
                onClick={() => router.push("/")}
                className="bg-green-600 hover:bg-green-700"
              >
                Voltar para Home
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-600 text-white py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Fazer Jogo</h1>
              <p className="text-green-100 text-sm">
                {etapa === "dados" && "Passo 1 de 3 - Seus dados"}
                {etapa === "numeros" && "Passo 2 de 3 - Escolha os números"}
                {etapa === "confirmacao" && "Passo 3 de 3 - Confirmação"}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-green-700">
        <div className="container mx-auto px-4">
          <div className="flex">
            {["dados", "numeros", "confirmacao"].map((step, index) => (
              <div
                key={step}
                className={`h-1 flex-1 transition-colors ${
                  ["dados", "numeros", "confirmacao"].indexOf(etapa) >= index
                    ? "bg-yellow-400"
                    : "bg-green-800"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Info do Bolão */}
      <div className="bg-green-50 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-green-800">
              <strong>{bolaoAtivo.nome}</strong> • Bolão #{bolaoAtivo.numero}
            </span>
            <span className="font-bold text-green-700">
              {formatarDinheiro(valorJogo)}
            </span>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6">
            {/* ETAPA 1: Dados */}
            {etapa === "dados" && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Seus Dados
                  </h2>
                  <p className="text-gray-600 mt-2">
                    Informe seu nome e WhatsApp para participar
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome" className="text-base">
                      Nome completo
                    </Label>
                    <Input
                      id="nome"
                      placeholder="Digite seu nome"
                      value={nome}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNome(e.target.value)}
                      className="h-12 text-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp" className="text-base">
                      WhatsApp
                    </Label>
                    <Input
                      id="whatsapp"
                      placeholder="(88) 99999-9999"
                      value={whatsapp}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWhatsapp(formatarWhatsApp(e.target.value))}
                      className="h-12 text-lg"
                    />
                    <p className="text-sm text-gray-500">
                      Você receberá a confirmação do jogo por WhatsApp
                    </p>
                  </div>
                </div>

                <Button
                  className="w-full h-14 text-lg bg-green-600 hover:bg-green-700"
                  onClick={avancar}
                  disabled={!dadosValidos}
                >
                  Continuar
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            )}

            {/* ETAPA 2: Números */}
            {etapa === "numeros" && (
              <div className="space-y-6">
                <div className="text-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Escolha seus números
                  </h2>
                  <p className="text-gray-600 mt-2">
                    Selecione {CONFIG.NUMEROS_POR_JOGO} números de 01 a 60
                  </p>
                </div>

                <SeletorNumeros
                  numerosSelecionados={numeros}
                  onChange={setNumeros}
                  maxNumeros={CONFIG.NUMEROS_POR_JOGO}
                />

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 h-14 text-lg"
                    onClick={voltar}
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Voltar
                  </Button>
                  <Button
                    className="flex-1 h-14 text-lg bg-green-600 hover:bg-green-700"
                    onClick={avancar}
                    disabled={!numerosValidos}
                  >
                    Continuar
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* ETAPA 3: Confirmação */}
            {etapa === "confirmacao" && (
              <div className="space-y-6">
                <div className="text-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Confirme seu jogo
                  </h2>
                  <p className="text-gray-600 mt-2">
                    Revise os dados antes de pagar
                  </p>
                </div>

                {/* Resumo */}
                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Bolão:</span>
                    <span className="font-medium">{bolaoAtivo.nome}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Nome:</span>
                    <span className="font-medium">{nome}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">WhatsApp:</span>
                    <span className="font-medium">{whatsapp}</span>
                  </div>
                  <hr />
                  <div>
                    <span className="text-gray-600 block mb-3">Seus números:</span>
                    <CartelaNumeros numeros={numeros} />
                  </div>
                  <hr />
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-medium">Total a pagar:</span>
                    <span className="font-bold text-green-600 text-2xl">
                      {formatarDinheiro(valorJogo)}
                    </span>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <p className="text-yellow-800 text-sm text-center">
                    ⚠️ Após o pagamento, o jogo não poderá ser alterado
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 h-14 text-lg"
                    onClick={voltar}
                    disabled={loading}
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Voltar
                  </Button>
                  <Button
                    className="flex-1 h-14 text-lg bg-green-600 hover:bg-green-700"
                    onClick={finalizarJogo}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Pagar com PIX
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
