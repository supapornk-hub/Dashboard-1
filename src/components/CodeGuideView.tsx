import React, { useState } from 'react';
import { 
  FileCode, 
  Flame, 
  Rocket, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  ShieldCheck, 
  Layers, 
  Code2, 
  Sparkles,
  HelpCircle
} from 'lucide-react';

export const CodeGuideView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'survey' | 'dashboard' | 'firebase' | 'deploy'>('survey');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const copyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(id);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const surveyCode = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>แบบประเมินความพึงพอใจการอบรม</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Google Fonts Prompt -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <!-- Firebase App & Realtime Database SDK (Compat v9) -->
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js"></script>
  <style>
    body { font-family: 'Prompt', sans-serif; }
    .scale-btn.active {
      transform: scale(1.05);
      border-color: #4f46e5;
      background-color: #4f46e5;
      color: #ffffff;
      box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.4);
    }
  </style>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen py-6 px-4 sm:px-6">

  <div class="max-w-lg mx-auto">
    <!-- Header -->
    <header class="bg-gradient-to-br from-indigo-900/80 via-slate-800 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 mb-6 shadow-xl text-center relative overflow-hidden">
      <div class="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs rounded-full font-medium mb-3">
        <span>⭐ แบบประเมินผลการอบรม</span>
      </div>
      <h1 class="text-2xl font-bold text-white tracking-tight mb-2">แบบสอบถามความพึงพอใจ</h1>
      <p class="text-slate-300 text-sm leading-relaxed">
        ความคิดเห็นของท่านมีคุณค่าอย่างยิ่งในการพัฒนาและปรับปรุงหลักสูตรการอบรมในครั้งต่อไป
      </p>
      <div class="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-center gap-4 text-xs text-slate-400">
        <span>🔒 ไม่ระบุชื่อผู้ตอบ</span>
        <span>•</span>
        <span>⏱️ ใช้เวลาไม่เกิน 1 นาที</span>
      </div>
    </header>

    <!-- Already Submitted Screen -->
    <div id="already-submitted" class="hidden bg-slate-800/90 border border-emerald-500/40 rounded-2xl p-8 text-center shadow-xl">
      <div class="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
      <h2 class="text-xl font-bold text-white mb-2">ท่านได้ส่งแบบประเมินเรียบร้อยแล้ว</h2>
      <p class="text-slate-300 text-sm mb-6">ระบบบันทึกความคิดเห็นลงฐานข้อมูลแล้ว ขอบพระคุณครับ</p>
      <button id="btn-retest" class="text-xs text-indigo-400 hover:text-indigo-300 underline">(สำหรับทดสอบ: กดเพื่ออนุญาตให้ตอบใหม่)</button>
    </div>

    <!-- Success Screen -->
    <div id="success-screen" class="hidden bg-slate-800/90 border border-emerald-500/40 rounded-2xl p-8 text-center shadow-xl">
      <div class="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">🎉</div>
      <h2 class="text-2xl font-bold text-white mb-2">ขอบคุณสำหรับความคิดเห็น!</h2>
      <p class="text-slate-300 text-sm mb-6">ข้อมูลถูกส่งไปยัง Dashboard ของวิทยากรแบบเรียลไทม์แล้ว</p>
      <button onclick="location.reload()" class="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium text-sm">กลับสู่หน้าหลัก</button>
    </div>

    <!-- Survey Form -->
    <form id="survey-form" class="space-y-6">
      <!-- 5 Questions Loop: Q1 ถึง Q5 -->
      <!-- [ดูโค้ดตัวเต็มในไฟล์ survey.html ที่สร้างไว้ในโฟลเดอร์ public] -->
    </form>
  </div>

  <script>
    // 1. Firebase Configuration จาก Firebase Console
    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
      databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_PROJECT_ID.appspot.com",
      messagingSenderId: "YOUR_SENDER_ID",
      appId: "YOUR_APP_ID"
    };

    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();

    // 2. ป้องกันการตอบซ้ำด้วย localStorage
    const LOCAL_STORAGE_KEY = 'training_survey_submitted_v1';
    if (localStorage.getItem(LOCAL_STORAGE_KEY)) {
      document.getElementById('survey-form').classList.add('hidden');
      document.getElementById('already-submitted').classList.remove('hidden');
    }

    // 3. ส่งข้อมูลเข้า Firebase Realtime Database
    async function submitForm(payload) {
      await database.ref('responses').push(payload);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ time: new Date().toISOString() }));
      document.getElementById('survey-form').classList.add('hidden');
      document.getElementById('success-screen').classList.remove('hidden');
    }
  </script>
