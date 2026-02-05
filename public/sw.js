 // Push Notification Service Worker
 
 self.addEventListener('push', function(event) {
   if (!event.data) return;
   
   const data = event.data.json();
   const options = {
     body: data.body || 'You have a new notification',
     icon: data.icon || '/favicon.ico',
     badge: data.badge || '/favicon.ico',
     vibrate: [100, 50, 100],
     data: {
       url: data.url || '/',
       dateOfArrival: Date.now(),
     },
     actions: data.actions || [],
     tag: data.tag || 'default',
     renotify: data.renotify || false,
   };
   
   event.waitUntil(
     self.registration.showNotification(data.title || 'Notification', options)
   );
 });
 
 self.addEventListener('notificationclick', function(event) {
   event.notification.close();
   
   const urlToOpen = event.notification.data?.url || '/';
   
   event.waitUntil(
     clients.matchAll({ type: 'window', includeUncontrolled: true })
       .then(function(clientList) {
         for (const client of clientList) {
           if (client.url === urlToOpen && 'focus' in client) {
             return client.focus();
           }
         }
         if (clients.openWindow) {
           return clients.openWindow(urlToOpen);
         }
       })
   );
 });
 
 self.addEventListener('pushsubscriptionchange', function(event) {
   event.waitUntil(
     self.registration.pushManager.subscribe({
       userVisibleOnly: true,
       applicationServerKey: self.VAPID_PUBLIC_KEY
     }).then(function(subscription) {
       // Re-subscribe and update backend
       console.log('Push subscription renewed');
     })
   );
 });