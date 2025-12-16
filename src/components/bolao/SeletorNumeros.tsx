// src/components/bolao/SeletorNumeros.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Shuffle, Trash2 } from "lucide-react";
import { cn, gerarNumerosAleatorios, formatarNumero } from "@/lib/utils";

interface SeletorNumerosProps {
  numerosSelecionados: number[];
  onChange: (numeros: number[]) => void;
  maxNumeros?: number;
}

export function SeletorNumeros({
  numerosSelecionados,
  onChange,
  maxNumeros = 10,
}: SeletorNumerosProps) {
  const toggleNumero = (num: number) => {
    if (numerosSelecionados.includes(num)) {
      onChange(numerosSelecionados.filter((n) => n !== num));
    } else if (numerosSelecionados.length < maxNumeros) {
      onChange([...numerosSelecionados, num].sort((a, b) => a - b));
    }
  };

  const completarAleatorio = () => {
    const faltam = maxNumeros - numerosSelecionados.length;
    if (faltam <= 0) return;

    const novos = gerarNumerosAleatorios(faltam, 60, numerosSelecionados);
    onChange([...numerosSelecionados, ...novos].sort((a, b) => a - b));
  };

  const limparTodos = () => {
    onChange([]);
  };

  return (
    <div className="space-y-4">
      {/* Contador */}
      <div className="flex items-center justify-between">
        <div className="text-lg">
          Selecionados:{" "}
          <span
            className={cn(
              "font-bold",
              numerosSelecionados.length === maxNumeros
                ? "text-green-600"
                : "text-gray-900"
            )}
          >
            {numerosSelecionados.length}/{maxNumeros}
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={limparTodos}
            disabled={numerosSelecionados.length === 0}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Limpar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={completarAleatorio}
            disabled={numerosSelecionados.length === maxNumeros}
          >
            <Shuffle className="w-4 h-4 mr-1" />
            Aleatório
          </Button>
        </div>
      </div>

      {/* Grade de números */}
      <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
        {Array.from({ length: 60 }, (_, i) => i + 1).map((num) => {
          const selecionado = numerosSelecionados.includes(num);
          const desabilitado =
            !selecionado && numerosSelecionados.length >= maxNumeros;

          return (
            <button
              key={num}
              onClick={() => toggleNumero(num)}
              disabled={desabilitado}
              className={cn(
                "aspect-square rounded-full text-sm sm:text-base font-bold transition-all",
                "flex items-center justify-center",
                "hover:scale-110 active:scale-95",
                "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100",
                selecionado
                  ? "bg-green-500 text-white shadow-lg ring-2 ring-green-300"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              {formatarNumero(num)}
            </button>
          );
        })}
      </div>

      {/* Preview dos selecionados */}
      {numerosSelecionados.length > 0 && (
        <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
          <p className="text-sm text-green-700 mb-3 font-medium">
            Seus números:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {numerosSelecionados.map((num) => (
              <span
                key={num}
                className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm"
              >
                {formatarNumero(num)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
