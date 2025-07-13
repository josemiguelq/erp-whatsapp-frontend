import { useState, useRef, useCallback, useEffect } from 'react';

interface BarcodeScannerHook {
  isScanning: boolean;
  startScanning: () => Promise<void>;
  stopScanning: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  captureFrame: () => string | null;
}

export const useBarcodeScanner = (onBarcodeDetected: (barcode: string) => void): BarcodeScannerHook => {
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startScanning = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Câmera traseira preferencial
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      setStream(mediaStream);
      setIsScanning(true);
      
      // Aguardar um frame antes de conectar o stream
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
      
    } catch (error) {
      console.error("Erro ao acessar câmera:", error);
      throw new Error("Não foi possível acessar a câmera. Verifique as permissões.");
    }
  }, []);

  const stopScanning = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  }, [stream]);

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return null;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    
    // Simular detecção de código de barras
    // Em uma implementação real, aqui seria usado uma biblioteca como QuaggaJS ou ZXing
    const simulatedCodes = [
      "7891234567890",
      "1234567890123", 
      "9876543210987",
      "5555666677778",
      "1111222233334"
    ];
    
    const randomCode = simulatedCodes[Math.floor(Math.random() * simulatedCodes.length)];
    
    // Simular delay de processamento
    setTimeout(() => {
      onBarcodeDetected(randomCode);
      stopScanning();
    }, 500);
    
    return canvas.toDataURL();
  }, [onBarcodeDetected, stopScanning]);

  // Cleanup automático
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return {
    isScanning,
    startScanning,
    stopScanning,
    videoRef,
    canvasRef,
    captureFrame
  };
}; 