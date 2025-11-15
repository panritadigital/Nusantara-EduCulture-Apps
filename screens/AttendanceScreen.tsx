import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Student, AttendanceStatus, TeacherJournalEntry, UserType, AttendanceRecord, Notification } from '../types';
import { Header } from '../components/Header';
import { DocumentArrowDownIcon, PencilIcon, TrashIcon, CameraIcon } from '../components/icons/SolidIcons';
import DailyAttendanceScreen from './DailyAttendanceScreen';

// Type definition for the jspdf library loaded from CDN
declare global {
  interface Window {
    jspdf: any;
  }
}

const availableSubjects = ['Sejarah Indonesia', 'Geografi', 'Sosiologi', 'Ekonomi'];
const availableClassesOptions = ['Kelas 7A', 'Kelas 7B', 'Kelas 8A', 'Kelas 8B'];

const generateAcademicYears = () => {
    const years = [];
    const currentYear = new Date().getFullYear();
    for (let i = 2023; i <= 2045; i++) {
        years.push(`${i}/${i + 1}`);
    }
    return years.reverse(); // Show most recent first
};

interface AttendanceScreenProps {
  user: { type: UserType; name: string; schoolId: string };
  students: Student[];
  setAllStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  teacherJournals: TeacherJournalEntry[];
  setAllTeacherJournals: React.Dispatch<React.SetStateAction<TeacherJournalEntry[]>>;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

const AddStudentModal: React.FC<{
    students: Student[];
    onClose: () => void;
    onSave: (student: Omit<Student, 'id' | 'status' | 'schoolId'>) => void;
    schoolId: string;
}> = ({ students, onClose, onSave, schoolId }) => {
    const [name, setName] = useState('');
    const [nisn, setNisn] = useState('');
    const [className, setClassName] = useState(availableClassesOptions[0]);
    const [subjects, setSubjects] = useState<string[]>([]);

    const handleSubjectChange = (subject: string) => {
        setSubjects(prev =>
            prev.includes(subject)
                ? prev.filter(s => s !== subject)
                : [...prev, subject]
        );
    };

    const handleSubmit = () => {
        const trimmedName = name.trim();
        const trimmedNisn = nisn.trim();

        if (!trimmedName || !trimmedNisn || !className) {
            alert('Harap isi Nama, NISN, dan Kelas.');
            return;
        }
        
        if (subjects.length === 0) {
            alert('Harap pilih minimal satu mata pelajaran.');
            return;
        }

        const nisnRegex = /^\d{10}$/;
        if (!nisnRegex.test(trimmedNisn)) {
            alert('NISN tidak valid. NISN harus terdiri dari 10 digit angka.');
            return;
        }

        // Check for NISN uniqueness within the same school
        if (students.some(student => student.nisn === trimmedNisn && student.schoolId === schoolId)) {
            alert('NISN sudah terdaftar di sekolah ini. Harap gunakan NISN yang lain.');
            return;
        }

        onSave({ name: trimmedName, nisn: trimmedNisn, className, subjects });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <h3 className="text-xl font-bold text-brand-primary mb-4">Tambah Siswa Baru</h3>
                    <div className="space-y-4">
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="Nama Lengkap Siswa" />
                        <input type="text" value={nisn} onChange={e => setNisn(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="10 digit NISN" />
                        <select value={className} onChange={e => setClassName(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white">
                            {availableClassesOptions.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                         <div>
                            <label className="text-sm font-medium text-gray-700">Mata Pelajaran yang Diikuti</label>
                            <div className="grid grid-cols-2 gap-2 mt-2 border p-3 rounded-md bg-gray-50">
                                {availableSubjects.map(subject => (
                                    <label key={subject} className="flex items-center space-x-2 text-sm cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={subjects.includes(subject)}
                                            onChange={() => handleSubjectChange(subject)}
                                            className="rounded text-brand-primary focus:ring-brand-secondary"
                                        />
                                        <span>{subject}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                        <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md text-sm font-semibold">Batal</button>
                        <button onClick={handleSubmit} className="px-4 py-2 bg-brand-primary text-white rounded-md text-sm font-semibold">Simpan</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const JournalModal: React.FC<{
  onClose: () => void;
  onSave: (entry: Omit<TeacherJournalEntry, 'id' | 'schoolId'> & { id?: string }) => void;
  initialData?: TeacherJournalEntry | null;
}> = ({ onClose, onSave, initialData }) => {
    const today = new Date().toISOString().split('T');
    const [date, setDate] = useState(today[0]);
    const [time, setTime] = useState(new Date().toTimeString().substring(0,5));
    const [className, setClassName] = useState(availableClassesOptions[0]);
    const [subject, setSubject] = useState('');
    const [meetingNumber, setMeetingNumber] = useState(1);
    const [material, setMaterial] = useState('');
    const [notes, setNotes] = useState('');
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const photoInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if(initialData) {
            setDate(initialData.date);
            setTime(initialData.time);
            setClassName(initialData.className);
            setSubject(initialData.subject);
            setMeetingNumber(initialData.meetingNumber);
            setMaterial(initialData.material);
            setNotes(initialData.notes);
            setPhotoUrl(initialData.photoUrl || null);
        }
    }, [initialData]);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB
                alert("Ukuran foto tidak boleh melebihi 2MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => setPhotoUrl(reader.result as string);
            reader.readAsDataURL(file);
        }
    };
    
    const handleSubmit = () => {
        if (!date || !time || !className || !subject.trim() || !material.trim()) {
            alert('Harap isi semua kolom yang wajib diisi (Tanggal, Waktu, Kelas, Mapel, Materi).');
            return;
        }
        onSave({
            id: initialData?.id,
            date, time, className, subject: subject.trim(), meetingNumber, material: material.trim(), notes: notes.trim(),
            photoUrl: photoUrl || undefined,
        });
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
                <h3 className="text-xl font-bold text-brand-primary mb-4">{initialData ? 'Edit Jurnal' : 'Tambah Jurnal Harian'}</h3>
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm"/>
                        <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm"/>
                    </div>
                    <select value={className} onChange={e => setClassName(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white text-sm">
                        {availableClassesOptions.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input 
                        type="text" 
                        value={subject} 
                        onChange={e => setSubject(e.target.value)} 
                        className="w-full px-3 py-2 border rounded-md text-sm"
                        placeholder="Mata Pelajaran"
                    />
                    <input type="number" value={meetingNumber} onChange={e => setMeetingNumber(parseInt(e.target.value))} className="w-full px-3 py-2 border rounded-md text-sm" placeholder="Pertemuan Ke-" min="1"/>
                    <textarea value={material} onChange={e => setMaterial(e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-md text-sm" placeholder="Materi yang Diajarkan"></textarea>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-md text-sm" placeholder="Catatan/Keterangan"></textarea>
                    
                     <div>
                        <input type="file" accept="image/*" ref={photoInputRef} className="hidden" onChange={handlePhotoUpload} />
                        <button type="button" onClick={() => photoInputRef.current?.click()} className="w-full flex items-center justify-center space-x-2 px-3 py-2 border-2 border-dashed rounded-md text-sm font-medium text-gray-500 hover:border-brand-secondary">
                           <CameraIcon className="w-5 h-5"/>
                           <span>{photoUrl ? 'Ganti Foto Dokumentasi' : 'Unggah Foto Dokumentasi'}</span>
                        </button>
                         {photoUrl && <img src={photoUrl} alt="Preview" className="mt-2 rounded-md max-h-40 w-auto mx-auto"/>}
                    </div>
                </div>
                 <div className="flex justify-end space-x-3 mt-6">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md text-sm font-semibold">Batal</button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-brand-primary text-white rounded-md text-sm font-semibold">Simpan Jurnal</button>
                </div>
            </div>
        </div>
    );
};

export default function AttendanceScreen({ user, students: schoolStudents, setAllStudents, teacherJournals, setAllTeacherJournals, notifications, setNotifications }: AttendanceScreenProps) {
  const [allAttendanceRecords, setAllAttendanceRecords] = useState<AttendanceRecord[]>([]);

  const schoolAttendanceRecords = useMemo(() => allAttendanceRecords.filter(r => r.schoolId === user.schoolId), [allAttendanceRecords, user.schoolId]);

  const [activeTab, setActiveTab] = useState('siswa');
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [journalToEdit, setJournalToEdit] = useState<TeacherJournalEntry | null>(null);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const importFileRef = useRef<HTMLInputElement>(null);
  const academicYears = useMemo(() => generateAcademicYears(), []);

  // States for taking attendance
  const [attendanceSession, setAttendanceSession] = useState<{className: string; subject: string} | null>(null);
  const [selectedClassForAttendance, setSelectedClassForAttendance] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  // States for recap
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(academicYears[0]);
  const [selectedClassForRecap, setSelectedClassForRecap] = useState('');
  const [selectedSubjectForRecap, setSelectedSubjectForRecap] = useState(availableSubjects[0]);
  
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const toISODateString = (date: Date) => date.toISOString().split('T')[0];

  const [recapStartDate, setRecapStartDate] = useState(toISODateString(firstDayOfMonth));
  const [recapEndDate, setRecapEndDate] = useState(toISODateString(today));
  
  // States for Journal Recap
  const [journalRecapStart, setJournalRecapStart] = useState(toISODateString(firstDayOfMonth));
  const [journalRecapEnd, setJournalRecapEnd] = useState(toISODateString(today));
  const [journalRecapClassFilter, setJournalRecapClassFilter] = useState(''); // '' means all
  const [journalRecapSubjectFilter, setJournalRecapSubjectFilter] = useState(''); // '' means all


  const managedClasses = useMemo(() => [...new Set(schoolStudents.map(s => s.className))].sort(), [schoolStudents]);
  
  useEffect(() => {
    if (managedClasses.length > 0 && !selectedClassForRecap) {
        setSelectedClassForRecap(managedClasses[0]);
    } else if (managedClasses.length === 0) {
        setSelectedClassForRecap('');
    }
  }, [managedClasses, selectedClassForRecap]);


  const handleSaveStudent = (newStudentData: Omit<Student, 'id' | 'status' | 'schoolId'>) => {
    const newStudent: Student = {
        id: `student-${Date.now()}`,
        ...newStudentData,
        status: AttendanceStatus.Alpha,
        schoolId: user.schoolId,
    };
    setAllStudents(prev => [...prev, newStudent].sort((a,b) => a.name.localeCompare(b.name)));
    setIsAddStudentModalOpen(false);
  };

  const handleImportClick = () => importFileRef.current?.click();

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        console.log(`Importing file: ${file.name}`);
        const newStudents: Student[] = [
            { id: `student-${Date.now()+1}`, name: 'Gita Savitri (Impor)', nisn: '0078901234', status: AttendanceStatus.Alpha, className: 'Kelas 8B', subjects: ['Sejarah Indonesia', 'Sosiologi'], schoolId: user.schoolId },
            { id: `student-${Date.now()+2}`, name: 'Harris Vriza (Impor)', nisn: '0089012345', status: AttendanceStatus.Alpha, className: 'Kelas 8B', subjects: ['Geografi', 'Ekonomi'], schoolId: user.schoolId },
        ];
        setAllStudents(prev => [...prev, ...newStudents].sort((a,b) => a.name.localeCompare(b.name)));
        alert(`${newStudents.length} siswa berhasil diimpor.`);
    }
    event.target.value = '';
  };
  
  const handleSaveAttendance = (records: { studentId: string; status: AttendanceStatus }[]) => {
      const today = new Date().toISOString().split('T')[0];
      const newRecords: AttendanceRecord[] = records.map(rec => ({
          id: `att-${rec.studentId}-${today}-${Math.random()}`,
          studentId: rec.studentId,
          date: today,
          status: rec.status,
          className: attendanceSession!.className,
          subject: attendanceSession!.subject,
          schoolId: user.schoolId,
      }));

      setAllAttendanceRecords(prev => {
          const otherRecords = prev.filter(r => 
              !(r.date === today && r.className === attendanceSession!.className && r.subject === attendanceSession!.subject && r.schoolId === user.schoolId)
          );
          return [...otherRecords, ...newRecords];
      });
  };
  
  const handleDownloadRecapPdf = () => {
    const startDate = new Date(recapStartDate);
    const endDate = new Date(recapEndDate);
    endDate.setHours(23, 59, 59, 999); 

    if (!recapStartDate || !recapEndDate || startDate > endDate) {
        alert("Rentang tanggal tidak valid.");
        return;
    }

    const studentsToRecap = schoolStudents.filter(s => s.className === selectedClassForRecap && s.subjects.includes(selectedSubjectForRecap));

    if (studentsToRecap.length === 0) {
        alert("Tidak ada siswa di kelas atau mata pelajaran yang dipilih untuk direkap.");
        return;
    }

    const recordsForPeriod = schoolAttendanceRecords.filter(r => {
        const recordDate = new Date(r.date);
        return r.className === selectedClassForRecap &&
               r.subject === selectedSubjectForRecap &&
               recordDate >= startDate &&
               recordDate <= endDate;
    });

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait' });

    doc.setFontSize(16);
    doc.text('Rekap Absensi Siswa', 14, 22);
    doc.setFontSize(12);
    doc.text(`Kelas: ${selectedClassForRecap}`, 14, 30);
    doc.text(`Mata Pelajaran: ${selectedSubjectForRecap}`, 14, 36);
    doc.text(`Periode: ${startDate.toLocaleDateString('id-ID')} - ${endDate.toLocaleDateString('id-ID')}`, 14, 42);
    doc.text(`Guru: ${user.name}`, 14, 48);
    doc.text(`Tahun Ajaran: ${selectedAcademicYear}`, 14, 54);

    const tableColumn = ["No", "Nama Siswa", "Hadir", "Sakit", "Izin", "Alpha"];

    const attendanceSummary = new Map<string, { H: number; S: number; I: number; A: number }>();
    studentsToRecap.forEach(student => {
        attendanceSummary.set(student.id, { H: 0, S: 0, I: 0, A: 0 });
    });

    recordsForPeriod.forEach(record => {
        const summary = attendanceSummary.get(record.studentId);
        if (summary) {
            if (record.status === AttendanceStatus.Hadir) summary.H++;
            else if (record.status === AttendanceStatus.Sakit) summary.S++;
            else if (record.status === AttendanceStatus.Izin) summary.I++;
            else summary.A++;
        }
    });

    const tableRows = studentsToRecap.map((student, index) => {
        const summary = attendanceSummary.get(student.id) || { H: 0, S: 0, I: 0, A: 0 };
        return [
            index + 1,
            student.name,
            summary.H,
            summary.S,
            summary.I,
            summary.A,
        ];
    });

    (doc as any).autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 62,
        theme: 'grid',
        headStyles: { fillColor: [74, 46, 42], halign: 'center' },
        styles: { halign: 'center' },
        columnStyles: { 1: { halign: 'left' } }
    });

    doc.save(`rekap_absensi_${selectedClassForRecap}_${selectedSubjectForRecap.replace(/\s/g, '_')}_${recapStartDate}_${recapEndDate}.pdf`);
  };

  const handleSaveJournal = (entryData: Omit<TeacherJournalEntry, 'id' | 'schoolId'> & { id?: string }) => {
    setAllTeacherJournals(currentJournals => {
        if (entryData.id) {
            return currentJournals.map(j =>
                j.id === entryData.id ? { ...j, ...entryData, schoolId: user.schoolId } as TeacherJournalEntry : j
            );
        } else {
            const newJournal: TeacherJournalEntry = {
                ...entryData,
                id: `journal-${Date.now()}`,
                schoolId: user.schoolId,
            } as TeacherJournalEntry;
            return [...currentJournals, newJournal].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }
    });
    setIsJournalModalOpen(false);
    setJournalToEdit(null);
  };
  
  const handleEditJournalClick = (journal: TeacherJournalEntry) => {
      setJournalToEdit(journal);
      setIsJournalModalOpen(true);
  };

  const handleDeleteJournal = (journalId: string) => {
      if(window.confirm('Apakah Anda yakin ingin menghapus jurnal ini?')) {
          setAllTeacherJournals(prev => prev.filter(j => j.id !== journalId));
      }
  };
  
   const handleDownloadJournalRecapPdf = () => {
    const startDate = new Date(journalRecapStart);
    const endDate = new Date(journalRecapEnd);
    endDate.setHours(23, 59, 59, 999);

    if (!journalRecapStart || !journalRecapEnd || startDate > endDate) {
        alert("Rentang tanggal tidak valid.");
        return;
    }

    const journalsToRecap = teacherJournals
        .filter(j => {
            const journalDate = new Date(j.date);
            const isDateInRange = journalDate >= startDate && journalDate <= endDate;
            const isClassMatch = !journalRecapClassFilter || j.className === journalRecapClassFilter;
            const isSubjectMatch = !journalRecapSubjectFilter || j.subject.toLowerCase().includes(journalRecapSubjectFilter.toLowerCase());
            return isDateInRange && isClassMatch && isSubjectMatch;
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    if (journalsToRecap.length === 0) {
        alert("Tidak ada data jurnal yang sesuai dengan filter dan rentang tanggal yang dipilih.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    doc.setFontSize(16);
    doc.text('Rekap Jurnal Harian Guru', 14, 15);
    doc.setFontSize(12);
    doc.text(`Guru: ${user.name}`, 14, 22);
    doc.text(`Periode: ${startDate.toLocaleDateString('id-ID')} - ${endDate.toLocaleDateString('id-ID')}`, 14, 28);
    
    const tableColumn = ['Tanggal', 'Waktu', 'Kelas', 'Mapel', 'Materi Pembahasan', 'Catatan'];
    const tableRows = journalsToRecap.map(j => [
        new Date(j.date).toLocaleDateString('id-ID'),
        j.time,
        j.className,
        j.subject,
        j.material,
        j.notes
    ]);

    (doc as any).autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 35,
        theme: 'grid',
        headStyles: { fillColor: [74, 46, 42] },
        styles: { fontSize: 8 },
        columnStyles: {
            0: { cellWidth: 20 },
            1: { cellWidth: 15 },
            2: { cellWidth: 20 },
            3: { cellWidth: 30 },
            4: { cellWidth: 'auto' },
            5: { cellWidth: 'auto' },
        }
    });

    const fileName = `rekap_jurnal_harian_${user.name.replace(/\s/g, '_')}_${journalRecapStart}_${journalRecapEnd}.pdf`;
    doc.save(fileName);
};


  if (attendanceSession) {
    const studentsForSession = schoolStudents.filter(s => 
        s.className === attendanceSession.className && 
        s.subjects.includes(attendanceSession.subject)
    );
    return (
        <DailyAttendanceScreen 
            className={attendanceSession.className}
            subject={attendanceSession.subject}
            students={studentsForSession}
            onSaveAttendance={handleSaveAttendance}
            onBack={() => setAttendanceSession(null)}
        />
    )
  }
  
  const activeTabClass = 'border-b-2 border-brand-primary text-brand-primary';

  return (
    <div className="space-y-4">
      <Header subtitle="Daftar Hadir" user={user} notifications={notifications} setNotifications={setNotifications} />
       <input type="file" ref={importFileRef} className="hidden" accept=".xlsx, .xls, .csv" onChange={handleFileImport} />

      <div className="px-4 space-y-4">
        <div className="flex border-b">
            <button onClick={() => setActiveTab('siswa')} className={`w-1/2 py-3 font-semibold ${activeTab === 'siswa' ? activeTabClass : 'text-gray-500'}`}>
              Kehadiran Siswa
            </button>
            <button onClick={() => setActiveTab('guru')} className={`w-1/2 py-3 font-semibold ${activeTab === 'guru' ? activeTabClass : 'text-gray-500'}`}>
              Jurnal Harian Guru
            </button>
          </div>

          {activeTab === 'siswa' ? (
              <div className="space-y-6">
                  {/* Section: Take Attendance */}
                  <div className="p-4 bg-gray-50 border rounded-lg space-y-3">
                      <h3 className="text-md font-semibold text-brand-primary">Ambil Absensi Hari Ini</h3>
                      <select value={selectedClassForAttendance} onChange={e => setSelectedClassForAttendance(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white">
                          <option value="">-- Pilih Kelas --</option>
                          {managedClasses.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white">
                          <option value="">-- Pilih Mata Pelajaran --</option>
                          {availableSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <button 
                          onClick={() => setAttendanceSession({className: selectedClassForAttendance, subject: selectedSubject})}
                          disabled={!selectedClassForAttendance || !selectedSubject}
                          className="w-full bg-green-500 text-white font-semibold py-2 rounded-md hover:bg-green-600 transition-colors disabled:bg-gray-400"
                      >
                          Mulai Absensi
                      </button>
                  </div>

                  {/* Section: Recap */}
                  <div className="p-4 bg-gray-50 border rounded-lg space-y-4">
                      <h3 className="text-md font-semibold text-brand-primary">Rekap Absensi</h3>
                      <div className="space-y-3">
                          <select value={selectedAcademicYear} onChange={e => setSelectedAcademicYear(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white text-sm">
                              {academicYears.map(y => <option key={y} value={y}>{`T.A. ${y}`}</option>)}
                          </select>
                           <select value={selectedClassForRecap} onChange={e => setSelectedClassForRecap(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white text-sm">
                                {managedClasses.length > 0 ? managedClasses.map(c => <option key={c} value={c}>{c}</option>) : <option>-- Tidak ada kelas --</option>}
                           </select>
                           <select value={selectedSubjectForRecap} onChange={e => setSelectedSubjectForRecap(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white text-sm">
                                {availableSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                           </select>
                      </div>
                       <div className="grid grid-cols-2 gap-3">
                          <div>
                              <label className="text-xs text-gray-500 font-medium">Tanggal Mulai</label>
                              <input type="date" value={recapStartDate} onChange={e => setRecapStartDate(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white text-sm mt-1" />
                          </div>
                          <div>
                              <label className="text-xs text-gray-500 font-medium">Tanggal Akhir</label>
                              <input type="date" value={recapEndDate} onChange={e => setRecapEndDate(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white text-sm mt-1" />
                          </div>
                       </div>
                       <button onClick={handleDownloadRecapPdf} disabled={!selectedClassForRecap} className="w-full bg-brand-primary text-white py-2 rounded-md font-semibold hover:bg-opacity-90 flex items-center justify-center space-x-2 disabled:bg-gray-400">
                          <DocumentArrowDownIcon className="h-5 w-5" />
                          <span>Download Rekap (PDF)</span>
                      </button>
                  </div>

                  {(user.type === UserType.Admin || user.type === UserType.Guru) && (
                    <div className="p-4 bg-gray-50 border rounded-lg space-y-3">
                        <h3 className="text-md font-semibold text-brand-primary">Manajemen Siswa</h3>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button onClick={() => setIsAddStudentModalOpen(true)} className="w-full bg-brand-secondary text-white py-2 rounded-md font-semibold">Tambah Siswa</button>
                            <button onClick={handleImportClick} className="w-full bg-white text-brand-primary border border-brand-primary py-2 rounded-md font-semibold">Impor Excel</button>
                        </div>
                    </div>
                  )}
              </div>
          ) : (
             <div className="space-y-4">
                 <button onClick={() => { setJournalToEdit(null); setIsJournalModalOpen(true); }} className="w-full bg-brand-secondary text-white py-2 rounded-md font-semibold">
                    + Tambah Jurnal Harian
                </button>
                
                 {/* Journal Recap Section */}
                <div className="p-4 bg-gray-50 border rounded-lg space-y-4">
                  <h3 className="text-md font-semibold text-brand-primary">Rekap Jurnal Harian</h3>
                  <div className="grid grid-cols-2 gap-3">
                      <div>
                          <label className="text-xs text-gray-500 font-medium">Tanggal Mulai</label>
                          <input type="date" value={journalRecapStart} onChange={e => setJournalRecapStart(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white text-sm mt-1" />
                      </div>
                      <div>
                          <label className="text-xs text-gray-500 font-medium">Tanggal Akhir</label>
                          <input type="date" value={journalRecapEnd} onChange={e => setJournalRecapEnd(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white text-sm mt-1" />
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-3 mt-2">
                        <div>
                            <label className="text-xs text-gray-500 font-medium">Filter Kelas</label>
                             <select value={journalRecapClassFilter} onChange={e => setJournalRecapClassFilter(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white text-sm mt-1">
                                <option value="">Semua Kelas</option>
                                {availableClassesOptions.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 font-medium">Filter Mata Pelajaran</label>
                            <input 
                                type="text" 
                                value={journalRecapSubjectFilter} 
                                onChange={e => setJournalRecapSubjectFilter(e.target.value)} 
                                placeholder="Ketik nama mapel..."
                                className="w-full px-3 py-2 border rounded-md bg-white text-sm mt-1" />
                        </div>
                   </div>
                   <button onClick={handleDownloadJournalRecapPdf} className="w-full bg-brand-primary text-white py-2 rounded-md font-semibold hover:bg-opacity-90 flex items-center justify-center space-x-2">
                      <DocumentArrowDownIcon className="h-5 w-5" />
                      <span>Download Rekap Jurnal (PDF)</span>
                  </button>
                </div>

                 {/* Journal List */}
                <div className="space-y-3">
                    {teacherJournals.length > 0 ? (
                        teacherJournals.map(journal => (
                            <div key={journal.id} className="bg-white p-4 rounded-lg shadow-md space-y-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-brand-primary">{journal.subject} - {journal.className}</p>
                                        <p className="text-xs text-gray-500">{new Date(journal.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} | {journal.time}</p>
                                    </div>
                                    <div className="flex space-x-1">
                                         <button onClick={() => handleEditJournalClick(journal)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full" aria-label="Edit">
                                            <PencilIcon className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDeleteJournal(journal.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full" aria-label="Hapus">
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Materi: <span className="font-normal">{journal.material}</span></p>
                                    <p className="text-sm font-medium">Catatan: <span className="font-normal italic text-gray-600">{journal.notes || '-'}</span></p>
                                </div>
                                {journal.photoUrl && <img src={journal.photoUrl} alt="Dokumentasi" className="rounded-md max-h-48 w-auto"/>}
                            </div>
                        ))
                    ) : (
                         <div className="col-span-1 md:col-span-2 text-center text-gray-500 py-8 bg-white rounded-lg shadow-md">
                            <p>Belum ada data jurnal harian.</p>
                        </div>
                    )}
                </div>

             </div>
          )}
      </div>
       {isJournalModalOpen && <JournalModal initialData={journalToEdit} onClose={() => { setIsJournalModalOpen(false); setJournalToEdit(null); }} onSave={handleSaveJournal} />}
       {isAddStudentModalOpen && <AddStudentModal students={schoolStudents} onClose={() => setIsAddStudentModalOpen(false)} onSave={handleSaveStudent} schoolId={user.schoolId} />}
    </div>
  );
}
