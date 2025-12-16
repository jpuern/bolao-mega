"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CartelaNumeros } from "@/components/bolao/CartelaNumeros";
import {
  CheckCircle2,
  Home,
  Share2,
  Loader2,
  AlertCircle,
  Calendar,
  User,
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
  criadoEm: string;
  bolao: {
    id: string;
    nome: string;
    numero: number;
  };
}

export default function ConfirmacaoPage() {
  const params = useParams();
  const router = useRouter();
  const jogoId = params.id as string;

  const [jogo, setJogo] = useState<DadosJogo | null>(null);
  const [loading, setLoading] = useState(true);

  // Carregar dados do jogo
  useEffect(() => {
    async function carregarJogo() {
      try {
        const response = await fetch(`/api/jogo/${jogoId}`);
        if (response.ok) {
          const data = await response.json();
          setJogo(data);

          // Se não está validado, redireciona para pagamento
          if (data.status !== "validado") {
            router.push(`/pagamento/${jogoId}`);
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

  const compartilhar = async () => {
    if (!jogo) return;

    const texto = `🍀 Fiz meu jogo no Bolão ${jogo.bolao.nome}!\n\n🎱 Meus números: ${jogo.numeros.join(", ")}\n\n💰 Boa sorte pra nós! 🤞`;

    if (navigator.share) {
      try {
        await navigator.share({ text: texto });
      } catch {
        // Usuário cancelou
      }
    } else {
      await navigator.clipboard.writeText(texto);
      toast.success("Texto copiado para compartilhar!");
    }
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-500 to-green-600 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  if (!jogo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-b from-green-500 to-green-600">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-lg mx-auto text-center">
          {/* Ícone de sucesso */}
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg animate-bounce">
            <CheckCircle2 className="w-14 h-14 text-green-500" />
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">
            Jogo Confirmado! 🎉
          </h1>
          <p className="text-green-100 text-lg mb-8">
            Pagamento recebido com sucesso!
          </p>

          {/* Card com dados do jogo */}
          <Card className="mb-6 shadow-xl">
            <CardContent className="p-6">
              <div className="text-left space-y-4">
                {/* Bolão */}
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-green-800 font-medium">
                    {jogo.bolao.nome}
                  </p>
                  <p className="text-green-600 text-sm">
                    Bolão #{jogo.bolao.numero}
                  </p>
                </div>

                {/* Código */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Código do jogo:</span>
                  <span className="font-mono font-bold text-green-600">
                    #{jogoId.slice(-8).toUpperCase()}
                  </span>
                </div>

                <hr />

                {/* Dados do participante */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">Nome:</span>
                    <span className="font-medium ml-auto">{jogo.nome}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">Data:</span>
                    <span className="font-medium ml-auto">
                      {formatarData(jogo.criadoEm)}
                    </span>
                  </div>
                </div>

                <hr />

                {/* Números */}
                <div>
                  <p className="text-gray-500 text-sm mb-3">Seus números da sorte:</p>
                  <CartelaNumeros numeros={jogo.numeros} />
                </div>

                <hr />

                {/* Valor */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Valor pago:</span>
                  <span className="font-bold text-green-600 text-lg">
                    {formatarDinheiro(jogo.valor)}
                  </span>
                </div>

                {/* Status */}
                <div className="bg-green-100 rounded-lg p-3 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-green-800 font-medium">
                    Pagamento confirmado
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Aviso WhatsApp */}
          <Card className="mb-6 bg-white/10 border-white/20">
            <CardContent className="p-4">
              <p className="text-white text-sm">
                📱 Você receberá uma confirmação no WhatsApp cadastrado
              </p>
            </CardContent>
          </Card>

          {/* Botões */}
          <div className="space-y-3">
            <Button
              className="w-full h-14 bg-white text-green-600 hover:bg-green-50 font-bold"
              onClick={compartilhar}
            >
              <Share2 className="w-5 h-5 mr-2" />
              Compartilhar meu jogo
            </Button>

            <Button
              variant="outline"
              className="w-full h-14 border-white text-white hover:bg-white/20"
              onClick={() => router.push("/jogar")}
            >
              🎲 Fazer outro jogo
            </Button>

            <Button
              variant="ghost"
              className="w-full h-12 text-white/80 hover:text-white hover:bg-white/10"
              onClick={() => router.push("/")}
            >
              <Home className="w-5 h-5 mr-2" />
              Voltar ao início
            </Button>
          </div>

          {/* Boa sorte */}
          <p className="text-white/80 text-sm mt-8">
            🍀 Boa sorte! O resultado será divulgado após o sorteio oficial da Mega-Sena.
          </p>
        </div>
      </div>
    </div>
  );
}
