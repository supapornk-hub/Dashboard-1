import { SurveyResponse } from '../types';

export function exportResponsesToCSV(responses: SurveyResponse[], filename = 'ผลการประเมินความพึงพอใจการอบรม.csv') {
  if (!responses || responses.length === 0) {
    alert('ยังไม่มีข้อมูลผลการประเมินสำหรับดาวน์โหลด');
    return;
  }

  const headers = [
    'ลำดับ',
    'วันที่-เวลา (Timestamp)',
    'ข้อ 1 (เนื้อหาหลักสูตร)',
    'ข้อ 2 (วิทยากรและการถ่ายทอด)',
    'ข้อ 3 (สื่อและเอกสารประกอบ)',
    'ข้อ 4 (การจัดสรรเวลา)',
    'ข้อ 5 (การนำไปปรับใช้)',
    'คะแนนเฉลี่ย',
    'ระดับความพึงพอใจ',
    'ข้อเสนอแนะเพิ่มเติม'
  ];

  function getLevelText(avg: number): string {
    if (avg >= 4.51) return 'มากที่สุด';
    if (avg >= 3.51) return 'มาก';
    if (avg >= 2.51) return 'ปานกลาง';
    if (avg >= 1.51) return 'น้อย';
    return 'น้อยที่สุด';
  }

  const rows = responses.map((r, index) => {
    const formattedDate = new Date(r.timestamp).toLocaleString('th-TH');
    const cleanSuggestion = (r.suggestion || '').replace(/"/g, '""');
    const level = getLevelText(r.average);

    return [
      index + 1,
      `"${formattedDate}"`,
      r.q1,
      r.q2,
      r.q3,
      r.q4,
      r.q5,
      r.average.toFixed(2),
      `"${level}"`,
      `"${cleanSuggestion}"`
    ];
  });

  // \uFEFF is UTF-8 Byte Order Mark for Excel
  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
