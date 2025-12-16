// src/components/bolao/CartelaNumeros.tsx
import { cn, formatarNumero } from "@/lib/utils";

interface CartelaNumerosProps {
  numeros: number[];
  resultado?: number[];
  tamanho?: "sm" | "md" | "lg";
}

export function CartelaNumeros({
  numeros,
  resultado,
  tamanho = "md",
}: CartelaNumerosProps) {
  const tamanhos = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };

  const isAcerto = (num: number) => resultado?.includes(num);

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {numeros.map((num) => (
        <div
          key={num}
          className={cn(
            tamanhos[tamanho],
            "rounded-full flex items-center justify-center font-bold transition-all",
            resultado
              ? isAcerto(num)
                ? "bg-green-500 text-white ring-2 ring-green-300 scale-110"
                : "bg-gray-200 text-gray-500"
              : "bg-green-500 text-white"
          )}
        >
          {formatarNumero(num)}
        </div>
      ))}
    </div>
  );
}
