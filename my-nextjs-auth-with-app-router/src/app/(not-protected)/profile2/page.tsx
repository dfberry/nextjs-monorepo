import Image from "next/image";
import { getServerSession } from "next-auth";
import { options } from "@/auth/config";

const ProfilePage2 = async () => {
  console.log("ProfilePage2");
  const session = await getServerSession(options);
  console.log("Session:", JSON.stringify(session, null, 2));
  return (
    <div>
      <h1>ProfilePage 2</h1>

      <div>
        {session?.user?.name ? <h2>Hello {session.user.name}!</h2> : null}

        {session?.user?.image ? (
          <Image
            src={session.user.image}
            width={200}
            height={200}
            alt={`Profile Pic for ${session.user.name}`}
            priority={true}
          />
        ) : null}
        {JSON.stringify(session, null, 2)}
      </div>
    </div>
  );
};

export default ProfilePage2;
