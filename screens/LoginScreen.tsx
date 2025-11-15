import React, { useState } from 'react';
import { UserType, School } from '../types';
import { logoBase64Url } from '../assets/logo';
import { initialSchools } from '../data/mockData';

interface LoginScreenProps {
  onLogin: (userType: UserType, name: string, schoolId: string) => void;
}

const AdminLoginForm: React.FC<{ onLogin: () => void; }> = ({ onLogin }) => (
    <div className="space-y-4">
      <input type="email" placeholder="Email Admin" defaultValue="admin@40302789.sekolah.id" className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-secondary" />
      <input type="password" placeholder="Password" defaultValue="admin123" className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-secondary" />
      <button onClick={onLogin} className="w-full bg-brand-primary text-white py-3 rounded-md font-semibold hover:bg-opacity-90 transition-colors">Login Admin</button>
       <p className="text-xs text-center text-gray-500">Gunakan email dan password yang diberikan saat mendaftarkan sekolah.</p>
    </div>
);


const GuruLoginForm: React.FC<{ onLogin: () => void; showRegister: () => void }> = ({ onLogin, showRegister }) => (
    <div className="space-y-4">
      <input type="email" placeholder="Email" className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-secondary" />
      <input type="password" placeholder="Password" className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-secondary" />
      <button onClick={onLogin} className="w-full bg-brand-primary text-white py-3 rounded-md font-semibold hover:bg-opacity-90 transition-colors">Login Guru</button>
      <div className="text-center text-sm">
        <button className="text-brand-secondary hover:underline">Reset Password</button>
        <span className="mx-2">|</span>
        <button onClick={showRegister} className="text-brand-secondary hover:underline">Create Akun</button>
      </div>
    </div>
);

const SiswaLoginForm: React.FC<{ onLogin: () => void; showRegister: () => void }> = ({ onLogin, showRegister }) => (
    <div className="space-y-4">
      <input type="text" placeholder="NISN" className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-secondary" />
      <input type="password" placeholder="Password" className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-secondary" />
      <button onClick={onLogin} className="w-full bg-brand-primary text-white py-3 rounded-md font-semibold hover:bg-opacity-90 transition-colors">Login Siswa</button>
      <div className="text-center text-sm">
        <button className="text-brand-secondary hover:underline">Reset Password</button>
        <span className="mx-2">|</span>
        <button onClick={showRegister} className="text-brand-secondary hover:underline">Create Akun</button>
      </div>
    </div>
);

const GuruRegisterForm: React.FC<{ onRegister: () => void }> = ({ onRegister }) => (
    <div className="space-y-3">
        <input type="text" placeholder="Nama Guru" className="w-full px-4 py-2 rounded-md border border-gray-300"/>
        <input type="text" placeholder="Kelas" className="w-full px-4 py-2 rounded-md border border-gray-300"/>
        <input type="email" placeholder="Email" className="w-full px-4 py-2 rounded-md border border-gray-300"/>
        <input type="password" placeholder="Password" className="w-full px-4 py-2 rounded-md border border-gray-300"/>
        <input type="password" placeholder="Konfirmasi Password" className="w-full px-4 py-2 rounded-md border border-gray-300"/>
        <button onClick={onRegister} className="w-full bg-brand-secondary text-white py-3 rounded-md font-semibold hover:bg-opacity-90">Register</button>
    </div>
);

const SiswaRegisterForm: React.FC<{ onRegister: () => void }> = ({ onRegister }) => (
    <div className="space-y-3">
        <input type="text" placeholder="Nama Siswa" className="w-full px-4 py-2 rounded-md border border-gray-300"/>
        <input type="text" placeholder="Kelas" className="w-full px-4 py-2 rounded-md border border-gray-300"/>
        <input type="text" placeholder="NISN" className="w-full px-4 py-2 rounded-md border border-gray-300"/>
        <input type="password" placeholder="Password" className="w-full px-4 py-2 rounded-md border border-gray-300"/>
        <input type="password" placeholder="Konfirmasi Password" className="w-full px-4 py-2 rounded-md border border-gray-300"/>
        <button onClick={onRegister} className="w-full bg-brand-secondary text-white py-3 rounded-md font-semibold hover:bg-opacity-90">Register</button>
    </div>
);


