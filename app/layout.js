import './globals.css';

export const metadata = {
  title: 'HafanStore Dashboard',
  description: 'BrickLink seller dashboard for HafanStore',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
