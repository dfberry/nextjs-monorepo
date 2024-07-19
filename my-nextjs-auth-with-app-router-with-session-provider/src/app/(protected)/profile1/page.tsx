'use client';
import { SessionProvider } from 'next-auth/react';
import UserAvatar from '@/components/Avatar';

export default function ProfilePage1() {
  return (
    <SessionProvider>
      <UserAvatar />
    </SessionProvider>
  );
}
