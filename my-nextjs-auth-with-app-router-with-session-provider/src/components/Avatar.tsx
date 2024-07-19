'use client'; // not necessary for nested client components but helpful


import { useSession } from 'next-auth/react';

export default function UserAvatar() {
  const { data: session } = useSession();  // get the client session
  const image = session?.user?.image || undefined;
  const name = session?.user?.name || undefined;

  return (
    <>
      {name}
      </>
  );
}