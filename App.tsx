
import React, { useState, useMemo, useEffect } from 'react';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import ChatScreen from './screens/ChatScreen';
import AttendanceScreen from './screens/AttendanceScreen';
import ProfileScreen from './screens/ProfileScreen';
import CurriculumScreen from './screens/CurriculumScreen';
import BottomNav from './components/BottomNav';
import { UserType, Screen, Student, Teacher, TeacherJournalEntry, Notification, LearningMaterial, Assessment, StudentScore } from './types';
import TanaTorajaScreen from './screens/TanaTorajaScreen';
// FIX: Correctly import all necessary mock data from mockData.ts
import { initialStudents, initialTeachers, initialTeacherJournals, initialMaterials, mockAssessments, mockScores } from './data/mockData';
import LuwuScreen from './screens/LuwuScreen';
import LuwuUtaraScreen from './screens/LuwuUtaraScreen';
// FIX: Correctly import the default export from PalopoScreen.
import PalopoScreen from './screens/PalopoScreen';

export default function App() {
  const [user, setUser] = useState<{ type: UserType; name: string; schoolId: string } | null>(null);
  const [activeScreen, setActiveScreen] = useState<Screen>(Screen.Home);
  const [currentCourse, setCurrentCourse] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Centralized state
  const [allStudents, setAllStudents] = useState<Student[]>(initialStudents);
  const [allTeachers, setAllTeachers] = useState<Teacher[]>(initialTeachers);
  const [allTeacherJournals, setAllTeacherJournals] = useState<TeacherJournalEntry[]>(initialTeacherJournals);
  const [allMaterials, setAllMaterials] = useState<LearningMaterial[]>(initialMaterials);
  const [allAssessments, setAllAssessments] = useState<Assessment[]>(mockAssessments);
  const [allStudentScores, setAllStudentScores] = useState<StudentScore[]>(mockScores);


  const schoolStudents = useMemo(() => allStudents.filter(s => s.schoolId === user?.schoolId), [allStudents, user?.schoolId]);
  const schoolTeachers = useMemo(() => allTeachers.filter(t => t.schoolId === user?.schoolId), [allTeachers, user?.schoolId]);
  const schoolTeacherJournals = useMemo(() => allTeacherJournals.filter(j => j.schoolId === user?.schoolId), [allTeacherJournals, user?.schoolId]);

  useEffect(() => {
    const loadAndProcessNotifications = () => {
        if (!user || user.type !== UserType.Siswa) {
            setNotifications([]);
            return;
        }

        const globalEvents = JSON.parse(localStorage.getItem('globalAppEvents') || '[]');
        const savedNotifications: Notification[] = JSON.parse(localStorage.getItem(`userNotifications_${user.name}`) || '[]').map((n: any) => ({ ...n, timestamp: new Date(n.timestamp) }));

        const existingNotifIds = new Set(savedNotifications.map((n) => n.id));

        const newNotifications: Notification[] = globalEvents
            .filter((event: any) => event.type === 'NEW_MATERIAL_TANA_TORAJA')
            .map((event: any): Notification => ({
                id: `notif-${new Date(event.timestamp).getTime()}`,
                message: `Materi baru: "${event.payload.title}"`,
                timestamp: new Date(event.timestamp),
                isRead: false,
                relatedCourse: 'Tana Toraja',
            }))
            .filter((n: Notification) => !existingNotifIds.has(n.id));
        
        const allNotifications = [...newNotifications, ...savedNotifications];
        allNotifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        
        setNotifications(allNotifications.slice(0, 50));
    };

    loadAndProcessNotifications();
  }, [user]);

  useEffect(() => {
      if (user && user.type === UserType.Siswa) {
          localStorage.setItem(`userNotifications_${user.name}`, JSON.stringify(notifications));
      }
  }, [notifications, user]);


  const handleLogin = (userType: UserType, name: string, schoolId: string) => {
    setUser({ type: userType, name, schoolId });
    setActiveScreen(Screen.Home);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentCourse(null);
  };

  const handleCourseSelect = (courseName: string) => {
    setCurrentCourse(courseName);
  };

  const handleBackFromCourse = () => {
    setCurrentCourse(null);
  };

  const handleToggleFavorite = (materialId: string) => {
    setAllMaterials(prevMaterials =>
        prevMaterials.map(material =>
            material.id === materialId
                ? { ...material, isFavorite: !material.isFavorite }
                : material
        )
    );
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case Screen.Home:
        return <HomeScreen user={user!} onCourseSelect={handleCourseSelect} notifications={notifications} setNotifications={setNotifications} />;
      case Screen.Curriculum:
        return <CurriculumScreen 
                  user={user!} 
                  students={schoolStudents}
                  teachers={schoolTeachers}
                  setAllStudents={setAllStudents}
                  setAllTeachers={setAllTeachers}
                  notifications={notifications}
                  setNotifications={setNotifications}
                />;
      case Screen.Chat:
        return <ChatScreen />;
      case Screen.Attendance:
        return <AttendanceScreen 
                  user={user!} 
                  students={schoolStudents}
                  setAllStudents={setAllStudents} 
                  teacherJournals={schoolTeacherJournals}
                  setAllTeacherJournals={setAllTeacherJournals}
                  notifications={notifications}
                  setNotifications={setNotifications}
                />;
      case Screen.Profile:
        return <ProfileScreen user={user!} onLogout={handleLogout} notifications={notifications} setNotifications={setNotifications} />;
      default:
        return <HomeScreen user={user!} onCourseSelect={handleCourseSelect} notifications={notifications} setNotifications={setNotifications} />;
    }
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const renderCourseScreen = () => {
    const commonProps = {
      user: user!,
      onBack: handleBackFromCourse,
      materials: allMaterials,
      setAllMaterials,
      assessments: allAssessments,
      setAllAssessments,
      studentScores: allStudentScores,
      setAllStudentScores,
      onToggleFavorite: handleToggleFavorite,
    };

    switch (currentCourse) {
      case 'Tana Toraja':
        return <TanaTorajaScreen {...commonProps} />;
      case 'Luwu':
        return <LuwuScreen {...commonProps} />;
      case 'Luwu Utara':
        return <LuwuUtaraScreen {...commonProps} />;
      case 'Palopo':
        return <PalopoScreen {...commonProps} />;
      default:
        return renderScreen();
    }
  };

  return (
    <div className="min-h-screen bg-brand-background font-sans text-brand-text flex flex-col">
      <main className="flex-grow pb-16">
        {renderCourseScreen()}
      </main>
      {/* Hide bottom nav when viewing a course */}
      {!currentCourse && (
        <BottomNav activeScreen={activeScreen} setActiveScreen={setActiveScreen} userType={user.type} />
      )}
    </div>
  );
}