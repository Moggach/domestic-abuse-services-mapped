'use client';
import Link from 'next/link';
import type { KeyboardEvent } from 'react';
import React, { useState } from 'react';

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
            <div
              className="tooltip tooltip-left"
              data-tip="Delete from browser history"
            >
              <Link href="/clear-browser">
                <svg
                  fill="currentColor"
                  version="1.1"
                  className="h-8 w-8 text-accent"
                  viewBox="0 0 408.483 408.483"
                >
                  <g>
                    <g>
                      <path d="M87.748,388.784c0.461,11.01,9.521,19.699,20.539,19.699h191.911c11.018,0,20.078-8.689,20.539-19.699l13.705-289.316    H74.043L87.748,388.784z M247.655,171.329c0-4.61,3.738-8.349,8.35-8.349h13.355c4.609,0,8.35,3.738,8.35,8.349v165.293    c0,4.611-3.738,8.349-8.35,8.349h-13.355c-4.61,0-8.35-3.736-8.35-8.349V171.329z M189.216,171.329    c0-4.61,3.738-8.349,8.349-8.349h13.355c4.609,0,8.349,3.738,8.349,8.349v165.293c0,4.611-3.737,8.349-8.349,8.349h-13.355    c-4.61,0-8.349-3.736-8.349-8.349V171.329L189.216,171.329z M130.775,171.329c0-4.61,3.738-8.349,8.349-8.349h13.356    c4.61,0,8.349,3.738,8.349,8.349v165.293c0,4.611-3.738,8.349-8.349,8.349h-13.356c-4.61,0-8.349-3.736-8.349-8.349V171.329z" />
                      <path d="M343.567,21.043h-88.535V4.305c0-2.377-1.927-4.305-4.305-4.305h-92.971c-2.377,0-4.304,1.928-4.304,4.305v16.737H64.916    c-7.125,0-12.9,5.776-12.9,12.901V74.47h304.451V33.944C356.467,26.819,350.692,21.043,343.567,21.043z" />
                    </g>
                  </g>
                </svg>
              </Link>
            </div>
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

          <div
            className="tooltip tooltip-left"
            data-tip="Delete from browser history"
          >
            <Link href="/clear-browser">
              <svg
                fill="currentColor"
                version="1.1"
                className="h-8 w-8 text-accent"
                viewBox="0 0 408.483 408.483"
              >
                <g>
                  <g>
                    <path d="M87.748,388.784c0.461,11.01,9.521,19.699,20.539,19.699h191.911c11.018,0,20.078-8.689,20.539-19.699l13.705-289.316    H74.043L87.748,388.784z M247.655,171.329c0-4.61,3.738-8.349,8.35-8.349h13.355c4.609,0,8.35,3.738,8.35,8.349v165.293    c0,4.611-3.738,8.349-8.35,8.349h-13.355c-4.61,0-8.35-3.736-8.35-8.349V171.329z M189.216,171.329    c0-4.61,3.738-8.349,8.349-8.349h13.355c4.609,0,8.349,3.738,8.349,8.349v165.293c0,4.611-3.737,8.349-8.349,8.349h-13.355    c-4.61,0-8.349-3.736-8.349-8.349V171.329L189.216,171.329z M130.775,171.329c0-4.61,3.738-8.349,8.349-8.349h13.356    c4.61,0,8.349,3.738,8.349,8.349v165.293c0,4.611-3.738,8.349-8.349,8.349h-13.356c-4.61,0-8.349-3.736-8.349-8.349V171.329z" />
                    <path d="M343.567,21.043h-88.535V4.305c0-2.377-1.927-4.305-4.305-4.305h-92.971c-2.377,0-4.304,1.928-4.304,4.305v16.737H64.916    c-7.125,0-12.9,5.776-12.9,12.901V74.47h304.451V33.944C356.467,26.819,350.692,21.043,343.567,21.043z" />
                  </g>
                </g>
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default NavBar;
