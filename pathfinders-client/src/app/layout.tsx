import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'sonner';

export const metadata = {
  title: 'Pathfinders',
  description: 'Discover your motivational gifts',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
        <Toaster position="top-right" />
      </body>
    </html>
  );
} 