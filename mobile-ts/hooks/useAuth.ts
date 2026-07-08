import { useEffect, useState } from 'react';
import { me } from '../api/auth';
import { User } from '../types';

interface UseAuthResult {
  user: User | null;
  loading: boolean;
}

export default function useAuth(): UseAuthResult {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await me();
        setUser(response.user);
      } catch {
        setUser(null);
      }
      setLoading(false);
    }

    load();
  }, []);

  return { user, loading };
}
