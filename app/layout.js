import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: 'HafanStore Dashboard',
  description: 'BrickLink seller dashboard for HafanStore',
};

export default function RootLayout({ children }) {
  return (
    <html lang="cs" className={`h-full ${inter.variable}`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
