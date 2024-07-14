import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { options } from "@/auth/config";

const ProfilePage = async () => {
  console.log("ProfilePage2");
  const session = await getServerSession(options);
  console.log("Session:", JSON.stringify(session, null, 2));
  return (
    <div>
      <h1>Profile</h1>
      <div>
        {session?.user?.name && <h2>Hello {session.user.name}!</h2>}
        {session?.user?.image && (
          <div>
            <Image
              src={session.user.image}
              width={200}
              height={200}
              alt={`Profile Pic for ${session.user.name}`}
              priority={true}
            />
            <Link href="/profile/github">GitHub</Link>
            <div>{JSON.stringify(session, null, 2)}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;