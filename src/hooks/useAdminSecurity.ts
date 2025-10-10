import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface SecurityCheck {
  isValid: boolean;
  reason?: string;
  timestamp: number;
}

export function useAdminSecurity() {
  const { profile } = useAuth();
  const [securityCheck, setSecurityCheck] = useState<SecurityCheck>({
    isValid: profile?.role === 'admin',
    timestamp: Date.now()
  });

  useEffect(() => {
    setSecurityCheck({
      isValid: profile?.role === 'admin',
      timestamp: Date.now()
    });
  }, [profile]);

  return securityCheck;
}