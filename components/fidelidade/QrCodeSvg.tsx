"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import Image from "next/image";

interface QrCodeSvgProps {
  value: string;
  size?: number;
  className?: string;
  showLogo?: boolean;
}

// Gerador oficial e 100% escaneável de QR Code ISO/IEC com alto contraste e correção de erros Nível H
export function QrCodeSvg({
  value,
  size = 240,
  className = "",
  showLogo = true,
}: QrCodeSvgProps) {
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    if (!value) return;

    QRCode.toDataURL(value, {
      errorCorrectionLevel: "H", // Permite logo central sem danificar a leitura
      margin: 1,
      width: size * 2, // 2x para retina/alta densidade de pixels
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    })
      .then((url) => {
        setDataUrl(url);
      })
      .catch((err) => {
        console.error("Erro ao gerar QR Code:", err);
      });
  }, [value, size]);

  return (
    <div
      className={`relative bg-white p-3 rounded-2xl shadow-xl inline-flex items-center justify-center border-4 border-amber-300 ${className}`}
      style={{ width: size, height: size }}
    >
      {dataUrl ? (
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={dataUrl}
            alt="QR Code do Balcão"
            className="w-full h-full object-contain rounded-lg"
          />
          {showLogo && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 bg-white rounded-full border-2 border-[#e6398f] p-0.5 shadow-md flex items-center justify-center pointer-events-none overflow-hidden">
              <Image
                src="/logo.png?v=2"
                alt="Melhor Bocado"
                width={36}
                height={36}
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
          Gerando QR...
        </div>
      )}
    </div>
  );
}

