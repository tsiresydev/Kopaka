'use client';
import { Button, Card } from '@kopaka/ui';
import { useLocale } from '../features/preferences/locale-provider';
export default function ErrorPage({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const { messages: fr } = useLocale();
  return (
    <main className="error-page">
      <Card title={fr.error.title}>
        <p>{fr.error.message}</p>
        <Button onClick={reset}>{fr.error.retry}</Button>
      </Card>
    </main>
  );
}
