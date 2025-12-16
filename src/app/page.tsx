import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ContadorSorteio } from "@/components/bolao/ContadorSorteio";
import { buscarUltimoSorteio } from "@/lib/loterias-api";
import { formatarDinheiro } from "@/lib/utils";
import { Trophy, Users, Zap, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

async function buscarBolaoAtivo() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("boloes")
    .select("*")
    .eq("status", "ativo")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Erro ao buscar bolão:", error);
    return null;
  }

  return data;
}

async function buscarTotalJogos(bolaoId: string) {
  const supabase = await createClient();

  const { count } = await supabase
    .from("jogos")
    .select("*", { count: "exact", head: true })
    .eq("bolao_id", bolaoId)
    .eq("status", "validado");

  return count || 0;
}

export default async function HomePage() {
  const [sorteio, bolaoAtivo] = await Promise.all([
    buscarUltimoSorteio(),
    buscarBolaoAtivo(),
  ]);

  // Buscar total de jogos se houver bolão ativo
  const totalJogos = bolaoAtivo ? await buscarTotalJogos(bolaoAtivo.id) : 0;

  const valorJogo = bolaoAtivo?.valor_jogo || 50;
  const temBolaoAtivo = !!bolaoAtivo;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-600 to-green-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🎱</span>
            <span className="text-2xl font-bold text-white">Mega de Ouro</span>
          </div>
          <div className="flex gap-3">
            <Link href="/meus-jogos">
              <Button variant="ghost" className="text-white hover:bg-white/20">
                Meus Jogos
              </Button>
            </Link>
            <Link href="/jogar">
              <Button className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold">
                Jogar Agora
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Bolão Online da
            <span className="text-yellow-400"> Mega-Sena</span>
          </h1>
          <p className="text-xl text-green-100 max-w-2xl mx-auto">
            Participe do nosso bolão, escolha seus números e concorra a prêmios
            incríveis. Simples, seguro e transparente.
          </p>
        </div>

        {/* Card Principal */}
        <Card className="max-w-xl mx-auto shadow-2xl">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              {temBolaoAtivo ? (
                <>
                  <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Bolão Ativo
                  </div>

                  <div>
                    <p className="text-gray-600">{bolaoAtivo.nome}</p>
                    <p className="text-4xl font-bold text-gray-900">
                      Bolão #{bolaoAtivo.numero}
                    </p>
                  </div>

                  {bolaoAtivo.data_encerramento && (
                    <ContadorSorteio
                      dataEncerramento={bolaoAtivo.data_encerramento}
                    />
                  )}

                  <div className="pt-4 border-t">
                    <p className="text-gray-600">Prêmio Estimado</p>
                    <p className="text-3xl font-bold text-green-600">
                      {formatarDinheiro(sorteio?.valorAcumulado || 0)}
                    </p>
                  </div>

                  <Link href="/jogar" className="block">
                    <Button
                      size="lg"
                      className="w-full text-lg h-14 bg-green-600 hover:bg-green-700"
                    >
                      🎲 Fazer Meu Jogo - {formatarDinheiro(valorJogo)}
                    </Button>
                  </Link>

                  {/* Botão Ver Participantes */}
                  <Link href={`/bolao/${bolaoAtivo.id}/participantes`} className="block">
                    <Button
                      variant="outline"
                      className="w-full"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Ver participantes {totalJogos > 0 && `(${totalJogos})`}
                    </Button>
                  </Link>

                  <p className="text-sm text-gray-500">
                    Pagamento seguro via PIX • Validação automática
                  </p>
                </>
              ) : (
                <>
                  <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm font-medium">
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                    Nenhum bolão ativo
                  </div>

                  <div>
                    <p className="text-gray-600">Aguarde</p>
                    <p className="text-2xl font-bold text-gray-900">
                      Novo bolão em breve!
                    </p>
                  </div>

                  <p className="text-gray-500">
                    No momento não há bolões abertos para participação.
                    Volte mais tarde ou acompanhe suas apostas anteriores.
                  </p>

                  <Link href="/meus-jogos" className="block">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full text-lg h-14"
                    >
                      Ver Meus Jogos
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Último Resultado */}
        {sorteio && (
          <div className="max-w-xl mx-auto mt-8">
            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-6">
                <p className="text-green-100 text-center mb-4">
                  Último Resultado - Concurso {sorteio.concurso}
                </p>
                <div className="flex justify-center gap-2 flex-wrap">
                  {sorteio.dezenas.map((num) => (
                    <div
                      key={num}
                      className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-lg font-bold text-gray-900"
                    >
                      {num}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Features */}
        <div className="grid md:grid-cols-4 gap-6 mt-16">
          {[
            {
              icon: Zap,
              titulo: "Rápido",
              descricao: "Cadastre seu jogo em menos de 1 minuto",
            },
            {
              icon: Shield,
              titulo: "Seguro",
              descricao: "Pagamento via PIX com validação automática",
            },
            {
              icon: Users,
              titulo: "Transparente",
              descricao: "Acompanhe todos os jogos e resultados",
            },
            {
              icon: Trophy,
              titulo: "Premiação Justa",
              descricao: "Divisão clara dos prêmios entre ganhadores",
            },
          ].map((feature) => (
            <Card
              key={feature.titulo}
              className="bg-white/10 border-white/20 text-white"
            >
              <CardContent className="p-6 text-center">
                <feature.icon className="w-10 h-10 mx-auto mb-3 text-yellow-400" />
                <h3 className="font-bold text-lg mb-2">{feature.titulo}</h3>
                <p className="text-green-100 text-sm">{feature.descricao}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-12 border-t border-white/20">
        <p className="text-center text-green-100 text-sm">
          © 2025 Mega de Ouro. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
