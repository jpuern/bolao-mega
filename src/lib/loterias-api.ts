import { SorteioAPI } from "@/types";

const API_URL = "https://loteriascaixa-api.herokuapp.com/api/mega-sena";

export async function buscarUltimoSorteio(): Promise<SorteioAPI | null> {
  try {
    const res = await fetch(`${API_URL}/latest`, {
      next: { revalidate: 3600 }, // Cache de 1 hora
    });

    if (!res.ok) return null;

    const data = await res.json();

    return {
      concurso: data.concurso,
      data: data.data,
      dezenas: data.dezenas,
      acumulou: data.acumulou,
      valorAcumulado: data.valorAcumuladoProximoConcurso || 0,
      proximoConcurso: data.concurso + 1,
      dataProximoConcurso: data.dataProximoConcurso,
    };
  } catch (error) {
    console.error("Erro ao buscar sorteio:", error);
    return null;
  }
}

export async function buscarSorteioPorConcurso(
  concurso: number
): Promise<SorteioAPI | null> {
  try {
    const res = await fetch(`${API_URL}/${concurso}`, {
      next: { revalidate: 86400 }, // Cache de 24h para sorteios antigos
    });

    if (!res.ok) return null;

    const data = await res.json();

    return {
      concurso: data.concurso,
      data: data.data,
      dezenas: data.dezenas,
      acumulou: data.acumulou,
      valorAcumulado: data.valorAcumuladoProximoConcurso || 0,
      proximoConcurso: data.concurso + 1,
      dataProximoConcurso: data.dataProximoConcurso,
    };
  } catch (error) {
    console.error("Erro ao buscar sorteio:", error);
    return null;
  }
}
