import React, { useState } from 'react';
import { UserType, Notification } from '../types';
import { Header } from '../components/Header';

interface ProfileScreenProps {
  user: { type: UserType; name: string };
  onLogout: () => void;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

export default function ProfileScreen({ user, onLogout, notifications, setNotifications }: ProfileScreenProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  // Mock data, in a real app this would come from state/API
  const [profileData, setProfileData] = useState({
      name: user.name,
      email: user.type === UserType.Guru ? 'budi.guru@sekolah.id' : (user.type === UserType.Admin ? 'admin@40302789.sekolah.id' : ''),
      kelas: user.type === UserType.Siswa ? 'Kelas 8A' : (user.type === UserType.Guru ? 'Wali Kelas 8A' : ''),
      nisn: user.type === UserType.Siswa ? '0081234567' : '',
      schoolName: 'SMA Negeri 1 Toraja Utara', // Mock data
      npsn: '40302789', // Mock data
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setProfileData(prev => ({...prev, [name]: value}));
  }
  
  const handleSave = () => {
      // API call to save data would go here
      alert("Profil berhasil diperbarui!");
      setIsEditing(false);
  }

  const renderProfileFields = () => {
    switch (user.type) {
      case UserType.Admin:
        return (
          <>
            <div className="mb-4">
              <label className="text-sm text-gray-500">Nama Admin</label>
              {isEditing ? <input name="name" value={profileData.name} onChange={handleInputChange} className="w-full p-2 border rounded-md"/> : <p className="text-lg">{profileData.name}</p>}
            </div>
            <div className="mb-4">
              <label className="text-sm text-gray-500">Email Admin</label>
              {isEditing ? <input name="email" value={profileData.email} onChange={handleInputChange} className="w-full p-2 border rounded-md"/> : <p className="text-lg">{profileData.email}</p>}
            </div>
             <div className="mb-4">
              <label className="text-sm text-gray-500">Nama Sekolah</label>
              <p className="text-lg text-gray-700">{profileData.schoolName}</p>
            </div>
             <div className="mb-4">
              <label className="text-sm text-gray-500">NPSN</label>
              <p className="text-lg text-gray-700">{profileData.npsn}</p>
            </div>
          </>
        );
      case UserType.Guru:
        return (
          <>
            <div className="mb-4">
              <label className="text-sm text-gray-500">Nama Guru</label>
              {isEditing ? <input name="name" value={profileData.name} onChange={handleInputChange} className="w-full p-2 border rounded-md"/> : <p className="text-lg">{profileData.name}</p>}
            </div>
            <div className="mb-4">
              <label className="text-sm text-gray-500">Email</label>
              {isEditing ? <input name="email" value={profileData.email} onChange={handleInputChange} className="w-full p-2 border rounded-md"/> : <p className="text-lg">{profileData.email}</p>}
            </div>
            <div className="mb-4">
              <label className="text-sm text-gray-500">Status</label>
              {isEditing ? <input name="kelas" value={profileData.kelas} onChange={handleInputChange} className="w-full p-2 border rounded-md"/> : <p className="text-lg">{profileData.kelas}</p>}
            </div>
          </>
        );
      case UserType.Siswa:
        return (
          <>
            <div className="mb-4">
              <label className="text-sm text-gray-500">Nama Siswa</label>
              {isEditing ? <input name="name" value={profileData.name} onChange={handleInputChange} className="w-full p-2 border rounded-md"/> : <p className="text-lg">{profileData.name}</p>}
            </div>
            <div className="mb-4">
              <label className="text-sm text-gray-500">NISN</label>
              {isEditing ? <input name="nisn" value={profileData.nisn} onChange={handleInputChange} className="w-full p-2 border rounded-md"/> : <p className="text-lg">{profileData.nisn}</p>}
            </div>
            <div className="mb-4">
              <label className="text-sm text-gray-500">Kelas</label>
              {isEditing ? <input name="kelas" value={profileData.kelas} onChange={handleInputChange} className="w-full p-2 border rounded-md"/> : <p className="text-lg">{profileData.kelas}</p>}
            </div>
          </>
        );
    }
  };


  return (
    <div className="space-y-6">
      <Header subtitle="Profil Saya" user={user} notifications={notifications} setNotifications={setNotifications}>
        {isEditing ? (
             <button onClick={() => setIsEditing(false)} className="text-sm text-gray-600 font-semibold">Batal</button>
        ) : (
            <button onClick={() => setIsEditing(true)} className="text-sm text-brand-secondary font-semibold">Edit Profil</button>
        )}
      </Header>

      <div className="px-4 space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex flex-col items-center mb-6">
              <img src={`https://i.pravatar.cc/150?u=${user.name}`} alt="Profile" className="w-24 h-24 rounded-full mb-4 ring-4 ring-brand-accent"/>
              <h2 className="text-xl font-bold">{profileData.name}</h2>
              <p className="text-gray-500 capitalize">{user.type === 'admin' ? 'Admin Sekolah' : user.type}</p>
          </div>
          
          {renderProfileFields()}
          
          {isEditing && (
               <button onClick={handleSave} className="w-full bg-brand-primary text-white py-2 rounded-md font-semibold mt-4">Simpan Perubahan</button>
          )}

        </div>

        <button
          onClick={onLogout}
          className="w-full bg-red-500 text-white py-3 rounded-md font-semibold hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
