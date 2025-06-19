import { useEffect, useRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';

export default function BarcodeScanner({ onResult }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    reader.decodeFromVideoDevice(null, videoRef.current, (result, err) => {
      if (result) {
        onResult(result.getText());
        reader.reset();
      }
    });
    return () => reader.reset();
  }, []);

  return <video ref={videoRef} style={{ width: '100%' }} />;
}
