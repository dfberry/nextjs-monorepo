// hooks/useRequireAuth.tsx
import { validateRequest } from '@/lib/auth/auth'; 

const useRequireAuth = async () => {
  const { user, session } = await validateRequest();

  console.log('useRequireAuth user', user);
  console.log('useRequireAuth session', session);

  return { user, session, isAuthorized: !!user };
};

export default useRequireAuth;