import React, { useState, useEffect, useRef } from 'react';
import { Notification } from '../types';
import { BellIcon } from './icons/OutlineIcons';

interface NotificationBellProps {
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " tahun lalu";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " bulan lalu";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " hari lalu";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " jam lalu";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " menit lalu";
  return "Baru saja";
}

export default function NotificationBell({ notifications, setNotifications }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleBellClick = () => {
    setIsOpen(prev => !prev);
    if (!isOpen) {
      // Mark all as read when opening
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    }
  };
  
  const handleClearAll = () => {
    setNotifications([]);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={handleBellClick} className="relative p-2 text-gray-600 hover:text-brand-primary rounded-full hover:bg-gray-100 transition-colors">
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-lg shadow-xl border z-50">
          <div className="p-3 flex justify-between items-center border-b">
            <h3 className="font-semibold text-brand-primary">Notifikasi</h3>
            {notifications.length > 0 && (
              <button onClick={handleClearAll} className="text-xs text-red-500 hover:underline">
                Bersihkan Semua
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map(notif => (
                <div key={notif.id} className="p-3 border-b hover:bg-gray-50">
                  <p className="text-sm text-gray-800">{notif.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{timeAgo(notif.timestamp)}</p>
                </div>
              ))
            ) : (
              <p className="p-6 text-center text-sm text-gray-500">Tidak ada notifikasi baru.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
