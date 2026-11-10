/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SurveyResponse } from './types';
import { SurveyView } from './components/SurveyView';
import { DashboardView } from './components/DashboardView';
import { CodeGuideView } from './components/CodeGuideView';
import { QrModal } from './components/QrModal';
import { playChimeSound } from './utils/audio';
import { 
  BarChart3, 
  Smartphone, 
  Code2, 
  Columns, 
  QrCode, 
  Volume2, 
  VolumeX, 
  Layers, 
  ExternalLink 
} from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'survey' | 'simulator' | 'code'>('dashboard');
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isStandaloneSurvey, setIsStandaloneSurvey] = useState(false);
  const [isStandaloneDashboard, setIsStandaloneDashboard] = useState(false);

  // Parse URL query parameter (e.g. ?view=survey or ?view=dashboard)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    if (viewParam === 'survey') {
      setIsStandaloneSurvey(true);
      setCurrentView('survey');
    } else if (viewParam === 'dashboard') {
      setIsStandaloneDashboard(true);
      setCurrentView('dashboard');
    }
  }, []);

  // Compute survey URL for attendees
  const surveyUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}${window.location.pathname}?view=survey`;
  }, []);

  // Fetch initial responses
  const fetchResponses = useCallback(async () => {
    try {
      const res = await fetch('/api/responses');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setResponses(json.data);
        }
      }
    } catch (err) {
      console.error('Error fetching responses:', err);
    }
  }, []);

  // Real-time SSE Stream & BroadcastChannel listener
  useEffect(() => {
    fetchResponses();

    // Broadcast channel for instantaneous cross-tab zero-latency sync
    let broadcast: BroadcastChannel | null = null;
    try {
      broadcast = new BroadcastChannel('training_survey_sync');
      broadcast.onmessage = (event) => {
        if (event.data?.type === 'NEW_RESPONSE') {
          if (isSoundEnabled) playChimeSound();
          setResponses((prev) => [event.data.payload, ...prev]);
        } else if (event.data?.type === 'REFETCH') {
          fetchResponses();
        }
      };
    } catch {
      // BroadcastChannel not supported in older browsers
    }

    // Server-Sent Events (SSE) Stream
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/stream');
      eventSource.onmessage = (e) => {
        try {
          const parsed = JSON.parse(e.data);
          if (parsed.type === 'INIT') {
            setResponses(parsed.data);
          } else if (parsed.type === 'NEW_RESPONSE') {
            if (isSoundEnabled) playChimeSound();
            setResponses((prev) => {
              if (prev.some((r) => r.id === parsed.data.id)) return prev;
              return [parsed.data, ...prev];
            });
          } else if (parsed.type === 'RESET') {
            setResponses([]);
          } else if (parsed.type === 'SEED_DATA') {
            setResponses(parsed.data);
          }
        } catch {
          // ignore keepalive comments
        }
      };
    } catch (e) {
      console.error('SSE initialization error:', e);
    }

    return () => {
      broadcast?.close();
      eventSource?.close();
    };
  }, [fetchResponses, isSoundEnabled]);

  const handleSeedData = async () => {
    try {
      const res = await fetch('/api/responses/seed', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.data) {
          setResponses(data.data);
          if (isSoundEnabled) playChimeSound();
        }
      }
    } catch (err) {
      console.error('Failed to seed:', err);
    }
  };

  const handleResetData = async () => {
    try {
      const res = await fetch('/api/responses', { method: 'DELETE' });
      if (res.ok) {
        setResponses([]);
      }
    } catch (err) {
      console.error('Failed to reset:', err);
    }
  };

  const handleSurveySubmitted = () => {
    try {
      const bc = new BroadcastChannel('training_survey_sync');
      bc.postMessage({ type: 'REFETCH' });
      bc.close();
    } catch {
      // ignore
    }
    fetchResponses();
  };

  // If opened directly as ?view=survey (e.g. attendee scanned QR code)
  if (isStandaloneSurvey) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between py-6">
        <SurveyView onSubmitted={handleSurveySubmitted} />
        <div className="text-center pb-4 text-xs text-slate-500">
          <a
            href={window.location.origin + window.location.pathname}
            className="hover:text-slate-400 transition underline"
          >
            ไปที่หน้า Dashboard วิทยากร
          </a>
        </div>
      </div>
    );
  }

  // If opened directly as ?view=dashboard (e.g. dedicated projector URL)
  if (isStandaloneDashboard) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <DashboardView
          responses={responses}
          onOpenQR={() => setIsQrModalOpen(true)}
          surveyUrl={surveyUrl}
          isSoundEnabled={isSoundEnabled}
          onToggleSound={() => setIsSoundEnabled(!isSoundEnabled)}
          onSeedData={handleSeedData}
          onResetData={handleResetData}
        />
        <QrModal
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
          surveyUrl={surveyUrl}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      
      {/* Top Main Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-lg shadow-md shadow-indigo-600/30">
              ⭐
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm sm:text-base tracking-tight">
                  ระบบประเมินความพึงพอใจการอบรม
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Real-time
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                เก็บข้อมูลผ่านมือถือ • วิเคราะห์ผลขึ้นจอโปรเจกเตอร์
              </p>
            </div>
          </div>

          {/* View Mode Switcher Buttons */}
          <nav className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg transition ${
                currentView === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <BarChart3 size={14} />
              <span className="hidden md:inline">จอ Dashboard</span>
              <span className="md:hidden">Dashboard</span>
            </button>

            <button
              onClick={() => setCurrentView('survey')}
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg transition ${
                currentView === 'survey'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Smartphone size={14} />
              <span className="hidden md:inline">แบบประเมิน (มือถือ)</span>
              <span className="md:hidden">แบบประเมิน</span>
            </button>

            <button
              onClick={() => setCurrentView('simulator')}
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg transition ${
                currentView === 'simulator'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
              title="ทดสอบตอบคำถามและดูผลลัพธ์วิ่งเข้า Dashboard ทันที"
            >
              <Columns size={14} />
              <span className="hidden lg:inline">จำลอง 2 จอ (Live Test)</span>
              <span className="lg:hidden">จำลอง 2 จอ</span>
            </button>

            <button
              onClick={() => setCurrentView('code')}
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg transition ${
                currentView === 'code'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Code2 size={14} />
              <span className="hidden md:inline">โค้ด 2 ไฟล์ & Firebase</span>
              <span className="md:hidden">โค้ด</span>
            </button>
          </nav>

          {/* Right Action: QR & Audio */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsQrModalOpen(true)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
              title="เปิด QR Code สำหรับให้ผู้เข้าร่วมอบรมสแกน"
            >
              <QrCode size={16} className="text-indigo-400" />
              <span className="hidden sm:inline">QR Code</span>
            </button>

            <button
              onClick={() => setIsSoundEnabled(!isSoundEnabled)}
              className={`p-2 rounded-xl border text-xs transition ${
                isSoundEnabled
                  ? 'bg-slate-800 text-indigo-400 border-indigo-500/30'
                  : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
              title={isSoundEnabled ? 'เปิดเสียงแจ้งเตือนเมื่อมีคนตอบ (กดเพื่อปิด)' : 'ปิดเสียงแจ้งเตือน (กดเพื่อเปิด)'}
            >
              {isSoundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </div>

        </div>
      </header>

      {/* Main Body Content based on View */}
      <main className="flex-1">
        {currentView === 'dashboard' && (
          <DashboardView
            responses={responses}
            onOpenQR={() => setIsQrModalOpen(true)}
            surveyUrl={surveyUrl}
            isSoundEnabled={isSoundEnabled}
            onToggleSound={() => setIsSoundEnabled(!isSoundEnabled)}
            onSeedData={handleSeedData}
            onResetData={handleResetData}
          />
        )}

        {currentView === 'survey' && (
          <div className="py-6">
            <SurveyView onSubmitted={handleSurveySubmitted} />
          </div>
        )}

        {/* Live Simulator View: Dual Screen Left (Phone) and Right (Dashboard) */}
        {currentView === 'simulator' && (
          <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
            <div className="bg-slate-900/60 border border-indigo-500/30 rounded-2xl p-4 mb-6 text-xs text-indigo-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>
                  <b>โหมดจำลอง 2 หน้าจอแบบ Real-time:</b> ลองเลือกคะแนนบนหน้าจอมือถือจำลองทางซ้าย แล้วกดส่ง จะเห็นผลลัพธ์ทางขวาอัปเดตแบบเรียลไทม์พร้อมเสียงเตือนทันที!
                </span>
              </div>
              <button
                onClick={handleSeedData}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition"
              >
                + เพิ่มข้อมูลตัวอย่าง 12 รายการ
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Phone Simulator Mockup (5 cols) */}
              <div className="xl:col-span-5 flex justify-center">
                <div className="w-full max-w-md bg-slate-950 border-4 border-slate-700/80 rounded-[2.5rem] shadow-2xl p-3 relative overflow-hidden ring-1 ring-slate-800">
                  {/* Phone Notch */}
                  <div className="w-32 h-5 bg-slate-800 rounded-b-xl mx-auto mb-3 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-700"></div>
                  </div>

                  <div className="max-h-[820px] overflow-y-auto px-1 py-1 rounded-2xl scrollbar-thin">
                    <SurveyView onSubmitted={handleSurveySubmitted} isEmbedded={true} />
                  </div>

                  {/* Phone Home Indicator */}
                  <div className="w-32 h-1 bg-slate-700 rounded-full mx-auto mt-3"></div>
                </div>
              </div>

              {/* Right Column: Projector Live Dashboard (7 cols) */}
              <div className="xl:col-span-7 bg-slate-900/40 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl">
                <DashboardView
                  responses={responses}
                  onOpenQR={() => setIsQrModalOpen(true)}
                  surveyUrl={surveyUrl}
                  isSoundEnabled={isSoundEnabled}
                  onToggleSound={() => setIsSoundEnabled(!isSoundEnabled)}
                  onSeedData={handleSeedData}
                  onResetData={handleResetData}
                />
              </div>

            </div>
          </div>
        )}

        {currentView === 'code' && <CodeGuideView />}
      </main>

      {/* QR Code Modal */}
      <QrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        surveyUrl={surveyUrl}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 px-6 text-center text-xs text-slate-500">
        <p>
          ระบบประเมินความพึงพอใจการอบรม • รองรับการเชื่อมต่อ Firebase Realtime Database • ออกแบบสำหรับการขึ้นจอโปรเจกเตอร์และสมาร์ทโฟน
        </p>
      </footer>

    </div>
  );
}
