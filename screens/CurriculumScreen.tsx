import React, { useState, useRef, useEffect } from 'react';
import { UserType, Teacher, Student, AttendanceStatus, TeacherStatus, Notification } from '../types';
import { Header } from '../components/Header';
import { UserCircleIcon, PencilIcon, TrashIcon } from '../components/icons/SolidIcons';


const availableClassesOptions = ['Kelas 7A', 'Kelas 7B', 'Kelas 8A', 'Kelas 8B'];

interface CurriculumScreenProps {
  user: { type: UserType; name: string; schoolId: string };
  teachers: Teacher[];
  students: Student[];
  setAllTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
  setAllStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

const TeacherModal: React.FC<{
  initialData?: Teacher | null;
  onClose: () => void;
  onSave: (teacher: Omit<Teacher, 'schoolId'> & { id?: string }) => void;
}> = ({ initialData, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [status, setStatus] = useState<TeacherStatus | ''>('');
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [subjectsInput, setSubjectsInput] = useState('');
    const [waliKelas, setWaliKelas] = useState('');
    const photoInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setEmail(initialData.email);
            setPhone(initialData.phone || '');
            setStatus(initialData.status || '');
            setPhotoUrl(initialData.photoUrl || null);
            setSubjectsInput(initialData.subjects.join(', '));
            setWaliKelas(initialData.waliKelas || '');
        }
    }, [initialData]);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                alert("Ukuran foto tidak boleh melebihi 2MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = () => {
        const subjects = subjectsInput.split(',').map(s => s.trim()).filter(Boolean);
        if (!name.trim() || !email.trim() || !phone.trim() || !status || subjects.length === 0) {
            alert('Harap isi semua kolom yang wajib diisi: Nama, Email, Nomor Telepon, Status, dan Mata Pelajaran.');
            return;
        }
        onSave({ 
            id: initialData?.id,
            name,
            email,
            phone,
            status: status as TeacherStatus,
            photoUrl: photoUrl || undefined,
            subjects,
            waliKelas: waliKelas || undefined
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
                <h3 className="text-xl font-bold text-brand-primary mb-4">{initialData ? 'Edit Data Guru' : 'Tambah Guru Baru'}</h3>
                <div className="space-y-4">
                    <div className="flex flex-col items-center space-y-2">
                        <input type="file" accept="image/*" ref={photoInputRef} className="hidden" onChange={handlePhotoUpload} />
                        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                            {photoUrl ? (
                                <img src={photoUrl} alt="Preview Guru" className="w-full h-full object-cover" />
                            ) : (
                                <UserCircleIcon className="w-20 h-20 text-gray-400" />
                            )}
                        </div>
                        <button type="button" onClick={() => photoInputRef.current?.click()} className="text-sm font-medium text-brand-secondary hover:underline">
                            {photoUrl ? 'Ganti Foto' : 'Unggah Foto'}
                        </button>
                    </div>

                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="Nama Lengkap Guru" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="Email Guru" />
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="Nomor Telepon" />
                    
                    <select value={status} onChange={e => setStatus(e.target.value as TeacherStatus)} className="w-full px-3 py-2 border rounded-md bg-white text-gray-500">
                        <option value="" disabled>-- Pilih Status Kepegawaian --</option>
                        {Object.values(TeacherStatus).map(s => <option key={s} value={s} className="text-black">{s}</option>)}
                    </select>

                    <input
                        type="text"
                        value={subjectsInput}
                        onChange={e => setSubjectsInput(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="Mata Pelajaran (pisahkan dengan koma)"
                    />

                    <select value={waliKelas} onChange={e => setWaliKelas(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white">
                        <option value="">-- Pilih Wali Kelas (Opsional) --</option>
                        {availableClassesOptions.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md text-sm font-semibold">Batal</button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-brand-primary text-white rounded-md text-sm font-semibold">Simpan</button>
                </div>
            </div>
        </div>
    );
};


const StudentModal: React.FC<{
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
            prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
        );
    };

    const handleSubmit = () => {
        const trimmedName = name.trim();
        const trimmedNisn = nisn.trim();

        if (!trimmedName || !trimmedNisn || !className || subjects.length === 0) {
            alert('Harap isi Nama, NISN, Kelas, dan pilih minimal satu mata pelajaran.');
            return;
        }
        if (!/^\d{10}$/.test(trimmedNisn)) {
            alert('NISN tidak valid. Harus 10 digit angka.');
            return;
        }
        if (students.some(student => student.nisn === trimmedNisn && student.schoolId === schoolId)) {
            alert('NISN sudah terdaftar di sekolah ini.');
            return;
        }
        onSave({ name: trimmedName, nisn: trimmedNisn, className, subjects });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
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
                            {['Sejarah Indonesia', 'Geografi', 'Sosiologi', 'Ekonomi'].map(subject => (
                                <label key={subject} className="flex items-center space-x-2 text-sm cursor-pointer">
                                    <input type="checkbox" checked={subjects.includes(subject)} onChange={() => handleSubjectChange(subject)} className="rounded text-brand-primary focus:ring-brand-secondary" />
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
    );
};

export default function CurriculumScreen({ user, teachers, students, setAllTeachers, setAllStudents, notifications, setNotifications }: CurriculumScreenProps) {
    const [activeTab, setActiveTab] = useState('guru');
    const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
    const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
    const [teacherToEdit, setTeacherToEdit] = useState<Teacher | null>(null);

    const handleSaveTeacher = (teacherData: Omit<Teacher, 'schoolId'> & { id?: string }) => {
        setAllTeachers(currentTeachers => {
            if (teacherData.id) {
                // Update existing teacher
                return currentTeachers.map(t =>
                    t.id === teacherData.id
                        ? { ...t, ...teacherData, schoolId: user.schoolId } as Teacher
                        : t
                );
            } else {
                // Add new teacher
                const newTeacher: Teacher = {
                    ...teacherData,
                    id: `teacher-${Date.now()}`,
                    schoolId: user.schoolId,
                } as Teacher;
                return [...currentTeachers, newTeacher].sort((a, b) => a.name.localeCompare(b.name));
            }
        });
        setIsTeacherModalOpen(false);
        setTeacherToEdit(null);
    };
    
    const handleEditTeacherClick = (teacher: Teacher) => {
        setTeacherToEdit(teacher);
        setIsTeacherModalOpen(true);
    };

    const handleDeleteTeacher = (teacherIdToDelete: string) => {
        // Show confirmation dialog first
        const isConfirmed = window.confirm('Apakah Anda yakin ingin menghapus data guru ini? Tindakan ini tidak dapat diurungkan.');
        
        // Only proceed if the user confirms
        if (isConfirmed) {
            setAllTeachers(currentTeachers => 
                // Create a new array excluding the teacher to be deleted
                currentTeachers.filter(teacher => teacher.id !== teacherIdToDelete)
            );
        }
    };

    const handleSaveStudent = (newStudentData: Omit<Student, 'id' | 'status' | 'schoolId'>) => {
        const newStudent: Student = {
            id: `student-${Date.now()}`,
            ...newStudentData,
            status: AttendanceStatus.Alpha,
            schoolId: user.schoolId,
        };
        setAllStudents(prev => [...prev, newStudent].sort((a, b) => a.name.localeCompare(b.name)));
        setIsStudentModalOpen(false);
    };

    const activeTabClass = 'border-b-2 border-brand-primary text-brand-primary';

    return (
        <div className="space-y-4">
            <Header subtitle="Manajemen Kurikulum" user={user} notifications={notifications} setNotifications={setNotifications} />

            <div className="px-4 space-y-4">
                <div className="flex border-b">
                    <button onClick={() => setActiveTab('guru')} className={`w-1/2 py-3 font-semibold ${activeTab === 'guru' ? activeTabClass : 'text-gray-500'}`}>
                        Data Guru
                    </button>
                    <button onClick={() => setActiveTab('siswa')} className={`w-1/2 py-3 font-semibold ${activeTab === 'siswa' ? activeTabClass : 'text-gray-500'}`}>
                        Data Siswa
                    </button>
                </div>

                {activeTab === 'guru' && (
                    <div className="space-y-4">
                        <button onClick={() => { setTeacherToEdit(null); setIsTeacherModalOpen(true); }} className="w-full bg-brand-secondary text-white py-2 rounded-md font-semibold">
                            + Tambah Guru
                        </button>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {teachers.length > 0 ? (
                                teachers.map(teacher => (
                                    <div key={teacher.id} className="bg-white p-4 rounded-lg shadow-md space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                                    {teacher.photoUrl ? (
                                                        <img src={teacher.photoUrl} alt={teacher.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <UserCircleIcon className="w-14 h-14 text-gray-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-brand-primary">{teacher.name}</p>
                                                    <p className="text-xs text-gray-500">{teacher.email}</p>
                                                    {teacher.phone && <p className="text-xs text-gray-500">{teacher.phone}</p>}
                                                </div>
                                            </div>
                                            {teacher.status && <span className="text-xs font-semibold bg-brand-accent text-brand-primary px-2 py-1 rounded-full">{teacher.status}</span>}
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500">Mata Pelajaran:</p>
                                            <p className="text-sm italic">{teacher.subjects.join(', ')}</p>
                                        </div>
                                        <div className="flex justify-end space-x-2 border-t pt-3">
                                            <button onClick={() => handleEditTeacherClick(teacher)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full" aria-label="Edit">
                                                <PencilIcon className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => handleDeleteTeacher(teacher.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full" aria-label="Hapus">
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-1 md:col-span-2 text-center text-gray-500 py-8 bg-white rounded-lg shadow-md">
                                    <p>Belum ada data guru.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}


                {activeTab === 'siswa' && (
                    <div className="space-y-4">
                        <button onClick={() => setIsStudentModalOpen(true)} className="w-full bg-brand-secondary text-white py-2 rounded-md font-semibold">
                            + Tambah Siswa
                        </button>
                         <div className="bg-white p-4 rounded-lg shadow-md space-y-3">
                            {students.length > 0 ? students.map(student => (
                                <div key={student.id} className="p-3 border rounded-md">
                                    <p className="font-semibold text-brand-primary">{student.name} <span className="font-normal text-sm text-gray-500">- {student.className}</span></p>
                                    <p className="text-sm text-gray-600">NISN: {student.nisn}</p>
                                </div>
                            )) : (
                                <p className="text-center text-gray-500 py-4">Belum ada data siswa.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {isTeacherModalOpen && <TeacherModal initialData={teacherToEdit} onClose={() => { setIsTeacherModalOpen(false); setTeacherToEdit(null); }} onSave={handleSaveTeacher} />}
            {isStudentModalOpen && <StudentModal students={students} onClose={() => setIsStudentModalOpen(false)} onSave={handleSaveStudent} schoolId={user.schoolId} />}
        </div>
    );
}
