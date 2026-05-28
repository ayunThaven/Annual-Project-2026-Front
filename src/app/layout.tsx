import Sidebar from '@/components/Sidebar';
import './globals.css'; 

export const metadata = {
  title: 'SEO Genius',
  description: 'Gérez vos contenus SEO boostés à l\'IA',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <div className="flex h-screen bg-gray-50 overflow-hidden">
          <Sidebar />

          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}