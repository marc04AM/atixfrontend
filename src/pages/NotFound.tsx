import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation(['notfound', 'common']);

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-muted/40 to-secondary/20">
      <div
        className="pointer-events-none absolute -top-32 right-[-10%] h-72 w-72 rounded-full bg-primary/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-[-25%] left-[-15%] h-80 w-80 rounded-full bg-accent/30 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,transparent_40%,hsl(var(--foreground)_/_0.06)_100%)]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-10 px-6 py-16 lg:flex-row lg:items-center lg:justify-between">
        <div className="text-center lg:text-left animate-in fade-in-0 slide-in-from-left-6 duration-700">
          <div className="font-mono text-[5.5rem] leading-none text-foreground/90 sm:text-[7rem] lg:text-[9rem]">
            {t('title')}
          </div>
          <div className="mt-4 h-1 w-24 bg-gradient-to-r from-primary/70 via-secondary/70 to-transparent lg:ml-1" />
        </div>

        <div className="w-full max-w-md rounded-2xl border border-border/60 bg-background/75 p-8 text-center shadow-lg shadow-muted/30 backdrop-blur lg:text-left animate-in fade-in-0 slide-in-from-bottom-6 duration-700 delay-150">
          <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
            {t('message')}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            {t('description')}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-start">
            <Button asChild size="lg">
              <Link to="/">{t('returnHome')}</Link>
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate(-1)}>
              {t('common:actions.back')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
