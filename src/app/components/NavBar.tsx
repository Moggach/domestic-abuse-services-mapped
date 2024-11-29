'use client';
import Link from 'next/link';
import React, { useState, KeyboardEvent } from 'react';

import ThemeSwitcher from './ThemeSwitcher';

const NavBar: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  const toggleDrawer = (): void => {
    setDrawerOpen((prev) => !prev);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === 'Enter') {
      toggleDrawer();
    }
  };

  const menuItems: string[] = ['About', 'Privacy'];

  return (
    <>
      <nav className="p-4">
        <div className="container min-w-full flex justify-between items-center">
          <h1 className="font-headings text-3xl font-bold text-accent">
            <Link href="/">Domestic Abuse Services Mapped</Link>
          </h1>

          <div className="hidden md:flex space-x-4 items-center">
            {menuItems.map((item) => (
              <Link
                href={`/${item.toLowerCase()}`}
                key={item}
                className="font-headings text-2xl font-bold text-accent"
              >
                {item}
              </Link>
            ))}
            <ThemeSwitcher />
          </div>

          <div className="md:hidden text-accent">
            <button onClick={toggleDrawer} aria-label="Toggle menu">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block h-6 w-6 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      </nav>
      <div
        role="button"
        tabIndex={0}
        aria-label="Close drawer overlay"
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity ${
          drawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleDrawer}
        onKeyDown={handleKeyDown}
      ></div>

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 bg-base-200 w-64 z-50 transform ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        } transition-transform`}
      >
        <div className="p-4 flex flex-col gap-4 text-accent">
          <div className="self-end">
            <button onClick={toggleDrawer} aria-label="Close menu">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block h-6 w-6 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          {menuItems.map((item) => (
            <Link
              href={`/${item.toLowerCase()}`}
              key={item}
              className="block text-2xl font-headings font-bold text-accent"
              onClick={toggleDrawer}
            >
              {item}
            </Link>
          ))}
          <ThemeSwitcher />
        </div>
      </div>
    </>
  );
};

export default NavBar;
