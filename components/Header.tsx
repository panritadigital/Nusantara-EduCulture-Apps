import React from 'react';
import { logoBase64Url } from '../assets/logo';
import { UserType, Notification } from '../types';
import NotificationBell from './NotificationBell';

interface HeaderProps {
  subtitle: string;
  user: { type: UserType; name: string };
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  children?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ subtitle, user, notifications, setNotifications, children }) => {
  return (
    <header className="px-4 pt-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <img src={logoBase64Url} alt="Nusantara EduCulture Logo" className="h-20 w-20 object-contain" />
          <div>
            <h1 className="text-xl font-bold text-brand-primary">Nusantara EduCulture</h1>
            <p className="text-gray-600 text-sm mt-1">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
            {user.type === UserType.Siswa && (
                <NotificationBell notifications={notifications} setNotifications={setNotifications} />
            )}
            {children && <div className="flex-shrink-0">{children}</div>}
        </div>
      </div>
      <div className="mt-4">
        <div className="h-0.5 bg-gradient-to-r from-brand-secondary via-brand-accent to-brand-background"></div>
      </div>
    </header>
  );
};
