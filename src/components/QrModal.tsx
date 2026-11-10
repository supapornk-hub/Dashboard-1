import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { QrCode, Copy, Check, Download, ExternalLink, X } from 'lucide-react';

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  surveyUrl: string;
}

export const QrModal: React.FC<QrModalProps> = ({ isOpen, onClose, surveyUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && canvasRef.current && surveyUrl) {
      QRCode.toCanvas(
        canvasRef.current,
        surveyUrl,
        {
          width: 260,
          margin: 2,
          color: {
            dark: '#0f172a',
            light: '#ffffff'
          }
        },
        (error) => {
          if (error) console.error(error);
        }
      );
    }
  }, [isOpen, surveyUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(surveyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'training_survey_qrcode.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center hover:bg-slate-700 transition"
        >
          <X size={18} />
        </button>

        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs rounded-full font-medium mb-4">
          <QrCode size={14} />
          <span>สแกนตอบผ่านสมาร์ทโฟน</span>
        </div>

        <h3 className="text-2xl font-bold text-white mb-2">QR Code สำหรับผู้เข้าอบรม</h3>
        <p className="text-slate-300 text-xs sm:text-sm mb-6 leading-relaxed">
          นำ QR Code นี้ขึ้นจอโปรเจกเตอร์ หรือพิมพ์ให้ผู้เข้าอบรมสแกนเปิดแบบประเมินได้ทันที
        </p>

        <div className="p-4 bg-white rounded-2xl inline-block shadow-2xl mx-auto mb-5 border-4 border-indigo-500/30">
          <canvas ref={canvasRef} className="rounded-lg mx-auto" />
        </div>

        {/* URL Display */}
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 break-all mb-5 flex items-center justify-between gap-2 text-left">
          <span className="truncate">{surveyUrl}</span>
          <button
            onClick={handleCopy}
            className="flex-shrink-0 p-1.5 hover:bg-slate-800 rounded-lg text-indigo-400 transition"
            title="คัดลอกลิงก์"
          >
            {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={handleDownloadQR}
            className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <Download size={14} />
            <span>โหลดภาพ QR</span>
          </button>
          <a
            href={surveyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <ExternalLink size={14} />
            <span>ทดลองเปิดดู</span>
          </a>
        </div>
      </div>
    </div>
  );
};
