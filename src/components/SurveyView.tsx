import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { SURVEY_QUESTIONS } from '../types';
import { CheckCircle2, Send, Sparkles, AlertCircle, RefreshCw, Smartphone } from 'lucide-react';

interface SurveyViewProps {
  onSubmitted?: () => void;
  isEmbedded?: boolean;
}

const SCALE_OPTIONS = [
  { score: 1, label: 'น้อยสุด', emoji: '😡', desc: '1' },
  { score: 2, label: 'น้อย', emoji: '🙁', desc: '2' },
  { score: 3, label: 'ปานกลาง', emoji: '😐', desc: '3' },
  { score: 4, label: 'มาก', emoji: '😊', desc: '4' },
  { score: 5, label: 'มากที่สุด', emoji: '🤩', desc: '5' }
];

const LOCAL_STORAGE_KEY = 'training_survey_submitted_v1';

export const SurveyView: React.FC<SurveyViewProps> = ({ onSubmitted, isEmbedded = false }) => {
  const [scores, setScores] = useState<Record<number, number>>({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0
  });
  const [suggestion, setSuggestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasAlreadySubmitted, setHasAlreadySubmitted] = useState(false);
  const [submitTime, setSubmitTime] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHasAlreadySubmitted(true);
        setSubmitTime(parsed.time ? new Date(parsed.time).toLocaleTimeString('th-TH') : null);
      } catch {
        setHasAlreadySubmitted(true);
      }
    }
  }, []);

  const handleSelectScore = (questionId: number, score: number) => {
    setScores((prev) => ({ ...prev, [questionId]: score }));
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const handleResetForTesting = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setHasAlreadySubmitted(false);
    setIsSuccess(false);
    setScores({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
    setSuggestion('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check all 5 questions
    const unanswered = [1, 2, 3, 4, 5].filter((q) => !scores[q] || scores[q] === 0);
    if (unanswered.length > 0) {
      setErrorMessage(`กรุณาให้คะแนนข้อที่ ${unanswered.join(', ')} ให้ครบถ้วน`);
      const element = document.getElementById(`question-card-${unanswered[0]}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const payload = {
      q1: scores[1],
      q2: scores[2],
      q3: scores[3],
      q4: scores[4],
      q5: scores[5],
      suggestion: suggestion.trim(),
      deviceFingerprint: 'client-' + Math.random().toString(36).substring(2, 8)
    };

    try {
      const res = await fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('บันทึกข้อมูลไม่สำเร็จ');
      }

      // Mark locally to prevent duplicate
      const now = new Date().toISOString();
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ time: now }));

      setIsSuccess(true);
      setSubmitTime(new Date().toLocaleTimeString('th-TH'));

      // Launch Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }

      if (onSubmitted) {
        onSubmitted();
      }
    } catch (err: unknown) {
      console.error(err);
      setErrorMessage(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  const answeredCount = Object.values(scores).filter((v) => v > 0).length;

  return (
    <div className={`w-full ${isEmbedded ? 'max-w-md mx-auto p-4' : 'max-w-xl mx-auto py-6 px-4 sm:px-6'}`}>
      
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-indigo-900/90 via-slate-800 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 sm:p-6 mb-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-6 -top-6 w-28 h-28 bg-indigo-500/20 rounded-full blur-2xl"></div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs rounded-full font-medium mb-3">
          <Smartphone size={13} />
          <span>แบบประเมินผู้เข้าอบรม</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">
          แบบสอบถามความพึงพอใจการอบรม
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
          ความคิดเห็นของท่านมีคุณค่าอย่างยิ่งในการพัฒนาและปรับปรุงหลักสูตรการอบรมในครั้งต่อไป
        </p>

        <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            ไม่ระบุชื่อผู้ตอบ (Anonymous)
          </span>
          <span>ความคืบหน้า: {answeredCount}/5 ข้อ</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full transition-all duration-300"
            style={{ width: `${(answeredCount / 5) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Already Submitted Warning Screen */}
      {hasAlreadySubmitted && !isSuccess && (
        <div className="bg-slate-800/95 border border-emerald-500/40 rounded-2xl p-6 sm:p-8 text-center shadow-xl mb-6">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={36} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">ท่านได้ส่งแบบประเมินเรียบร้อยแล้ว</h2>
          <p className="text-slate-300 text-sm mb-4 leading-relaxed">
            ระบบได้บันทึกความคิดเห็นจากอุปกรณ์เครื่องนี้แล้ว เพื่อความถูกต้องของสถิติจึงจำกัดให้ส่ง 1 ครั้งต่อเครื่องครับ
          </p>
          {submitTime && (
            <p className="text-xs text-slate-400 mb-6">
              เวลาที่บันทึกล่าสุด: {submitTime}
            </p>
          )}
          <button
            onClick={handleResetForTesting}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-xs text-indigo-300 rounded-xl transition"
          >
            <RefreshCw size={13} />
            <span>ทำแบบสอบถามใหม่ (สำหรับทดสอบ / Admin Reset)</span>
          </button>
        </div>
      )}

      {/* Success Thank You Screen */}
      {isSuccess && (
        <div className="bg-slate-800/95 border border-emerald-500/40 rounded-2xl p-6 sm:p-8 text-center shadow-xl animate-in zoom-in-95 duration-300 mb-6">
          <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner shadow-emerald-500/20">
            <Sparkles size={40} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">ขอบคุณสำหรับความคิดเห็น!</h2>
          <p className="text-slate-300 text-sm mb-6 leading-relaxed">
            ข้อมูลการประเมินของท่านถูกส่งต่อไปยังจอ Dashboard ของวิทยากรแบบเรียลไทม์เรียบร้อยแล้ว
          </p>

          <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-700/60 mb-6 text-left text-xs space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">สถานะ:</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                บันทึกเข้า Dashboard สำเร็จ
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">คะแนนเฉลี่ยที่ให้:</span>
              <span className="text-white font-bold">
                {(Object.values(scores).reduce((a, b) => a + b, 0) / 5).toFixed(2)} / 5.00 ⭐
              </span>
            </div>
            {submitTime && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400">เวลาที่บันทึก:</span>
                <span className="text-slate-200">{submitTime} น.</span>
              </div>
            )}
          </div>

          <button
            onClick={handleResetForTesting}
            className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-medium transition"
          >
            ทดลองส่งแบบประเมินอีกรอบ (Admin Testing)
          </button>
        </div>
      )}

      {/* Survey Form */}
      {!hasAlreadySubmitted && !isSuccess && (
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Helper Legend */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 text-xs text-slate-300 flex justify-between items-center">
            <span className="text-slate-400">เกณฑ์คะแนน:</span>
            <span className="text-rose-400 font-medium">1 น้อยสุด</span>
            <span className="text-slate-600">→</span>
            <span className="text-indigo-400 font-medium">3 ปานกลาง</span>
            <span className="text-slate-600">→</span>
            <span className="text-emerald-400 font-medium">5 มากที่สุด</span>
          </div>

          {/* 5 Questions */}
          {SURVEY_QUESTIONS.map((q) => {
            const currentScore = scores[q.id];
            return (
              <div
                key={q.id}
                id={`question-card-${q.id}`}
                className={`bg-slate-800/80 border rounded-2xl p-4 sm:p-5 shadow-lg transition-all duration-200 ${
                  currentScore > 0 ? 'border-indigo-500/50 bg-slate-800/95' : 'border-slate-700/70'
                }`}
              >
                <div className="flex items-start gap-3 mb-3.5">
                  <span
                    className={`flex-shrink-0 w-7 h-7 rounded-lg text-sm font-bold flex items-center justify-center transition ${
                      currentScore > 0 ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {q.id}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-indigo-400">{q.category}</span>
                      {currentScore > 0 && (
                        <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 size={12} />
                          {currentScore} คะแนน
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold text-white mt-0.5 leading-snug">
                      {q.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {q.subtitle}
                    </p>
                  </div>
                </div>

                {/* 5 Big Touch Rating Buttons */}
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2 pt-1">
                  {SCALE_OPTIONS.map((opt) => {
                    const isSelected = currentScore === opt.score;
                    return (
                      <button
                        key={opt.score}
                        type="button"
                        onClick={() => handleSelectScore(q.id, opt.score)}
                        className={`group relative flex flex-col items-center justify-center py-2.5 sm:py-3.5 px-1 rounded-xl border text-center transition-all duration-150 active:scale-95 touch-manipulation ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30 scale-[1.02]'
                            : 'bg-slate-900/70 border-slate-700 text-slate-300 hover:bg-slate-700/60 hover:border-slate-600'
                        }`}
                      >
                        <span className="text-lg sm:text-2xl mb-1 transform group-hover:scale-110 transition">
                          {opt.emoji}
                        </span>
                        <span className="text-xs sm:text-sm font-bold">{opt.score}</span>
                        <span
                          className={`text-[9px] sm:text-[10px] mt-0.5 truncate w-full ${
                            isSelected ? 'text-indigo-100 font-semibold' : 'text-slate-400'
                          }`}
                        >
                          {opt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Suggestions Field */}
          <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-4 sm:p-5 shadow-lg">
            <label htmlFor="survey-suggestion" className="block text-sm font-semibold text-white mb-1.5">
              ข้อเสนอแนะเพิ่มเติมสำหรับหลักสูตรนี้ <span className="text-xs text-slate-400 font-normal">(ไม่บังคับ)</span>
            </label>
            <p className="text-xs text-slate-400 mb-2.5">
              มีสิ่งใดที่ประทับใจ หรือต้องการให้ปรับปรุงในการจัดอบรมครั้งต่อไป สามารถพิมพ์ระบุได้ครับ
            </p>
            <textarea
              id="survey-suggestion"
              rows={3}
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              placeholder="พิมพ์ข้อเสนอแนะ หรือความประทับใจที่นี่..."
              className="w-full bg-slate-900/90 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition resize-none"
            ></textarea>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center gap-2 animate-shake">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 rounded-2xl font-bold text-base shadow-xl flex items-center justify-center gap-2 transition transform active:scale-[0.98] ${
              answeredCount === 5
                ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white shadow-indigo-600/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700 cursor-pointer hover:bg-slate-700'
            }`}
          >
            {isSubmitting ? (
              <span>กำลังส่งแบบประเมิน...</span>
            ) : (
              <>
                <Send size={18} />
                <span>
                  {answeredCount === 5 ? 'ส่งแบบประเมินความพึงพอใจ' : `ส่งแบบประเมิน (ตอบแล้ว ${answeredCount}/5 ข้อ)`}
                </span>
              </>
            )}
          </button>

          <p className="text-center text-[11px] text-slate-500 pt-2">
            กดส่งข้อมูลแล้ว ผลจะถูกประมวลผลขึ้นจอ Dashboard ทันที
          </p>

        </form>
      )}

    </div>
  );
};
