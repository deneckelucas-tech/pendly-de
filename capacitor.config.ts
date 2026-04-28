import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.dd7c08af3db746ed85956570d08c946a',
  appName: 'Pendly',
  webDir: 'dist',
  ios: {
    backgroundColor: '#f7f4f0',
  },
  server: {
    url: 'https://dd7c08af-3db7-46ed-8595-6570d08c946a.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
