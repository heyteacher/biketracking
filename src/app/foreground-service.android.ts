const trace = require("trace");
declare var android: any


@JavaProxy('org.nativescript.geolocation.ForegroundService')
class ForegroundService extends android.app.Service {
    onStartCommand(intent, flags, startId) {
        trace.write('ForegroundService.onStartCommand', trace.categories.Debug)
        super.onStartCommand(intent, flags, startId);
        return android.app.Service.START_STICKY;
    }

    onCreate() {
        trace.write('ForegroundService.onCreate', trace.categories.Debug)
        super.onCreate();
        this.startForeground(1, this.getNotification());
    }

    onBind(intent) {
        return super.onBind(intent);
    }

    onUnbind(intent) {
        return super.onUnbind(intent);
    }

    onDestroy() {
        trace.write('ForegroundService.onDestroy', trace.categories.Debug)
        this.stopForeground(true);
    }

    private getNotification() {
        const channel = new android.app.NotificationChannel(
            'channel_01',
            'ForegroundService Channel',
            android.app.NotificationManager.IMPORTANCE_DEFAULT
        );
        const notificationManager = this.getSystemService(android.content.Context.NOTIFICATION_SERVICE);
        notificationManager.createNotificationChannel(channel);
        const builder = new android.app.Notification.Builder(this.getApplicationContext(), 'channel_01');

        return builder.build();
    }
}