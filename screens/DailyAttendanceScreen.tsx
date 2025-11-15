import React, { useMemo, useState } from 'react';
import { Student, AttendanceStatus } from '../types';

interface DailyAttendanceScreenProps {
    className: string;
    subject: string;
    students: Student[];
    onSaveAttendance: (records: { studentId: string, status: AttendanceStatus }[]) => void;
    onBack: () => void;
}

const AttendanceButton: React.FC<{
  label: AttendanceStatus;
  onClick: () => void;
  isActive: boolean;
}> = ({ label, onClick, isActive }) => {
  let bgColor = 'bg-gray-200 text-gray-700';
  if (isActive) {
    switch (label) {
      case AttendanceStatus.Hadir: bgColor = 'bg-green-500 text-white'; break;
      case AttendanceStatus.Izin: bgColor = 'bg-blue-500 text-white'; break;
      case AttendanceStatus.Sakit: bgColor = 'bg-yellow-500 text-white'; break;
      case AttendanceStatus.Alpha: bgColor = 'bg-red-500 text-white'; break;
    }
  }
  return (
    <button onClick={onClick} className={`px-2 py-1 text-xs font-medium rounded-full transition-colors ${bgColor}`}>
      {label}
    </button>
  );
};

const StudentAttendanceCard: React.FC<{
  student: Student;
  onStatusChange: (studentId: string, status: AttendanceStatus) => void;
}> = ({ student, onStatusChange }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
      <div>
        <p className="font-semibold text-brand-primary">{student.name}</p>
        <p className="text-sm text-gray-500">NISN: {student.nisn}</p>
      </div>
      <div className="flex space-x-1">
        {(Object.values(AttendanceStatus)).map(status => (
          <AttendanceButton
            key={status}
            label={status}
            isActive={student.status === status}
            onClick={() => onStatusChange(student.id, status)}
          />
        ))}
      </div>
    </div>
  );
};

export default function DailyAttendanceScreen({ className, subject, students, onSaveAttendance, onBack }: DailyAttendanceScreenProps) {
    
    const [sessionAttendance, setSessionAttendance] = useState<Map<string, AttendanceStatus>>(() => {
        const map = new Map<string, AttendanceStatus>();
        students.forEach(s => map.set(s.id, AttendanceStatus.Alpha)); // Default to Alpha
        return map;
    });

    const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
        setSessionAttendance(prev => new Map(prev).set(studentId, status));
    };

    const handleSave = () => {
        const records = Array.from(sessionAttendance.entries()).map(([studentId, status]) => ({
            studentId,
            status,
        }));
        
        records.forEach(record => {
            if (record.status === AttendanceStatus.Hadir) {
                const student = students.find(s => s.id === record.studentId);
                if (student) {
                    console.log(`Pesan terkirim ke WA Orang Tua: "Kepada Yth; Bapak/Ibu orangtua, siswa atas nama ${student.name} telah hadir di kelas mata pelajaran ${subject} dan siap belajar."`);
                }
            }
        });

        onSaveAttendance(records);
        alert(`Absensi untuk ${className} (${subject}) telah disimpan.`);
        onBack();
    };
    
    const markAllPresent = () => {
        setSessionAttendance(prev => {
            const newMap = new Map(prev);
            students.forEach(s => newMap.set(s.id, AttendanceStatus.Hadir));
            return newMap;
        });
    }

    return (
        <div className="fixed inset-0 bg-brand-background z-[100] flex flex-col">
            <header className="flex-shrink-0 bg-white shadow-sm z-10 p-4 border-b">
                <div className="flex items-center justify-between">
                     <button onClick={onBack} className="p-2 -ml-2 text-brand-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                     </button>
                     <div className="text-center">
                        <h1 className="text-lg font-bold text-brand-primary">Absensi {className}</h1>
                        <p className="text-sm text-gray-500">{subject} - {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}</p>
                     </div>
                     <div className="w-6"></div> {/* Spacer */}
                </div>
            </header>

            <main className="flex-grow p-4 space-y-4 overflow-y-auto">
                <button 
                    onClick={markAllPresent}
                    className="w-full bg-blue-500 text-white py-2 rounded-md font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Tandai Semua Hadir</span>
                </button>
                
                <div className="space-y-3">
                    {students.length > 0 ? (
                        students.map(student => (
                            <StudentAttendanceCard 
                                key={student.id}
                                student={{...student, status: sessionAttendance.get(student.id) || AttendanceStatus.Alpha}}
                                onStatusChange={handleStatusChange}
                            />
                        ))
                    ) : (
                        <div className="text-center py-10 text-gray-500 bg-white rounded-lg shadow">
                            <p>Tidak ada siswa yang terdaftar pada mata pelajaran ini di kelas ini.</p>
                        </div>
                    )}
                </div>
            </main>

            <footer className="flex-shrink-0 p-4 bg-white border-t">
                 <button
                    onClick={handleSave}
                    className="w-full bg-brand-primary text-white py-3 rounded-md font-semibold hover:bg-opacity-90 transition-colors"
                >
                    Simpan Absensi
                </button>
            </footer>
        </div>
    );
}