'use client';
import { useSession, signIn, signOut } from "next-auth/react";

export default function AuthButton() {
  const { data: session } = useSession();
  if (session) {
    return (
      <>
        Signed in as {session?.user?.name} <br />
        <button onClick={() => signOut({ callbackUrl: "/" })}>Sign out</button>
      </>
    );
  }
  return (
    <>
      Not signed in &nbsp;&nbsp;
      <button onClick={() => signIn("github", { callbackUrl: "/profile" })}>Sign in</button>
    </>
  );
}