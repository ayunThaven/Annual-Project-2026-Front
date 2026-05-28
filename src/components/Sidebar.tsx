'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  icon: string;
  label: string;
  href: string;
  hasBadge?: boolean;
}

const navigationItems: NavItem[] = [
  { icon: '/icons/tableau-de-bord.png', label: 'Tableau de bord', href: '/dashboard' },
  { icon: '/icons/redaction.png', label: 'Rédaction', href: '/redaction' },
  { icon: '/icons/curration.png', label: 'Curation', href: '/curation' },
  { icon: '/icons/contenus.png', label: 'Mes contenus', href: '/contenus' },
  { icon: '/icons/idees.png', label: 'Idées IA', href: '/idees', hasBadge: true },
  { icon: '/icons/equipe.png', label: 'Équipe', href: '/equipe' },
  { icon: '/icons/integrations.png', label: 'Intégrations', href: '/integrations' },
];

export default function Sidebar() {
  const pathname = usePathname(); 

  const isSelected = (href: string) => pathname === href;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col flex-shrink-0">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            S
          </div>
          <h1 className="font-bold text-gray-700 text-lg">SEO Genius</h1>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigationItems.map((item, index) => {
          const active = isSelected(item.href);
          return (
            <Link
              key={index}
              href={item.href}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                active
                  ? 'bg-gray-100 text-gray-900 font-bold'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-medium'
              }`}
            >
              <Image
                src={item.icon}
                alt={item.label}
                width={20}
                height={20}
                className={`w-5 h-5 ${active ? 'opacity-100' : 'opacity-75'}`}
              />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 space-y-1">
        <Link
          href="/profil"
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
            isSelected('/profil') ? 'bg-gray-100 text-gray-900 font-bold' : 'text-gray-600 hover:bg-gray-100 font-medium'
          }`}
        >
          <Image src="/icons/utilisateur.png" alt="" width={20} height={20} className="w-5 h-5 opacity-75" />
          <span className="text-sm">Utilisateur</span>
        </Link>

        <Link
          href="/parametres"
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
            isSelected('/parametres') ? 'bg-gray-100 text-gray-900 font-bold' : 'text-gray-600 hover:bg-gray-100 font-medium'
          }`}
        >
          <Image src="/icons/parametres.png" alt="" width={20} height={20} className="w-5 h-5 opacity-75" />
          <span className="text-sm">Paramètres</span>
        </Link>
      </div>
    </aside>
  );
}