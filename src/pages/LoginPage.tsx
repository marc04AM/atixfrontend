import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { authApi, usersApi } from '@/lib/api';
import { getUserIdFromToken } from '@/lib/auth';
import { useTranslation } from 'react-i18next';

export default function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, updateUser: updateAuthUser } = useAuth();
  const { t } = useTranslation('auth');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter both email and password.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await authApi.login(email, password);
      
      const userId = response.id ?? getUserIdFromToken(response.token);

      login(response.token, {
        id: userId ?? response.id,
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        role: response.role as 'ADMIN' | 'OWNER' | 'USER',
        profileImageUrl: response.profileImageUrl,
      });

      try {
        const resolvedUser = userId ? await usersApi.getById(userId) : null;
        if (resolvedUser) {
          updateAuthUser({
            id: resolvedUser.id ?? userId ?? response.id,
            profileImageUrl: resolvedUser.profileImageUrl ?? response.profileImageUrl,
            type: resolvedUser.type,
          });
        }
      } catch {
        // Ignore profile hydration errors on login.
      }
      
      toast({
        title: 'Welcome back!',
        description: `Logged in as ${response.firstName} ${response.lastName}`,
      });
      
      navigate('/');
    } catch (error) {
      toast({
        title: t('login.errors.invalidCredentials'),
        description: error instanceof Error ? error.message : t('login.errors.unexpectedError'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl">
              <img
                src="/favicon.svg"
                alt="ATIX"
                className="h-full w-full"
              />
            </div>
          </div>
          <CardTitle className="text-2xl">{t('login.title')}</CardTitle>
          <CardDescription>{t('login.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('login.emailLabel')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('login.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('login.passwordLabel')}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('login.passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('login.loggingIn')}
                </>
              ) : (
                t('login.submitButton')
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}