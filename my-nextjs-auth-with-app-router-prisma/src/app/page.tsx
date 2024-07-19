import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col">
      <Link href="/sign-in">Sign in</Link>
      <Link href="/sign-out">Sign out</Link>
      <Link href="/profile"></Link>
    </div>

  );
}
