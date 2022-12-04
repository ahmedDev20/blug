import Link from 'next/link';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { useUser, useSessionContext } from '@supabase/auth-helpers-react';
import { useTheme } from 'next-themes';
import { MdOutlineLightMode, MdOutlineNightlight } from 'react-icons/md';
import React, { useEffect, useRef, useState } from 'react';
import { useOnClickOutside } from 'usehooks-ts';
import { Loading } from './Loading';

const DROPDOWN_ITEMS = [
  {
    name: 'Profile',
    href: '/profile',
  },
  {
    name: 'Settings',
    href: '/settings',
  },
  {
    name: 'Sign out',
    href: '/api/auth/signout',
  },
];

const Header = () => {
  const user = useUser();
  const { supabaseClient, isLoading } = useSessionContext();
  const { pathname, push } = useRouter();
  const { theme, setTheme } = useTheme();
  const [toggleIcon, setToggleIcon] = useState<any>(null);
  const [logo, setLogo] = useState<string>('/blug-logo-white.png');
  const [isDropDownVisible, setIsDropDownVisible] = useState<boolean>(false);
  const dropDownRef = useRef<HTMLDivElement>(null);

  const onSignOut = async () => {
    toast.promise(supabaseClient.auth.signOut(), { loading: 'Signing out...', success: 'Signed out!', error: 'Error signing out.' });

    push('/');
  };

  useEffect(() => {
    const icon =
      theme === 'dark' ? (
        <MdOutlineLightMode type="button" className="text-3xl ml-2 hover:cursor-pointer" onClick={() => setTheme('light')} />
      ) : (
        <MdOutlineNightlight type="button" className="text-3xl ml-2 hover:cursor-pointer" onClick={() => setTheme('dark')} />
      );

    setLogo(theme === 'dark' ? '/blug-logo-white.png' : '/blug-logo.png');
    setToggleIcon(icon);
  }, [theme, setTheme]);

  useOnClickOutside(dropDownRef, () => setIsDropDownVisible(false), 'mouseup');

  return (
    <header className="flex justify-between py-2 px-5 lg:px-24 mb-4 sticky top-0 shadow-sm z-50 text-black dark:text-white  bg-gray-100 dark:bg-slate-800">
      <div className="flex items-center space-x-5">
        <Link href="/">
          <a>
            <Image width={80} height={60} className="object-contain cursor-pointer" src={logo} alt="blug-logo" />
          </a>
        </Link>

        <div className="hidden md:inline-flex items-center space-x-5">
          <Link href="/about">
            <a>
              <h3 className="cursor-pointer hover:underline">About</h3>
            </a>
          </Link>

          <Link href="/contact">
            <a>
              <h3 className="cursor-pointer hover:underline">Contact</h3>
            </a>
          </Link>

          {user && pathname != '/posts/create' && (
            <Link href="/posts/create">
              <a>
                <h3 className="border cursor-pointer px-4 py-1 rounded-full text-slate-800 border-slate-800 hover:bg-slate-800 hover:text-white transition-colors ease-in-out dark:text-white dark:border-white dark:hover:bg-white dark:hover:text-slate-900">
                  Create
                </h3>
              </a>
            </Link>
          )}
        </div>
      </div>

      {isLoading ? (
        <Loading />
      ) : (
        <div className="flex items-center">
          {user && (
            <div className="flex flex-col items-center mr-2 md:mr-0">
              <Image
                height={40}
                width={40}
                onClick={() => setIsDropDownVisible(!isDropDownVisible)}
                className="rounded-full shadow-sm cursor-pointer object-cover"
                src={user.user_metadata.avatar_url}
                alt={user.user_metadata.name}
              />

              <div
                ref={dropDownRef}
                className={`${
                  isDropDownVisible ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-0'
                } z-50 absolute flex flex-col box-border top-20 right-0 md:right-14 rounded-md transition-all ease-out duration-175 p-2 bg-white dark:bg-slate-800 dark:text-white shadow-xl focus:outline-none`}
              >
                <Link href={`/authors/${user.id}`}>
                  <button
                    onClick={() => setIsDropDownVisible(false)}
                    className="font-bold block text-left text-slate-900 hover:underline pl-3 pr-20 py-2 rounded-md text-sm dark:hover:bg-slate-700 dark:text-white"
                  >
                    {user.user_metadata.name}
                    <br />
                    <span className="text-xs text-gray-600 dark:text-gray-400">@{user.user_metadata.user_name}</span>
                  </button>
                </Link>

                <div className="h-[1px] my-2 bg-gray-200 dark:bg-gray-700" />

                {DROPDOWN_ITEMS.map(item => (
                  <Link href={item.href}>
                    <button
                      onClick={() => setIsDropDownVisible(false)}
                      className="font-bold block text-left text-slate-900 hover:underline pl-3 pr-20 py-2 rounded-md text-sm dark:hover:bg-slate-700 dark:text-white"
                    >
                      {item.name}
                    </button>
                  </Link>
                ))}

                <div className="h-[1px] my-2 bg-gray-200 dark:bg-gray-700" />

                <button
                  className="cursor-pointer block text-left pl-3 pr-20 py-2 text-sm font-bold rounded-md hover:underline dark:hover:bg-slate-700 text-red-500"
                  onClick={onSignOut}
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}

          {!user && pathname != '/login' && (
            <div className="flex items-center space-x-5">
              <Link href="/login">
                <a>
                  <h3 className="border cursor-pointer px-4 py-1 rounded-full text-slate-800 border-slate-800 hover:bg-slate-800 hover:text-white transition-colors ease-in-out dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-slate-900">
                    Sign In
                  </h3>
                </a>
              </Link>
            </div>
          )}

          {toggleIcon}
        </div>
      )}
    </header>
  );
};

export default Header;
