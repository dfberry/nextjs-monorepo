# Next auth client-side session values

To access the Next auth session values in your client side Next.js 13+ code, here is a simple component:

```
// client component
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
```

Using client component with session wrapper for client page: 

```
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
```