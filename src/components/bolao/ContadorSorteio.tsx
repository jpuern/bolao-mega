"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface ContadorSorteioProps {
  dataEncerramento: string;
}

export function ContadorSorteio({ dataEncerramento }: ContadorSorteioProps) {
  const [tempoRestante, setTempoRestante] = useState({
    dias: 0,
    horas: 0,
    minutos: 0,
    segundos: 0,
  });
  const [encerrado, setEncerrado] = useState(false);

  useEffect(() => {
    const calcularTempo = () => {
      const agora = new Date().getTime();
      const fim = new Date(dataEncerramento).getTime();
      const diff = fim - agora;

      if (diff <= 0) {
        setEncerrado(true);
        return;
      }

      setTempoRestante({
        dias: Math.floor(diff / (1000 * 60 * 60 * 24)),
        horas: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutos: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        segundos: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    calcularTempo();
    const interval = setInterval(calcularTempo, 1000);

    return () => clearInterval(interval);
  }, [dataEncerramento]);

  if (encerrado) {
    return (
      <div className="bg-red-100 text-red-800 px-4 py-3 rounded-xl text-center">
        <p className="font-bold">Bolão Encerrado</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 rounded-xl p-4">
      <div className="flex items-center justify-center gap-2 text-gray-600 mb-3">
        <Clock className="w-4 h-4" />
        <span className="text-sm">Encerra em:</span>
      </div>
      <div className="flex justify-center gap-3">
        {[
          { valor: tempoRestante.dias, label: "dias" },
          { valor: tempoRestante.horas, label: "horas" },
          { valor: tempoRestante.minutos, label: "min" },
          { valor: tempoRestante.segundos, label: "seg" },
        ].map((item) => (
          <div key={item.label} className="text-center">
            <div className="bg-white rounded-lg px-3 py-2 shadow-sm">
              <span className="text-2xl font-bold text-gray-900">
                {item.valor.toString().padStart(2, "0")}
              </span>
            </div>
            <span className="text-xs text-gray-500 mt-1">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
