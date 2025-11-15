import React from 'react';
import { HomeIcon, ChatBubbleLeftRightIcon, ClipboardDocumentListIcon, UserCircleIcon, BookOpenIcon } from './icons/SolidIcons';
import { Screen, UserType } from '../types';

interface BottomNavProps {
  activeScreen: Screen;
  setActiveScreen: (screen: Screen) => void;
  userType: UserType;
}

const NavItem: React.FC<{
  screen: Screen;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ screen, label, icon, isActive, onClick }) => {
  const activeClass = 'text-brand-primary';
  const inactiveClass = 'text-gray-400 hover:text-brand-secondary';

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${isActive ? activeClass : inactiveClass}`}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
};

export default function BottomNav({ activeScreen, setActiveScreen, userType }: BottomNavProps) {
  const baseNavItems = [
    { screen: Screen.Home, label: 'Home', icon: <HomeIcon className="h-6 w-6" /> },
    { screen: Screen.Chat, label: 'Chat AI', icon: <ChatBubbleLeftRightIcon className="h-6 w-6" /> },
    { screen: Screen.Attendance, label: 'Daftar Hadir', icon: <ClipboardDocumentListIcon className="h-6 w-6" /> },
    { screen: Screen.Profile, label: 'Profil', icon: <UserCircleIcon className="h-6 w-6" /> },
  ];
  
  const curriculumNavItem = { screen: Screen.Curriculum, label: 'Kurikulum', icon: <BookOpenIcon className="h-6 w-6" /> };

  const navItems = (userType === UserType.Admin || userType === UserType.Guru)
    ? [baseNavItems[0], curriculumNavItem, ...baseNavItems.slice(1)] 
    : baseNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 shadow-lg flex justify-around z-50">
      {navItems.map((item) => (
        <NavItem
          key={item.screen}
          screen={item.screen}
          label={item.label}
          icon={item.icon}
          isActive={activeScreen === item.screen}
          onClick={() => setActiveScreen(item.screen)}
        />
      ))}
    </nav>
  );
}