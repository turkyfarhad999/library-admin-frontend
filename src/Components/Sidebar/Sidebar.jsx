'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpenText,
  BookCopy,
  Users,
  ArrowLeftRight,
  Receipt,
  LogOut,
} from 'lucide-react';
import Navbar from '../Navbar/Navbar';
import { authClient } from '@/lib/auth-client';

const menu = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Books', href: '/books', icon: BookOpenText },
  { name: 'Copies', href: '/copies', icon: BookCopy },
  { name: 'Members', href: '/members', icon: Users },
  { name: 'Loans', href: '/loans', icon: ArrowLeftRight },

];

const Sidebar = ({ children }) => {
  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await authClient.signOut();

    if (error) {
      console.error('Logout failed:', error.message);
      return;
    }

    router.replace('/login');
    router.refresh();
  };

  return (
    <div className="drawer lg:drawer-open">
      <input
        id="my-drawer-4"
        type="checkbox"
        className="drawer-toggle"
      />

      <div className="drawer-content">
        <Navbar />

        <main className="p-4">{children}</main>
      </div>

      <div className="drawer-side is-drawer-close:overflow-visible">
        <label
          htmlFor="my-drawer-4"
          aria-label="close sidebar"
          className="drawer-overlay"
        />

        <div className="flex min-h-full flex-col items-start bg-base-200 is-drawer-close:w-14 is-drawer-open:w-64">
          <ul className="menu w-full grow">
            {menu.map(({ name, href, icon: Icon }) => (
              <li key={name}>
                <Link
                  href={href}
                  className="is-drawer-close:tooltip is-drawer-close:tooltip-right"
                  data-tip={name}
                >
                  <Icon className="my-1.5 inline-block size-4" />
                  <span className="is-drawer-close:hidden">
                    {name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="w-full p-2">
            <button
              type="button"
              onClick={handleLogout}
              className="btn btn-ghost w-full justify-start"
            >
              <LogOut className="size-4" />
              <span className="is-drawer-close:hidden">
                Logout
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;