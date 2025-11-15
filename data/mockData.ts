import { School, Student, AttendanceStatus, Teacher, TeacherStatus, TeacherJournalEntry, LearningMaterial, Assessment, StudentScore, UserType, AssessmentType, QuestionType, Comment } from '../types';

export const availableSubjects = ['Sejarah Indonesia', 'Geografi', 'Sosiologi', 'Ekonomi'];

export const initialSchools: School[] = [
    { id: 's1', name: 'SMA Negeri 1 Toraja Utara', npsn: '40302789', headmasterName: 'Drs. H. Patahuddin' },
    { id: 's2', name: 'SMP Negeri 2 Palopo', npsn: '40303721', headmasterName: 'Dra. Hj. Hasnawati' },
];

export const initialStudents: Student[] = [
  { id: '1', name: 'Ahmad Dahlan', nisn: '0012345678', status: AttendanceStatus.Alpha, className: 'Kelas 7A', subjects: availableSubjects, schoolId: 's1' },
  { id: '2', name: 'Bunga Citra', nisn: '0023456789', status: AttendanceStatus.Alpha, className: 'Kelas 7A', subjects: availableSubjects, schoolId: 's1' },
  { id: '3', name: 'Citra Kirana', nisn: '0034567890', status: AttendanceStatus.Alpha, className: 'Kelas 7B', subjects: availableSubjects, schoolId: 's1' },
  { id: '4', name: 'Dedi Corbuzier', nisn: '0045678901', status: AttendanceStatus.Alpha, className: 'Kelas 7B', subjects: availableSubjects, schoolId: 's2' },
  { id: '5', name: 'Eko Patrio', nisn: '0056789012', status: AttendanceStatus.Alpha, className: 'Kelas 8A', subjects: availableSubjects, schoolId: 's2' },
  { id: '6', name: 'Fajar Alfian', nisn: '0067890123', status: AttendanceStatus.Alpha, className: 'Kelas 8A', subjects: availableSubjects, schoolId: 's2' },
];

export const initialTeachers: Teacher[] = [
    {
        id: 't1',
        name: 'Budi Guru',
        email: 'budi.guru@sekolah.id',
        subjects: availableSubjects,
        waliKelas: 'Kelas 7A',
        schoolId: 's1',
        status: TeacherStatus.PNS
    },
    {
        id: 't2',
        name: 'Wati Guru',
        email: 'wati.guru@sekolah.id',
        subjects: ['Geografi', 'Sosiologi'],
        schoolId: 's2',
        status: TeacherStatus.Honorer
    }
];

export const initialTeacherJournals: TeacherJournalEntry[] = [
    {
        id: 'j1',
        date: '2023-10-26',
        time: '08:00',
        meetingNumber: 1,
        className: 'Kelas 7A',
        subject: 'Sejarah Indonesia',
        material: 'Pengenalan Kerajaan Kutai',
        notes: 'Siswa aktif bertanya.',
        schoolId: 's1'
    },
    {
        id: 'j2',
        date: '2023-10-27',
        time: '09:30',
        meetingNumber: 2,
        className: 'Kelas 8A',
        subject: 'Geografi',
        material: 'Peta dan Komponennya',
        notes: 'Memberikan tugas menggambar peta.',
        schoolId: 's2'
    },
];

const mockComments: Comment[] = [
    { id: 'c1', author: 'Ani Siswa', content: 'Materi ini sangat membantu, terima kasih!', userType: UserType.Siswa, timestamp: new Date() },
    { id: 'c2', author: 'Budi Guru', content: 'Sama-sama, jangan ragu bertanya jika ada yang kurang jelas.', userType: UserType.Guru, timestamp: new Date() }
];

export const initialMaterials: LearningMaterial[] = [
    {
        id: 'm1',
        title: 'Sejarah Rumah Adat Tongkonan',
        content: '<h1>Tongkonan</h1><p>Tongkonan adalah rumah adat masyarakat Toraja...</p>',
        thumbnailUrl: 'https://images.unsplash.com/photo-1588623228495-6531505535b4?q=80&w=1470&auto=format&fit=crop',
        schoolId: 's1',
        targetClass: 'Kelas 7A',
        durationJP: 2,
        views: 1200,
        rating: 4.8,
        reviews: 250,
        isFavorite: true,
        powerpoint: { name: 'Presentasi Tongkonan.pdf', url: 'data:application/pdf;base64,JVBERi0xLjQKJ...' },
        comments: mockComments,
        learningObjectives: 'Siswa dapat menjelaskan sejarah dan fungsi Tongkonan.',
        learningGoals: 'Memahami arsitektur unik Tongkonan.',
        graduateProfile: ['Kreativitas', 'Kewargaan'],
    },
    {
        id: 'm2',
        title: 'Upacara Adat Rambu Solo',
        content: '<h1>Rambu Solo</h1><p>Rambu Solo adalah upacara pemakaman...</p>',
        thumbnailUrl: 'https://images.unsplash.com/photo-1618492653765-a83a04919736?q=80&w=1374&auto=format&fit=crop',
        schoolId: 's1',
        targetClass: 'Semua Kelas',
        durationJP: 3,
        views: 2500,
        rating: 4.9,
        reviews: 500,
        isFavorite: false,
        powerpoint: { name: 'Presentasi Rambu Solo.pdf', url: 'data:application/pdf;base64,JVBERi0xLjQKJ...' },
        comments: [],
        learningObjectives: 'Siswa dapat mendeskripsikan prosesi upacara Rambu Solo.',
        learningGoals: 'Memahami makna filosofis di balik upacara.',
        graduateProfile: ['Keimanan dan ketakwaan', 'Kewargaan'],
    }
];

export const mockAssessments: Assessment[] = [
    {
        id: 'a1',
        title: 'Ulangan Harian: Rumah Adat Tongkonan',
        type: AssessmentType.UlanganHarian,
        schoolId: 's1',
        questions: [
            { id: 'q1', type: QuestionType.PilihanGanda, question: 'Apa nama rumah adat suku Toraja?', options: ['Honai', 'Gadang', 'Tongkonan'], correctAnswerIndex: 2 },
            { id: 'q2', type: QuestionType.Essay, question: 'Jelaskan fungsi utama dari Tongkonan.' }
        ]
    },
    {
        id: 'a2',
        title: 'UTS Sejarah Kebudayaan',
        type: AssessmentType.UTS,
        schoolId: 's2',
        questions: [
            { id: 'q3', type: QuestionType.PilihanGanda, question: 'Upacara pemakaman di Toraja disebut?', options: ['Rambu Solo', 'Rambu Tuka', 'Ma\'nene'], correctAnswerIndex: 0 },
        ]
    }
];

export const mockScores: StudentScore[] = [
    {
        studentName: 'Ahmad Dahlan',
        assessmentId: 'a1',
        score: 85,
        schoolId: 's1',
        answers: [
            { questionId: 'q1', answer: 2 },
            { questionId: 'q2', answer: 'Sebagai pusat kehidupan sosial dan budaya.' }
        ]
    }
];