</body>
</html>`;

  const dashboardCode = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Live Dashboard ผลการประเมินความพึงพอใจการอบรม</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Google Fonts Prompt -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <!-- QRCode.js CDN สำหรับสร้าง QR Code ขึ้นจอ -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
  <!-- Firebase App & Realtime Database SDK (Compat v9) -->
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js"></script>
  <style>
    body { font-family: 'Prompt', sans-serif; }
    .bar-animate { transition: width 0.7s cubic-bezier(0.4, 0, 0.2, 1); }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen p-4 sm:p-6 lg:p-8">

  <!-- Top Header with Actions (Export CSV, QR Code, Fullscreen) -->
  <!-- KPI Grid (จำนวนผู้ตอบ, คะแนนเฉลี่ยรวม, ระดับความพึงพอใจ 5 ระดับ, % เชิงบวก) -->
  <!-- กราฟแท่งคะแนนเฉลี่ยรายข้อ 5 ข้อ & สัดส่วนคะแนน 1-5 ดาว -->
  <!-- ข้อเสนอแนะล่าสุดแบบ Real-time -->

  <script>
    // 1. Firebase Configuration จาก Firebase Console
    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
      databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_PROJECT_ID.appspot.com",
      messagingSenderId: "YOUR_SENDER_ID",
      appId: "YOUR_APP_ID"
    };

    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();

    // 2. ดักฟังสตรีมข้อมูลแบบ Real-time เมื่อมีคนส่งแบบประเมิน
    database.ref('responses').on('value', (snapshot) => {
      const dataObj = snapshot.val();
      const list = dataObj ? Object.values(dataObj).reverse() : [];
      renderDashboard(list);
    });

    // 3. ฟังก์ชันส่งออก CSV พร้อมรองรับภาษาไทยใน Microsoft Excel
    function exportToCSV(responses) {
      const headers = ['ลำดับ', 'วันที่-เวลา', 'ข้อ 1', 'ข้อ 2', 'ข้อ 3', 'ข้อ 4', 'ข้อ 5', 'คะแนนเฉลี่ย', 'ข้อเสนอแนะ'];
      const rows = responses.map((r, i) => [
        i + 1,
        '"' + new Date(r.timestamp).toLocaleString('th-TH') + '"',
        r.q1, r.q2, r.q3, r.q4, r.q5, r.average,
        '"' + (r.suggestion || '').replace(/"/g, '""') + '"'
      ]);
      const csvContent = '\\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'training_results.csv';
      link.click();
    }
  </script>
</body>
</html>`;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900/80 via-purple-900/60 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs rounded-full font-medium mb-3">
              <Code2 size={13} />
              <span>โค้ดแยก 2 ไฟล์ & คู่มือติดตั้ง</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              โค้ด HTML + JS Standalone & คู่มือเชื่อมต่อ Firebase
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              ไฟล์ HTML สองไฟล์นี้ทำงานได้แบบ Standalone โดยไม่ต้องติดตั้ง Node.js หรือเซิร์ฟเวอร์ เพียงแค่ใส่ Firebase Config ก็สามารถนำไปขึ้นโฮสติ้งฟรีได้ทันที
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/survey.html"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
            >
              <span>เปิด /survey.html</span>
              <ExternalLink size={12} />
            </a>
            <a
              href="/dashboard.html"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition flex items-center gap-1.5"
            >
              <span>เปิด /dashboard.html</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 overflow-x-auto gap-2 pb-1">
        <button
          onClick={() => setActiveTab('survey')}
          className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition ${
            activeTab === 'survey'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <FileCode size={16} />
          <span>1. หน้าตอบแบบสอบถาม (survey.html)</span>
        </button>

        <button
          onClick={() => setActiveTab('dashboard')}
          className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition ${
            activeTab === 'dashboard'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Layers size={16} />
          <span>2. หน้า Dashboard จอใหญ่ (dashboard.html)</span>
        </button>

        <button
          onClick={() => setActiveTab('firebase')}
          className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition ${
            activeTab === 'firebase'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Flame size={16} className="text-amber-300" />
          <span>3. วิธีตั้งค่า Firebase Realtime DB</span>
        </button>

        <button
          onClick={() => setActiveTab('deploy')}
          className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition ${
            activeTab === 'deploy'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Rocket size={16} />
          <span>4. วิธี Deploy ฟรี ทีละขั้นตอน</span>
        </button>
      </div>

      {/* Tab 1: Survey Code */}
      {activeTab === 'survey' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div>
              <h4 className="font-bold text-white text-sm">ไฟล์: /public/survey.html</h4>
              <p className="text-xs text-slate-400">
                หน้าประเมินแบบ Mobile-first ออกแบบมาสำหรับมือถือ ปุ่มใหญ่ ชัดเจน ป้องกันการส่งซ้ำ
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => copyCode(surveyCode, 'survey')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
              >
                {copiedTab === 'survey' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copiedTab === 'survey' ? 'คัดลอกแล้ว' : 'คัดลอกโค้ด'}</span>
              </button>
              <button
                onClick={() => downloadFile('survey.html', surveyCode)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow"
              >
                <Download size={14} />
                <span>ดาวน์โหลด survey.html</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 overflow-hidden">
            <pre className="text-xs text-slate-300 font-mono overflow-x-auto p-2 leading-relaxed max-h-[500px]">
              <code>{surveyCode}</code>
            </pre>
          </div>
        </div>
      )}

      {/* Tab 2: Dashboard Code */}
      {activeTab === 'dashboard' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div>
              <h4 className="font-bold text-white text-sm">ไฟล์: /public/dashboard.html</h4>
              <p className="text-xs text-slate-400">
                หน้า Dashboard เหมาะกับขึ้นจอโปรเจกเตอร์ มี QR Code สแกนตอบ แปลผล 5 ระดับ และปุ่มดาวน์โหลด CSV
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => copyCode(dashboardCode, 'dashboard')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
              >
                {copiedTab === 'dashboard' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copiedTab === 'dashboard' ? 'คัดลอกแล้ว' : 'คัดลอกโค้ด'}</span>
              </button>
              <button
                onClick={() => downloadFile('dashboard.html', dashboardCode)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow"
              >
                <Download size={14} />
                <span>ดาวน์โหลด dashboard.html</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 overflow-hidden">
            <pre className="text-xs text-slate-300 font-mono overflow-x-auto p-2 leading-relaxed max-h-[500px]">
              <code>{dashboardCode}</code>
            </pre>
          </div>
        </div>
      )}

      {/* Tab 3: Firebase Tutorial */}
      {activeTab === 'firebase' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Flame size={22} className="text-amber-400" />
              <span>ขั้นตอนการสมัครและตั้งค่า Firebase Realtime Database (ฟรี 100%)</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              ทำตาม 4 ขั้นตอนนี้เพื่อรับ URL ฐานข้อมูลและ API Key นำมาใส่ในโค้ด
            </p>
          </div>

          <div className="space-y-6">
            
            {/* Step 1 */}
            <div className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 font-bold text-sm flex items-center justify-center border border-amber-500/40">
                1
              </span>
              <div className="space-y-2 flex-1">
                <h4 className="text-base font-semibold text-white">สร้างโปรเจกต์ใหม่ใน Firebase</h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  ไปที่เว็บไซต์{' '}
                  <a
                    href="https://console.firebase.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-400 underline font-medium hover:text-indigo-300 inline-flex items-center gap-1"
                  >
                    console.firebase.google.com
                    <ExternalLink size={12} />
                  </a>{' '}
                  ลงชื่อเข้าใช้ด้วยบัญชี Google แล้วกดปุ่ม <b>"Add project"</b> (เพิ่มโปรเจกต์) ตั้งชื่อโปรเจกต์ เช่น <code className="bg-slate-800 px-2 py-0.5 rounded text-amber-300">training-survey-app</code>
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 font-bold text-sm flex items-center justify-center border border-amber-500/40">
                2
              </span>
              <div className="space-y-2 flex-1">
                <h4 className="text-base font-semibold text-white">เปิดใช้งาน Firebase Realtime Database</h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  ในเมนูด้านซ้าย เลือก <b>Build</b> &gt; <b>Realtime Database</b> แล้วกด <b>Create Database</b>
                </p>
                <ul className="text-xs sm:text-sm text-slate-300 list-disc list-inside space-y-1 pl-2">
                  <li>เลือก Database location เป็น <b>Singapore (asia-southeast1)</b> หรือ United States</li>
                  <li>ในหน้า Security rules ให้เลือก <b>Start in test mode</b> (โหมดทดสอบ)</li>
                </ul>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 font-bold text-sm flex items-center justify-center border border-amber-500/40">
                3
              </span>
              <div className="space-y-2 flex-1">
                <h4 className="text-base font-semibold text-white">ตั้งค่า Rules ให้อนุญาตบันทึกและอ่านข้อมูล</h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  กดแท็บ <b>Rules</b> ด้านบน แล้วตรวจสอบให้มีคำสั่งอ่าน/เขียนดังนี้ จากนั้นกด <b>Publish</b>:
                </p>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                  <pre className="text-xs text-emerald-400 font-mono">
{`{
  "rules": {
    "responses": {
      ".read": true,
      ".write": true
    }
  }
}`}
                  </pre>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 font-bold text-sm flex items-center justify-center border border-amber-500/40">
                4
              </span>
              <div className="space-y-2 flex-1">
                <h4 className="text-base font-semibold text-white">คัดลอก firebaseConfig มาใส่ในโค้ด</h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  กดรูปฟันเฟือง <b>Project settings</b> &gt; เลื่อนลงมาล่างสุดที่หัวข้อ <b>"Your apps"</b> &gt; กดไอคอนเว็บ <code className="bg-slate-800 px-1 rounded">&lt;/&gt;</code> &gt; ตั้งชื่อแอพ แล้วคัดลอกก้อน <code className="text-amber-400">firebaseConfig</code> มาแทนที่ในทั้ง 2 ไฟล์:
                </p>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                  <pre className="text-xs text-indigo-300 font-mono">
{`const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};`}
                  </pre>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Tab 4: Free Deployment Guide */}
      {activeTab === 'deploy' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Rocket size={22} className="text-emerald-400" />
              <span>แนวทางการ Deploy ใช้งานฟรี 100% สำหรับการจัดอบรม</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              เนื่องจากแอปนี้เป็น HTML + JS แท้ ไม่ต้องมี Backend Server คุณจึงสามารถโฮสต์ฟรีได้หลากหลายวิธี:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Method 1: GitHub Pages */}
            <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold text-lg">
                🐙
              </div>
              <h4 className="font-bold text-white text-base">วิธีที่ 1: GitHub Pages (แนะนำ)</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                ฟรีตลอดกาล ได้โดเมน HTTPS เหมาะสำหรับการสร้าง QR Code ให้คนสแกน
              </p>
              <ol className="text-xs text-slate-300 list-decimal list-inside space-y-1.5 pl-1">
                <li>สร้าง Repository ใหม่บน GitHub เช่น <code className="text-indigo-400">survey-app</code></li>
                <li>อัปโหลดไฟล์ <code className="text-indigo-400">survey.html</code> และ <code className="text-indigo-400">dashboard.html</code> (หรือเปลี่ยนชื่อ survey.html เป็น <code className="text-emerald-400">index.html</code>)</li>
                <li>ไปที่ <b>Settings &gt; Pages</b></li>
                <li>เลือก Branch <b>main</b> แล้วกด <b>Save</b></li>
                <li>จะได้ URL เช่น: <code className="text-xs text-amber-300 break-all">username.github.io/survey-app</code></li>
              </ol>
            </div>

            {/* Method 2: Netlify Drop */}
            <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-900/40 text-cyan-400 flex items-center justify-center font-bold text-lg">
                ⚡
              </div>
              <h4 className="font-bold text-white text-base">วิธีที่ 2: Netlify Drop (เร็วสุด 10 วินาที)</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                ไม่ต้องติดตั้งโปรแกรม แค่ลากโฟลเดอร์วางบนหน้าเว็บ
              </p>
              <ol className="text-xs text-slate-300 list-decimal list-inside space-y-1.5 pl-1">
                <li>รวมไฟล์ HTML ทั้ง 2 ไฟล์ไว้ในโฟลเดอร์เดียวกัน</li>
                <li>เปิดเว็บ <b>app.netlify.com/drop</b></li>
                <li>ลากโฟลเดอร์ลงไปในกล่อง Drag and Drop</li>
                <li>ระบบจะประมวลผลและสร้าง URL HTTPS ให้ทันที</li>
                <li>ใช้งานได้ทันทีสำหรับการอบรมในวันนั้น!</li>
              </ol>
            </div>

            {/* Method 3: Firebase Hosting */}
            <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-900/40 text-amber-400 flex items-center justify-center font-bold text-lg">
                🔥
              </div>
              <h4 className="font-bold text-white text-base">วิธีที่ 3: Firebase Hosting</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                รวมศูนย์อยู่ในที่เดียวกับฐานข้อมูล Realtime Database
              </p>
              <ol className="text-xs text-slate-300 list-decimal list-inside space-y-1.5 pl-1">
                <li>เปิด Terminal แล้วพิมพ์:
                  <div className="bg-slate-900 p-1.5 rounded my-1 font-mono text-[11px] text-amber-300">
                    npm install -g firebase-tools
                  </div>
                </li>
                <li>พิมพ์ <code className="text-indigo-400">firebase login</code></li>
                <li>พิมพ์ <code className="text-indigo-400">firebase init hosting</code></li>
                <li>วางไฟล์ HTML ไว้ในโฟลเดอร์ public</li>
                <li>พิมพ์ <code className="text-emerald-400 font-bold">firebase deploy</code></li>
              </ol>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
