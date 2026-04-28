/**
 * usePushPermission — kapselt den Permission-Status für Push-Notifications
 * und bietet eine Methode zum Anfordern. Funktioniert nur in der nativen App.
 */
import { useCallback, useEffect, useState } from 'react';
import { getPushPermission, requestPushPermission, isPushSupported, type PushPermissionState } from '@/lib/push-service';

export function usePushPermission() {
  const [permission, setPermission] = useState<PushPermissionState>('unsupported');
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    getPushPermission().then(setPermission);
  }, []);

  const request = useCallback(async () => {
    setRequesting(true);
    try {
      const next = await requestPushPermission();
      setPermission(next);
      return next;
    } finally {
      setRequesting(false);
    }
  }, []);

  return {
    permission,
    requesting,
    request,
    supported: isPushSupported(),
  };
}
