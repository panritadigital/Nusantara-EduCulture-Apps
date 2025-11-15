import React from 'react';
import DashboardChart from '../components/DashboardChart';
import { UserType, Notification } from '../types';
import { Header } from '../components/Header';

interface HomeScreenProps {
  user: { type: UserType; name: string; };
  onCourseSelect: (courseName: string) => void;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

// Mock data
const studentProgressData = [
  { name: 'Kelas 7A', value: 85 },
  { name: 'Kelas 7B', value: 78 },
  { name: 'Kelas 8A', value: 92 },
  { name: 'Kelas 8B', value: 81 },
];

const assessmentData = [
  { name: 'Sangat Baik', value: 400 },
  { name: 'Baik', value: 300 },
  { name: 'Cukup', value: 300 },
  { name: 'Kurang', value: 200 },
];

const studentAttendanceData = [
  { name: 'Kelas 7', value: 95, value2: 5 },
  { name: 'Kelas 8', value: 92, value2: 8 },
  { name: 'Kelas 9', value: 97, value2: 3 },
];

const teacherAttendanceData = [
    { name: 'Hadir', value: 98 },
    { name: 'Izin/Sakit', value: 2 }
];


const LearningCourseCard: React.FC<{ title: string; imgSrc: string; onClick?: () => void; isClickable?: boolean }> = ({ title, imgSrc, onClick, isClickable }) => (
    <div 
      className={`bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 ${isClickable ? 'transform hover:scale-105 cursor-pointer' : ''}`}
      onClick={onClick}
    >
        <img src={imgSrc} alt={title} className="w-full h-24 object-cover"/>
        <div className="p-3">
            <h4 className="font-semibold text-brand-primary text-center">{title}</h4>
        </div>
    </div>
);

export default function HomeScreen({ user, onCourseSelect, notifications, setNotifications }: HomeScreenProps) {
  return (
    <div className="space-y-6">
      <Header subtitle="Dashboard" user={user} notifications={notifications} setNotifications={setNotifications} />
      
      <div className="px-4 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {(user.type === UserType.Guru || user.type === UserType.Admin) && (
              <>
                  <DashboardChart title="Perkembangan Belajar Siswa" type="bar" data={studentProgressData} />
                  <DashboardChart title="Hasil Assesment Belajar" type="pie" data={assessmentData} />
                  <DashboardChart title="Kehadiran Siswa per Semester (%)" type="bar" data={studentAttendanceData} />
                  <DashboardChart title="Kehadiran Guru per Semester (%)" type="pie" data={teacherAttendanceData} />
              </>
          )}
          {user.type === UserType.Siswa && (
              <>
                   <DashboardChart title="Perkembangan Belajarku" type="bar" data={[{name: 'Agustus', value: 88}]} />
                   <DashboardChart title="Kehadiranku Semester Ini" type="pie" data={[{name: 'Hadir', value: 98}, {name: 'Alpha', value: 2}]} />
              </>
          )}
        </div>

        <section>
          <h2 className="text-xl font-bold text-brand-primary mb-4">Belajar Budaya</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <LearningCourseCard 
                title="Budaya Toraja" 
                imgSrc="https://images.unsplash.com/photo-1588623228495-6531505535b4?q=80&w=1470&auto=format&fit=crop" 
                isClickable={true}
                onClick={() => onCourseSelect('Tana Toraja')}
              />
              <LearningCourseCard 
                title="Budaya Luwu" 
                imgSrc="https://kebudayaan.kemdikbud.go.id/bpnbjabar/wp-content/uploads/sites/13/2016/06/Tari-Pajaga-Luwu-e1466044732155.jpg" 
                isClickable={true}
                onClick={() => onCourseSelect('Luwu')}
              />
              <LearningCourseCard 
                title="Budaya Luwu Utara" 
                imgSrc="https://disbudpar.luwuutarakab.go.id/wp-content/uploads/2021/11/Tenun-Rongkong.jpg" 
                isClickable={true}
                onClick={() => onCourseSelect('Luwu Utara')}
              />
              <LearningCourseCard 
                title="Budaya Palopo" 
                imgSrc="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Masjid_Jami_Tua_Palopo_2.jpg/1280px-Masjid_Jami_Tua_Palopo_2.jpg" 
                isClickable={true}
                onClick={() => onCourseSelect('Palopo')}
              />
          </div>
        </section>
      </div>
    </div>
  );
}