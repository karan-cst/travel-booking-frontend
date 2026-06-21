import '@/app/globals.css';
import ReduxProvider from '@/components/providers/ReduxProvider';

export const metadata = {
  title: 'RoamSync | Travel Booking Engine',
  description: 'High-speed, concurrency-safe travel bookings and AI itinerary planner.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen text-gray-900 bg-gray-50/50">
        <ReduxProvider>
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
