export enum UserType {
  Guru = 'guru',
  Siswa = 'siswa',
  Admin = 'admin',
}

export enum Screen {
  Home = 'home',
  Curriculum = 'curriculum',
  Chat = 'chat',
  Attendance = 'attendance',
  Profile = 'profile',
}

export enum AttendanceStatus {
  Hadir = 'Hadir',
  Izin = 'Izin',
  Sakit = 'Sakit',
  Alpha = 'Tidak Hadir',
}

export interface School {
  id: string;
  name: string;
  npsn: string;
  headmasterName: string;
}

export interface Student {
  id: string;
  name: string;
  nisn: string;
  status: AttendanceStatus;
  className: string;
  subjects: string[];
  schoolId: string;
}

export enum TeacherStatus {
  PNS = 'PNS',
  Honorer = 'Honorer',
  PPPK = 'PPPK',
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status?: TeacherStatus;
  photoUrl?: string; // Base64 data URL
  subjects: string[];
  waliKelas?: string; // Optional: The class they are a homeroom teacher for
  schoolId: string;
}

export interface TeacherJournalEntry {
  id: string;
  date: string; // YYYY-MM-DD format
  time: string; // HH:MM format
  meetingNumber: number;
  className: string;
  subject: string;
  material: string;
  notes: string;
  photoUrl?: string; // Base64 data URL
  schoolId: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  className: string;
  subject: string;
  schoolId: string;
}


export interface Comment {
  id: string;
  author: string;
  content: string;
  userType: UserType;
  timestamp: Date;
}

// New Types for Tana Toraja Screen
export interface LearningMaterial {
  id:string;
  title: string;
  content: string; // Could be markdown or plain text
  thumbnailUrl?: string; // Optional thumbnail image
  imageUrl?: string;
  videoUrl?: string;
  targetClass?: string;
  learningObjectives?: string; // Capaian Pembelajaran
  learningGoals?: string; // Tujuan Pembelajaran
  graduateProfile?: string[]; // Profil Lulusan
  fontFamily?: 'sans' | 'serif' | 'mono';
  isBold?: boolean;
  isItalic?: boolean;
  textAlign?: 'left' | 'center' | 'right';
  powerpoint?: {
    name: string;
    url: string; // Base64 Data URL
  };
  comments?: Comment[];
  schoolId: string;
  views?: number;
  durationJP?: number;
  rating?: number;
  reviews?: number;
  isFavorite?: boolean;
}

export enum AssessmentType {
  UlanganHarian = 'Ulangan Harian',
  UTS = 'Ujian Tengah Semester',
  UAS = 'Ujian Akhir Semester',
}

export enum QuestionType {
  PilihanGanda = 'Pilihan Ganda',
  Essay = 'Essay',
}

export interface MultipleChoiceQuestion {
  id: string;
  type: QuestionType.PilihanGanda;
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface EssayQuestion {
  id: string;
  type: QuestionType.Essay;
  question: string;
}

export type Question = MultipleChoiceQuestion | EssayQuestion;

export interface Assessment {
  id: string;
  title: string;
  type: AssessmentType;
  questions: Question[];
  schoolId: string;
}

export interface StudentAnswer {
  questionId: string;
  answer: number | string; // index for multiple choice, string for essay
}

export interface StudentScore {
    studentName: string;
    assessmentId: string;
    score: number;
    answers: StudentAnswer[];
    schoolId: string;
}

export interface Notification {
  id: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  relatedCourse: string;
}