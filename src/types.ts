export interface SurveyResponse {
  id: string;
  timestamp: string;
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  q5: number;
  average: number;
  suggestion: string;
  deviceFingerprint?: string;
}

export interface QuestionDef {
  id: number;
  title: string;
  subtitle: string;
  category: string;
}

export const SURVEY_QUESTIONS: QuestionDef[] = [
  {
    id: 1,
    title: 'เนื้อหาหลักสูตรมีความน่าสนใจและเป็นประโยชน์',
    subtitle: 'เนื้อหาครอบคลุม ตรงประเด็น ทันสมัย และสอดคล้องกับวัตถุประสงค์',
    category: 'ด้านเนื้อหา'
  },
  {
    id: 2,
    title: 'วิทยากรมีความรู้ความเชี่ยวชาญและการถ่ายทอดที่ชัดเจน',
    subtitle: 'อธิบายเข้าใจง่าย ยกตัวอย่างชัดเจน และตอบข้อซักถามได้ตรงประเด็น',
    category: 'ด้านวิทยากร'
  },
  {
    id: 3,
    title: 'เทคนิค สื่อการสอน และเอกสารประกอบมีความเหมาะสม',
    subtitle: 'สไลด์สวยงาม กิจกรรมมีส่วนร่วม และเครื่องมือส่งเสริมการเรียนรู้',
    category: 'ด้านสื่อและเทคนิค'
  },
  {
    id: 4,
    title: 'การจัดสรรเวลาและการดำเนินกิจกรรมมีความเหมาะสม',
    subtitle: 'ระยะเวลากระชับ เหมาะสมกับเนื้อหา มีช่วงฝึกปฏิบัติและการพักผ่อนพอดี',
    category: 'ด้านการบริหารเวลา'
  },
  {
    id: 5,
    title: 'ประโยชน์ที่ได้รับสามารถนำไปปรับใช้จริงได้',
    subtitle: 'ช่วยเพิ่มพูนทักษะ พัฒนางาน และสร้างคุณค่าในการปฏิบัติงานจริง',
    category: 'ด้านการประยุกต์ใช้'
  }
];

export interface SatisfactionLevel {
  label: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  range: string;
  min: number;
  max: number;
  emoji: string;
}

export const SATISFACTION_LEVELS: SatisfactionLevel[] = [
  {
    label: 'มากที่สุด',
    colorClass: 'text-emerald-400',
    bgClass: 'bg-emerald-500/10',
    borderClass: 'border-emerald-500/30',
    range: '4.51 - 5.00',
    min: 4.51,
    max: 5.00,
    emoji: '🤩'
  },
  {
    label: 'มาก',
    colorClass: 'text-indigo-400',
    bgClass: 'bg-indigo-500/10',
    borderClass: 'border-indigo-500/30',
    range: '3.51 - 4.50',
    min: 3.51,
    max: 4.50,
    emoji: '😊'
  },
  {
    label: 'ปานกลาง',
    colorClass: 'text-amber-400',
    bgClass: 'bg-amber-500/10',
    borderClass: 'border-amber-500/30',
    range: '2.51 - 3.50',
    min: 2.51,
    max: 3.50,
    emoji: '😐'
  },
  {
    label: 'น้อย',
    colorClass: 'text-orange-400',
    bgClass: 'bg-orange-500/10',
    borderClass: 'border-orange-500/30',
    range: '1.51 - 2.50',
    min: 1.51,
    max: 2.50,
    emoji: '🙁'
  },
  {
    label: 'น้อยที่สุด',
    colorClass: 'text-rose-400',
    bgClass: 'bg-rose-500/10',
    borderClass: 'border-rose-500/30',
    range: '1.00 - 1.50',
    min: 1.00,
    max: 1.50,
    emoji: '😡'
  }
];

export function getSatisfactionInterpretation(avg: number): SatisfactionLevel {
  if (avg >= 4.51) return SATISFACTION_LEVELS[0];
  if (avg >= 3.51) return SATISFACTION_LEVELS[1];
  if (avg >= 2.51) return SATISFACTION_LEVELS[2];
  if (avg >= 1.51) return SATISFACTION_LEVELS[3];
  return SATISFACTION_LEVELS[4];
}
