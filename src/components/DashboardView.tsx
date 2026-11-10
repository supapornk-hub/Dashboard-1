import React, { useState } from 'react';
import { SurveyResponse, SURVEY_QUESTIONS, getSatisfactionInterpretation, SATISFACTION_LEVELS } from '../types';
import { exportResponsesToCSV } from '../utils/exportCsv';
import { 
  Users, 
  Award, 
  TrendingUp, 
  QrCode, 
  Download, 
  Maximize2, 
  Minimize2, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  PlusCircle, 
  MessageSquare, 
  CheckCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface DashboardViewProps {
  responses: SurveyResponse[];
  onOpenQR: () => void;
  surveyUrl: string;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
  onSeedData: () => Promise<void>;
  onResetData: () => Promise<void>;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  responses,
  onOpenQR,
  surveyUrl,
  isSoundEnabled,
  onToggleSound,
  onSeedData,
  onResetData
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [selectedQuestionFilter, setSelectedQuestionFilter] = useState<number | null>(null);

  const total = responses.length;

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.error);
    }
  };

  // Calculations
  const qSums = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const starCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let overallSum = 0;
  let positiveCount = 0;

  responses.forEach((r) => {
    overallSum += Number(r.average || 0);
    [1, 2, 3, 4, 5].forEach((q) => {
      const val = Number(r[`q${q as 1 | 2 | 3 | 4 | 5}`] || 0);
      qSums[q as 1 | 2 | 3 | 4 | 5] += val;
      if (starCounts[val as 1 | 2 | 3 | 4 | 5] !== undefined) {
        starCounts[val as 1 | 2 | 3 | 4 | 5]++;
      }
    });

    if (r.average >= 3.51) {
      positiveCount++;
    }
  });

  const overallAvg = total > 0 ? Number((overallSum / total).toFixed(2)) : 0;
  const positiveRate = total > 0 ? Math.round((positiveCount / total) * 100) : 0;
  const interpretation = getSatisfactionInterpretation(overallAvg);

  const qAverages = [1, 2, 3, 4, 5].map((qId) => {
    const avg = total > 0 ? Number((qSums[qId as 1 | 2 | 3 | 4 | 5] / total).toFixed(2)) : 0;
    const pct = total > 0 ? Math.round((avg / 5) * 100) : 0;
    return { qId, avg, pct };
  });

  const totalRatingsGiven = total * 5;

  const suggestionsList = responses.filter((r) => r.suggestion && r.suggestion.trim() !== '');

  const handleSeed = async () => {
    setIsSeeding(true);
    await onSeedData();
    setIsSeeding(false);
  };

  const handleReset = async () => {
    if (confirm('คุณต้องการล้างข้อมูลแบบประเมินทั้งหมดเพื่อเริ่มรอบใหม่ใช่หรือไม่?')) {
      setIsResetting(true);
      await onResetData();
      setIsResetting(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

      {/* Top Banner / Projector Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
              ผลการประเมินความพึงพอใจการอบรม
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              REAL-TIME LIVE
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            ระบบอัปเดตสถิติและข้อเสนอแนะขึ้นจอโปรเจกเตอร์ทันทีที่มีผู้ส่งคำตอบ
          </p>
        </div>

        {/* Presenter Toolbar */}
        <div className="flex items-center flex-wrap gap-2">
          {/* QR Button */}
          <button
            onClick={onOpenQR}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/20 transition flex items-center gap-2"
          >
            <QrCode size={16} />
            <span>QR Code สแกนตอบ</span>
          </button>

          {/* CSV Export Button */}
          <button
            onClick={() => exportResponsesToCSV(responses)}
            disabled={total === 0}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
              total > 0
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            <Download size={16} />
            <span>ดาวน์โหลด CSV ({total})</span>
          </button>

          {/* Sound Notification Toggle */}
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-xl border text-xs sm:text-sm transition ${
              isSoundEnabled
                ? 'bg-slate-800 text-indigo-400 border-indigo-500/30'
                : 'bg-slate-800/60 text-slate-500 border-slate-700'
            }`}
            title={isSoundEnabled ? 'เปิดเสียงแจ้งเตือนเมื่อมีคนตอบ (กดเพื่อปิด)' : 'ปิดเสียงแจ้งเตือน (กดเพื่อเปิด)'}
          >
            {isSoundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs sm:text-sm transition"
            title="ขยายเต็มหน้าจอโปรเจกเตอร์"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>

          {/* Seed demo data */}
          <button
            onClick={handleSeed}
            disabled={isSeeding}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-xs font-medium transition flex items-center gap-1.5"
            title="เพิ่มข้อมูลตัวอย่าง 12 รายการเพื่อทดสอบการแสดงผลบนจอ"
          >
            <PlusCircle size={14} className="text-amber-400" />
            <span className="hidden sm:inline">จำลองข้อมูล</span>
          </button>

          {/* Reset */}
          <button
            onClick={handleReset}
            disabled={isResetting || total === 0}
            className="p-2 bg-slate-800 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 rounded-xl text-xs transition"
            title="ล้างข้อมูลทั้งหมดเพื่อเริ่มการอบรมใหม่"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* 4 Big KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Total Respondents */}
        <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg relative overflow-hidden transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">จำนวนผู้ตอบทั้งหมด</p>
              <h2 className="text-4xl lg:text-5xl font-black text-white mt-2 tracking-tight">
                {total}
              </h2>
            </div>
            <div className="p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-2xl">
              <Users size={24} />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4 flex items-center gap-1.5">
            <span className="text-emerald-400 font-semibold">● อัปเดตล่าสุด:</span>
            <span>{total > 0 ? new Date(responses[0]?.timestamp).toLocaleTimeString('th-TH') : 'รอผู้ตอบคนแรก'}</span>
          </p>
        </div>

        {/* KPI 2: Overall Average */}
        <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg relative overflow-hidden transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">คะแนนเฉลี่ยรวม</p>
              <div className="flex items-baseline gap-2 mt-2">
                <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight">
                  {overallAvg.toFixed(2)}
                </h2>
                <span className="text-sm font-semibold text-slate-400">/ 5.00</span>
              </div>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-2xl">
              <Award size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-amber-400 text-sm">
            {'★'.repeat(Math.round(overallAvg))}
            <span className="text-slate-600">{'★'.repeat(5 - Math.round(overallAvg))}</span>
            <span className="text-xs text-slate-400 ml-1.5">
              ({total > 0 ? `${Math.round((overallAvg / 5) * 100)}%` : '0%'})
            </span>
          </div>
        </div>

        {/* KPI 3: Satisfaction Level 5-Grade Interpretation */}
        <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg relative overflow-hidden transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">ระดับความพึงพอใจ</p>
              <h2 className={`text-2xl sm:text-3xl font-extrabold mt-2 ${interpretation.colorClass}`}>
                {total > 0 ? interpretation.label : 'รอข้อมูล'}
              </h2>
            </div>
            <div className={`p-3 rounded-2xl border ${interpretation.bgClass} ${interpretation.borderClass} text-2xl`}>
              {total > 0 ? interpretation.emoji : '🎯'}
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4 flex items-center justify-between">
            <span>เกณฑ์มาตรฐาน 5 ระดับ</span>
            <span className="font-medium text-slate-300">{interpretation.range}</span>
          </p>
        </div>

        {/* KPI 4: Positive % */}
        <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg relative overflow-hidden transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">ความพึงพอใจเชิงบวก</p>
              <div className="flex items-baseline gap-2 mt-2">
                <h2 className="text-4xl lg:text-5xl font-black text-emerald-400 tracking-tight">
                  {positiveRate}%
                </h2>
              </div>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl">
              <TrendingUp size={24} />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4">
            สัดส่วนผู้ให้คะแนนระดับ <span className="text-emerald-400 font-semibold">มาก - มากที่สุด</span>
          </p>
        </div>

      </div>

      {/* Main Grid: Bar Charts & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 5 Questions Bar Chart (Spans 2 columns) */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>คะแนนเฉลี่ยรายข้อ (สเกล 1 - 5)</span>
                <span className="text-xs font-normal text-slate-400">(เต็ม 5.00 คะแนน)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                เปรียบเทียบความพึงพอใจในแต่ละมิติของการจัดอบรม
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-3 h-3 rounded bg-indigo-500"></span> คะแนนเฉลี่ย
              </span>
            </div>
          </div>

          {/* Bar Items */}
          <div className="space-y-4">
            {SURVEY_QUESTIONS.map((q) => {
              const stat = qAverages.find((a) => a.qId === q.id);
              const avg = stat?.avg || 0;
              const pct = stat?.pct || 0;
              const qInterp = getSatisfactionInterpretation(avg);

              return (
                <div
                  key={q.id}
                  className={`p-3 rounded-xl border transition cursor-pointer ${
                    selectedQuestionFilter === q.id
                      ? 'bg-slate-800/90 border-indigo-500/50'
                      : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/40'
                  }`}
                  onClick={() => setSelectedQuestionFilter(selectedQuestionFilter === q.id ? null : q.id)}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-indigo-600/30 text-indigo-400 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                        {q.id}
                      </span>
                      <div>
                        <span className="text-xs font-semibold text-white">{q.title}</span>
                        <p className="text-[11px] text-slate-400">{q.category}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-1.5 justify-end">
                        <span className="text-base font-bold text-white">{avg.toFixed(2)}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${qInterp.bgClass} ${qInterp.colorClass}`}>
                          {total > 0 ? qInterp.label : '-'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">{pct}%</span>
                    </div>
                  </div>

                  {/* Progress Bar Container */}
                  <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-400 transition-all duration-700 ease-out"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Official 5-Level Reference Legend */}
          <div className="pt-4 border-t border-slate-800">
            <p className="text-xs font-medium text-slate-400 mb-2.5">
              เกณฑ์มาตรฐานการแปลผลค่าเฉลี่ย 5 ระดับ (Best Practice Likert Scale):
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
              {SATISFACTION_LEVELS.map((lvl) => (
                <div key={lvl.label} className={`p-2 rounded-xl border ${lvl.bgClass} ${lvl.borderClass}`}>
                  <div className={`font-bold ${lvl.colorClass}`}>{lvl.range}</div>
                  <div className="text-slate-300 font-medium text-[11px] mt-0.5 flex items-center justify-center gap-1">
                    <span>{lvl.emoji}</span>
                    <span>{lvl.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Score Breakdown & Fast QR Scanner */}
        <div className="space-y-6">

          {/* Star Rating Breakdown */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-white mb-3">สัดส่วนคะแนนทั้งหมด</h3>
            <p className="text-xs text-slate-400 mb-4">
              คิดจากคะแนนรวมทุกข้อที่ผู้เข้าอบรมเลือกตอบ ({totalRatingsGiven} ครั้ง)
            </p>

            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = starCounts[star as 1 | 2 | 3 | 4 | 5];
                const pct = totalRatingsGiven > 0 ? Math.round((count / totalRatingsGiven) * 100) : 0;
                const colors = {
                  5: 'from-emerald-500 to-emerald-400',
                  4: 'from-indigo-500 to-indigo-400',
                  3: 'from-amber-500 to-amber-400',
                  2: 'from-orange-500 to-orange-400',
                  1: 'from-rose-500 to-rose-400'
                };

                return (
                  <div key={star} className="flex items-center gap-2.5 text-xs">
                    <span className="w-12 text-slate-300 font-medium flex items-center gap-1">
                      <span>{star}</span>
                      <span className="text-amber-400">★</span>
                    </span>
                    <div className="flex-1 bg-slate-800 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${colors[star as 1 | 2 | 3 | 4 | 5]} transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                    <span className="w-12 text-right font-medium text-slate-400">
                      {pct}% <span className="text-[10px] text-slate-500">({count})</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Projector Fast QR Callout */}
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/30 rounded-2xl p-6 shadow-xl text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs rounded-full font-medium mb-3">
              <QrCode size={13} />
              <span>สแกนตอบผ่านมือถือ</span>
            </div>
            <h4 className="text-base font-bold text-white mb-1">ยังไม่ได้ร่วมประเมิน?</h4>
            <p className="text-xs text-slate-300 mb-4">
              สแกน QR Code เพื่อเปิดแบบสอบถามบนสมาร์ทโฟนได้ทันที
            </p>
            <button
              onClick={onOpenQR}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
            >
              <span>เปิดหน้าต่าง QR Code จอใหญ่</span>
              <ChevronRight size={14} />
            </button>
            <div className="mt-3">
              <a
                href={surveyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
              >
                <span>เปิดลิงก์แบบสอบถามในแท็บใหม่</span>
                <ExternalLink size={11} />
              </a>
            </div>
          </div>

        </div>

      </div>

      {/* Recent Suggestions Live Feed */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-indigo-400" />
            <h3 className="text-base sm:text-lg font-bold text-white">
              ข้อเสนอแนะล่าสุดจากผู้เข้าร่วมอบรม
            </h3>
          </div>
          <span className="text-xs px-3 py-1 bg-slate-800 text-slate-300 rounded-xl border border-slate-700">
            {suggestionsList.length} ข้อเสนอแนะ
          </span>
        </div>

        {suggestionsList.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-sm border border-dashed border-slate-800 rounded-xl">
            ยังไม่มีข้อเสนอแนะเพิ่มเติมในขณะนี้ (เมื่อมีผู้ตอบพิมพ์ข้อเสนอแนะจะปรากฏที่นี่ทันที)
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1">
            {suggestionsList.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl text-xs flex flex-col justify-between hover:bg-slate-800/90 transition shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="font-semibold text-indigo-400">
                      ผู้ตอบ #{total - idx}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(item.timestamp).toLocaleTimeString('th-TH')} น.
                    </span>
                  </div>
                  <p className="text-slate-200 text-sm leading-relaxed mb-3">
                    "{item.suggestion}"
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-amber-400 font-medium">
                    ★ เฉลี่ย {item.average.toFixed(2)}
                  </span>
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle size={11} /> ส่งเรียบร้อย
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
