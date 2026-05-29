import React from 'react';
import TopBar from './TopBar';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageWrapper({ children, className = '' }: PageWrapperProps) {
  return (
    <>
      <TopBar />
      <main className={`page-wrapper page-content ${className}`}>
        {children}
      </main>
    </>
  );
}
