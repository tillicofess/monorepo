import { type ReactNode, useContext, useMemo } from 'react';
import { defineAbilityFor } from '@/config/ability';
import { AbilityContext } from '@/lib/casl';
import { useAuth } from './auth/auth';

export const useAbility = () => useContext(AbilityContext);

export const AbilityProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();

  const ability = useMemo(() => {
    return defineAbilityFor(user?.roles || []);
  }, [user]);

  return <AbilityContext value={ability}>{children}</AbilityContext>;
};
