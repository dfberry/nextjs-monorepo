import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { options } from "@/auth/config";
import { SignOutButton } from "@/components/SignOutButton";

const SignOutPage = async () => {
  const session = await getServerSession(options);

  if (!session) {
    redirect("/");
  } else {
    return (
      <div>
        <h1>SignOutPage</h1>

        <SignOutButton />
      </div>
    );
  }
};

export default SignOutPage;
