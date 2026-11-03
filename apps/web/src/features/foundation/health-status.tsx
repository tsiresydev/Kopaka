'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Card, StatusMessage } from '@kopaka/ui';
import { HealthClient } from '../../lib/health-client/index';
import { useLocale } from '../preferences/locale-provider';
export function HealthStatus({ client: provided }: { client?: HealthClient }) {
  const { messages: fr } = useLocale();
  const [client] = useState(
    () =>
      provided ??
      new HealthClient(
        process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001',
      ),
  );
  const [state, setState] = useState<
    'idle' | 'loading' | 'available' | 'unavailable'
  >('idle');
  const mounted = useRef(false);
  const generation = useRef(0);
  const check = useCallback(() => {
    if (client.pending) return;
    const current = ++generation.current;
    setState('loading');
    void client.check().then((result) => {
      if (mounted.current && current === generation.current)
        setState(result.state);
    });
  }, [client]);
  useEffect(() => {
    mounted.current = true;
    const timer = setTimeout(check, 0);
    return () => {
      mounted.current = false;
      ++generation.current;
      clearTimeout(timer);
      client.cancel();
    };
  }, [client, check]);
  const loading = state === 'idle' || state === 'loading';
  return (
    <Card
      id="disponibilite"
      title={fr.service.title}
      description={fr.service.description}
    >
      <div role="status" aria-live="polite" aria-atomic="true">
        <StatusMessage
          tone={
            loading ? 'loading' : state === 'available' ? 'success' : 'error'
          }
          label={
            loading
              ? fr.service.loading
              : state === 'available'
                ? fr.service.available
                : fr.service.unavailable
          }
          {...(state === 'unavailable' ? { message: fr.service.recovery } : {})}
        />
      </div>
      <Button aria-disabled={loading} aria-busy={loading} onClick={check}>
        {fr.service.retry}
      </Button>
    </Card>
  );
}