const SchoolSelector: React.FC<{
    schools: School[];
    onSchoolSelect: (id: string) => void;
    onRegisterSchool: (name: string, npsn: string, headmasterName: string) => void;
}> = ({ schools, onSchoolSelect, onRegisterSchool }) => {
    const [selectedSchool, setSelectedSchool] = useState('');
    const [isRegisteringSchool, setIsRegisteringSchool] = useState(false);
    const [newSchoolName, setNewSchoolName] = useState('');
    const [newNpsn, setNewNpsn] = useState('');
    const [newHeadmasterName, setNewHeadmasterName] = useState('');

    const handleRegister = () => {
        const trimmedName = newSchoolName.trim();
        const trimmedNpsn = newNpsn.trim();
        const trimmedHeadmaster = newHeadmasterName.trim();

        if (!trimmedName || !trimmedNpsn || !trimmedHeadmaster) {
            alert('Nama sekolah, NPSN, dan Nama Kepala Sekolah tidak boleh kosong.');
            return;
        }

        const npsnRegex = /^\d{8}$/;
        if (!npsnRegex.test(trimmedNpsn)) {
            alert('NPSN tidak valid. NPSN harus terdiri dari 8 digit angka.');
            return;
        }

        onRegisterSchool(trimmedName, trimmedNpsn, trimmedHeadmaster);
        setIsRegisteringSchool(false);
        setNewSchoolName('');
        setNewNpsn('');
        setNewHeadmasterName('');
    };

    if (isRegisteringSchool) {
        return (
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-center text-brand-primary">Daftarkan Sekolah Baru</h3>
                <input 
                    type="text" 
                    placeholder="Nama Sekolah" 
                    value={newSchoolName}
                    onChange={(e) => setNewSchoolName(e.target.value)}
                    className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-secondary" 
                />
                 <input 
                    type="text" 
                    placeholder="Nama Kepala Sekolah" 
                    value={newHeadmasterName}
                    onChange={(e) => setNewHeadmasterName(e.target.value)}
                    className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-secondary" 
                />
                <input 
                    type="text" 
                    placeholder="NPSN (8 digit)" 
                    value={newNpsn}
                    onChange={(e) => setNewNpsn(e.target.value)}
                    maxLength={8}
                    className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-secondary" 
                />
                <button onClick={handleRegister} className="w-full bg-brand-secondary text-white py-3 rounded-md font-semibold hover:bg-opacity-90">Daftarkan & Lanjutkan</button>
                <button onClick={() => setIsRegisteringSchool(false)} className="w-full text-sm text-center text-gray-600 hover:underline">Batal</button>
            </div>
        );
    }
    
    return (
        <div className="space-y-4">
             <h3 className="text-lg font-semibold text-center text-brand-primary">Pilih Sekolah Anda</h3>
            <select
                value={selectedSchool}
                onChange={(e) => setSelectedSchool(e.target.value)}
                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-secondary bg-white"
            >
                <option value="">-- Silakan Pilih Sekolah --</option>
                {schools.map(school => (
                    <option key={school.id} value={school.id}>{school.name}</option>
                ))}
            </select>
            <button onClick={() => onSchoolSelect(selectedSchool)} disabled={!selectedSchool} className="w-full bg-brand-primary text-white py-3 rounded-md font-semibold hover:bg-opacity-90 disabled:bg-gray-400">
                Lanjutkan
            </button>
            <p className="text-center text-sm text-gray-600">
                Sekolah Anda tidak ada di daftar? <button onClick={() => setIsRegisteringSchool(true)} className="font-semibold text-brand-secondary hover:underline">Daftarkan disini</button>
            </p>
        </div>
    );
};


