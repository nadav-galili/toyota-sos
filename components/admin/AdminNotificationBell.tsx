'use client';

import { Bell } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { AdminNotificationsList } from './AdminNotificationsList';
import { NotificationsBadge } from '@/components/notifications/Badge';

export function AdminNotificationBell() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full w-10 h-10 bg-white/50 backdrop-blur-sm hover:bg-white/80 shadow-sm border border-slate-100">
          <Bell className="w-5 h-5 text-slate-600" />
          <div className="absolute -top-1 -right-1">
             <NotificationsBadge />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 mr-4" align="end">
        <AdminNotificationsList />
      </PopoverContent>
    </Popover>
  );
}

