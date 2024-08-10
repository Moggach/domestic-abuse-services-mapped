"use client"
import React, { useState } from 'react';
import ThemeSwitcher from './ThemeSwitcher';

const NavBar = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);

    const toggleDrawer = () => {
        setDrawerOpen(!drawerOpen);
    };

    const menuItems = ['Home', 'About', 'Privacy'];

    return (
        <>
            <nav className="p-4">
                <div className="container min-w-full flex justify-between items-center">
                    <h1 className="font-headings text-3xl">
                        <a href="/">Domestic Abuse Services Mapped</a>
                    </h1>
                    <div className="hidden md:flex space-x-4 items-center">
                        {menuItems.map((item) => (
                            item === 'Home' ? (
                                <a href="/"  key={item} className="font-headings text-2xl">Home</a>
                            ) : (
                                <a href={`/${item.toLowerCase()}`} key={item} className="font-headings text-2xl">
                                    {item}
                                </a>
                            )
                        ))}
                        <ThemeSwitcher />
                    </div>
                    <div className="md:hidden">
                        <button onClick={toggleDrawer} className="">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                className="inline-block h-6 w-6 stroke-current">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 6h16M4 12h16M4 18h16"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </nav>
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity ${drawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={toggleDrawer}
            ></div>
            <div
                className={`fixed inset-y-0 right-0 bg-base-200 w-64 z-50 transform ${drawerOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform`}
            >
                <div className="p-4 flex flex-col gap-4">
                    {menuItems.map((item) => (
                        item === 'Home' ? (
                            <a href="/" key={item} className="block text-2xl font-headings">Home</a>
                        ) : (
                            <a
                                href={`/${item.toLowerCase()}`}
                                key={item}
                                className="block text-2xl font-headings"
                                onClick={toggleDrawer}
                            >
                                {item}
                            </a>
                        )
                    ))}
                    <ThemeSwitcher />
                </div>
            </div>
        </>
    );
};

export default NavBar;
