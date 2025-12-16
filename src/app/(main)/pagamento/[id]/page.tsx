"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CartelaNumeros } from "@/components/bolao/CartelaNumeros";
import {
  ArrowLeft,
  Copy,
  Check,
  Clock,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { formatarDinheiro } from "@/lib/utils";

interface DadosJogo {
  id: string;
  nome: string;
  whatsapp: string;
  numeros: number[];
  valor: number;
  status: string;
  expiraEm: string;
  bolao: {
    id: string;
    nome: string;
    numero: number;
  };
  pix: {
    qrCode: string;
    pixCopiaECola: string;
  };
}

export default function PagamentoPage() {
  const params = useParams();
  const router = useRouter();
  const [jogo, setJogo] = useState<DadosJogo | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmando, setConfirmando] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [tempoRestante, setTempoRestante] = useState("");
  const [expirado, setExpirado] = useState(false);

  const jogoId = params.id as string;

  // Carregar dados do jogo
  useEffect(() => {
    async function carregarJogo() {
      try {
        const response = await fetch(`/api/jogo/${jogoId}`);
        if (response.ok) {
          const data = await response.json();
          setJogo(data);

          // Se já está validado, redireciona para confirmação
          if (data.status === "validado") {
            router.push(`/confirmacao/${jogoId}`);
          }
        } else {
          toast.error("Jogo não encontrado");
          router.push("/");
        }
      } catch (error) {
        console.error(error);
        toast.error("Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    }
    carregarJogo();
  }, [jogoId, router]);

  // Timer de expiração
  useEffect(() => {
    if (!jogo?.expiraEm) return;

    const interval = setInterval(() => {
      const diff = new Date(jogo.expiraEm).getTime() - Date.now();
      if (diff <= 0) {
        setTempoRestante("Expirado");
        setExpirado(true);
        clearInterval(interval);
        return;
      }
      const min = Math.floor(diff / 60000);
      const sec = Math.floor((diff % 60000) / 1000);
      setTempoRestante(`${min}:${sec.toString().padStart(2, "0")}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [jogo?.expiraEm]);

  // Copiar código PIX
  const copiarPix = async () => {
    if (!jogo?.pix.pixCopiaECola) return;
    await navigator.clipboard.writeText(jogo.pix.pixCopiaECola);
    setCopiado(true);
    toast.success("Código PIX copiado!");
    setTimeout(() => setCopiado(false), 3000);
  };

  // Simular/Confirmar pagamento
  const confirmarPagamento = async () => {
    setConfirmando(true);
    try {
      const response = await fetch(`/api/jogo/${jogoId}/confirmar`, {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Pagamento confirmado!");
        router.push(`/confirmacao/${jogoId}`);
      } else {
        const data = await response.json();
        toast.error(data.error || "Erro ao confirmar");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao confirmar pagamento");
    } finally {
      setConfirmando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!jogo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Jogo não encontrado</h2>
            <p className="text-gray-600 mb-4">
              Este jogo não existe ou foi removido.
            </p>
            <Button onClick={() => router.push("/")}>Voltar para Home</Button>
          </CardContent>
        </Card>
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
              <h1 className="text-xl font-bold">Pagamento PIX</h1>
              <p className="text-green-100 text-sm">
                {jogo.bolao.nome} • Jogo #{jogoId.slice(-8)}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Timer */}
          <Card
            className={`border ${
              expirado
                ? "border-red-200 bg-red-50"
                : "border-yellow-200 bg-yellow-50"
            }`}
          >
            <CardContent className="p-4">
              <div
                className={`flex items-center justify-center gap-2 ${
                  expirado ? "text-red-800" : "text-yellow-800"
                }`}
              >
                <Clock className="w-5 h-5" />
                <span>
                  {expirado ? (
                    "PIX expirado - Faça um novo jogo"
                  ) : (
                    <>
                      Tempo para pagar: <strong>{tempoRestante}</strong>
                    </>
                  )}
                </span>
              </div>
            </CardContent>
          </Card>

          {!expirado && (
            <>
              {/* QR Code */}
              <Card>
                <CardContent className="p-6 text-center">
                  <h2 className="text-lg font-semibold mb-4">
                    Escaneie o QR Code
                  </h2>
                  <div className="bg-white p-4 rounded-xl inline-block border">
                    <Image
                      src={jogo.pix.qrCode}
                      alt="QR Code PIX"
                      width={200}
                      height={200}
                      unoptimized
                    />
                  </div>
                  <p className="text-3xl font-bold text-green-600 mt-6">
                    {formatarDinheiro(jogo.valor)}
                  </p>
                </CardContent>
              </Card>

              {/* Copia e Cola */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-medium mb-3">Ou copie o código PIX:</h3>
                  <div className="bg-gray-100 rounded-lg p-3 text-sm text-gray-600 font-mono break-all">
                    {jogo.pix.pixCopiaECola.substring(0, 60)}...
                  </div>
                  <Button
                    className="w-full mt-4 h-12 bg-green-600 hover:bg-green-700"
                    onClick={copiarPix}
                  >
                    {copiado ? (
                      <>
                        <Check className="w-5 h-5 mr-2" /> Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5 mr-2" /> Copiar código PIX
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

          {/* Dados do Jogo */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-medium">Dados do jogo:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nome:</span>
                  <span className="font-medium">{jogo.nome}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">WhatsApp:</span>
                  <span className="font-medium">
                    ({jogo.whatsapp.slice(0, 2)}) {jogo.whatsapp.slice(2, 7)}-
                    {jogo.whatsapp.slice(7)}
                  </span>
                </div>
              </div>
              <hr />
              <div>
                <span className="text-gray-600 text-sm block mb-3">
                  Seus números:
                </span>
                <CartelaNumeros numeros={jogo.numeros} />
              </div>
            </CardContent>
          </Card>

          {/* Botão teste (remover em produção) */}
          {!expirado && (
            <Button
              variant="outline"
              className="w-full h-12 border-dashed"
              onClick={confirmarPagamento}
              disabled={confirmando}
            >
              {confirmando ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Confirmando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  [TESTE] Simular pagamento confirmado
                </>
              )}
            </Button>
          )}

          {expirado && (
            <Button
              className="w-full h-12 bg-green-600 hover:bg-green-700"
              onClick={() => router.push("/jogar")}
            >
              Fazer novo jogo
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
