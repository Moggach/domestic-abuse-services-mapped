'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { HomePageProps } from '../App'; 

const App = dynamic(() => import('../App'), { ssr: false });

export function ClientOnly(props: HomePageProps): JSX.Element {
  return <App {...props} />;
}