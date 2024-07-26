// hooks/useRequireAuth.tsx
import { validateRequest } from '@/lib/auth'; 

const useRequireAuth = async () => {
  const { user, session } = await validateRequest();

  return { user, session, isAuthorized: !!user };
};

export default useRequireAuth;