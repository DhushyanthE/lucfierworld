import React from 'react';
import { Bell, Check, CheckCheck, Trash2, X, AlertTriangle, Info, AlertCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return <Check className="h-4 w-4 text-green-500" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case 'error':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    case 'price_alert':
      return <TrendingUp className="h-4 w-4 text-purple-500" />;
    default:
      return <Info className="h-4 w-4 text-blue-500" />;
  }
};

const getNotificationColor = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return 'bg-green-500/10 border-green-500/30';
    case 'warning':
      return 'bg-yellow-500/10 border-yellow-500/30';
    case 'error':
      return 'bg-red-500/10 border-red-500/30';
    case 'price_alert':
      return 'bg-purple-500/10 border-purple-500/30';
    default:
      return 'bg-blue-500/10 border-blue-500/30';
  }
};

export function NotificationsCenter() {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-gray-900 border-purple-500/30">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="text-white">Notifications</span>
          <div className="flex gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  markAllAsRead();
                }}
                className="h-7 text-xs text-purple-400 hover:text-purple-300"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  clearAll();
                }}
                className="h-7 text-xs text-red-400 hover:text-red-300"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-purple-500/20" />
        
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="p-4 text-center text-gray-400">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 mx-auto text-gray-600 mb-3" />
              <p className="text-gray-400 text-sm">No notifications yet</p>
              <p className="text-gray-500 text-xs mt-1">
                Price alerts and updates will appear here
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`p-3 cursor-pointer border-l-2 ${getNotificationColor(notification.type)} ${
                  !notification.is_read ? 'bg-purple-500/5' : ''
                }`}
                onClick={() => !notification.is_read && markAsRead(notification.id)}
              >
                <div className="flex gap-3 w-full">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-medium truncate ${
                        notification.is_read ? 'text-gray-300' : 'text-white'
                      }`}>
                        {notification.title}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 flex-shrink-0 text-gray-500 hover:text-red-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className={`text-xs mt-1 line-clamp-2 ${
                      notification.is_read ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <div className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0 mt-1" />
                  )}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