export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [activeTab, setActiveTab] = useState<UserType>(UserType.Guru);
  const [isRegistering, setIsRegistering] = useState(false);
  const [schools, setSchools] = useState<School[]>(initialSchools);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  
  const handleLogin = () => {
    // In a real app, you would validate credentials here.
    let name = 'User';
    switch(activeTab) {
        case UserType.Guru: name = 'Budi Guru'; break;
        case UserType.Siswa: name = 'Ani Siswa'; break;
        case UserType.Admin: name = 'Admin Sekolah'; break;
    }
    onLogin(activeTab, name, selectedSchoolId!);
  }
  
  const handleRegister = () => {
     alert('Akun berhasil dibuat! Silakan login.');
     setIsRegistering(false);
  }

  const handleSchoolSelect = (id: string) => {
      setSelectedSchoolId(id);
  }

  const handleRegisterSchool = (name: string, npsn: string, headmasterName: string) => {
      if (schools.some(school => school.npsn === npsn)) {
          alert('NPSN sudah terdaftar. Harap gunakan NPSN yang lain atau pilih sekolah dari daftar.');
          return;
      }
      const newSchool: School = { id: `s${Date.now()}`, name, npsn, headmasterName };
      setSchools(prev => [...prev, newSchool]);
      setSelectedSchoolId(newSchool.id);
      alert(`Sekolah "${name}" berhasil didaftarkan!\n\nAkun Admin Sekolah telah dibuat:\nEmail: admin@${npsn}.sekolah.id\nPassword: admin123\n\nSilakan login menggunakan akun Admin untuk mengelola sekolah.`);

  };
  
  const handleBackToSchoolSelection = () => {
      setSelectedSchoolId(null);
      setIsRegistering(false);
  }

  const getTabClass = (tabType: UserType) => {
      return activeTab === tabType 
          ? 'border-b-2 border-brand-primary text-brand-primary' 
          : 'text-gray-500';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-background p-4">
      <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-2xl p-8 space-y-6">
        <div className="text-center flex flex-col items-center">
          <img src={logoBase64Url} alt="Nusantara EduCulture Logo" className="h-48 w-48 mb-4" />
          {!selectedSchoolId ? (
            <p className="text-gray-600 mt-2">Platform Edukasi Budaya Indonesia</p>
          ) : (
            <p className="text-gray-600 mt-2">{isRegistering ? 'Buat Akun Baru' : 'Selamat Datang Kembali'}</p>
          )}
        </div>
        
        {!selectedSchoolId ? (
            <SchoolSelector schools={schools} onSchoolSelect={handleSchoolSelect} onRegisterSchool={handleRegisterSchool} />
        ) : (
            <>
                <div className="text-center p-2 bg-gray-100 rounded-md">
                    <p className="text-sm text-gray-500">Anda login untuk:</p>
                    <p className="font-semibold text-brand-primary">{schools.find(s => s.id === selectedSchoolId)?.name}</p>
                    <button onClick={handleBackToSchoolSelection} className="text-xs text-brand-secondary hover:underline mt-1">Ganti Sekolah</button>
                </div>
                <div className="flex border-b">
                    <button onClick={() => {setActiveTab(UserType.Guru); setIsRegistering(false)}} className={`w-1/3 py-3 font-semibold ${getTabClass(UserType.Guru)}`}>
                        Guru
                    </button>
                    <button onClick={() => {setActiveTab(UserType.Siswa); setIsRegistering(false)}} className={`w-1/3 py-3 font-semibold ${getTabClass(UserType.Siswa)}`}>
                        Siswa
                    </button>
                    <button onClick={() => {setActiveTab(UserType.Admin); setIsRegistering(false)}} className={`w-1/3 py-3 font-semibold ${getTabClass(UserType.Admin)}`}>
                        Admin
                    </button>
                </div>

                {activeTab === UserType.Admin ? (
                    <AdminLoginForm onLogin={handleLogin} />
                ) : isRegistering ? (
                    <>
                        {activeTab === UserType.Guru ? <GuruRegisterForm onRegister={handleRegister} /> : <SiswaRegisterForm onRegister={handleRegister} />}
                        <p className="text-center text-sm">Sudah punya akun? <button onClick={() => setIsRegistering(false)} className="font-semibold text-brand-secondary hover:underline">Login disini</button></p>
                    </>
                ) : (
                    <>
                        {activeTab === UserType.Guru ? <GuruLoginForm onLogin={handleLogin} showRegister={() => setIsRegistering(true)} /> : <SiswaLoginForm onLogin={handleLogin} showRegister={() => setIsRegistering(true)} />}
                    </>
                )}
            </>
        )}

      </div>
    </div>
  );
}