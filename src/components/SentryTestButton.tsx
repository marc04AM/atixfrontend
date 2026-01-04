import { Button } from "@/components/ui/button";
import * as Sentry from '@sentry/react';

export function SentryTestButton() {
  const throwError = () => {
    throw new Error("Test Sentry Error - This is a test exception to verify Sentry integration");
  };

  const captureMessage = () => {
    Sentry.captureMessage("Test Sentry Message - Manual test message", "info");
    alert("Messaggio di test inviato a Sentry!");
  };

  const captureException = () => {
    try {
      throw new Error("Test Sentry Exception - Caught and reported manually");
    } catch (error) {
      Sentry.captureException(error);
      alert("Eccezione di test catturata e inviata a Sentry!");
    }
  };

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 p-4 bg-card border rounded-lg shadow-lg">
      <p className="text-sm font-semibold mb-2">Sentry Test Controls</p>
      <Button
        onClick={throwError}
        variant="destructive"
        size="sm"
      >
        Throw Error (ErrorBoundary)
      </Button>
      <Button
        onClick={captureException}
        variant="outline"
        size="sm"
      >
        Capture Exception
      </Button>
      <Button
        onClick={captureMessage}
        variant="secondary"
        size="sm"
      >
        Send Message
      </Button>
    </div>
  );
}
