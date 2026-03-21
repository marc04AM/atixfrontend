import { useState, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { authApi, usersApi } from '@/lib/api';
import { getUserIdFromToken } from '@/lib/auth';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface FormErrors {
  email?: string;
  password?: string;
}

const LoginPage = forwardRef<HTMLDivElement>((_, ref) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, updateUser: updateAuthUser } = useAuth();
  const { t } = useTranslation('auth');
  const { t: tValidation } = useTranslation('validation');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formShake, setFormShake] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!email.trim()) {
      newErrors.email = tValidation('required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = tValidation('email');
    }

    if (!password.trim()) {
      newErrors.password = tValidation('required');
    } else if (password.length < 6) {
      newErrors.password = tValidation('minLength', { min: 6 });
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      setFormShake(true);
      setTimeout(() => setFormShake(false), 500);
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
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
      }, response.sessionId);

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
        title: t('login.welcomeBack'),
        description: t('login.loggedInAs', { name: `${response.firstName} ${response.lastName}` }),
      });
      
      navigate('/');
    } catch (error) {
      setFormShake(true);
      setTimeout(() => setFormShake(false), 500);
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
    <main ref={ref} className="min-h-screen flex items-center justify-center bg-background p-4">
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
          <form 
            onSubmit={handleSubmit} 
            className={cn("space-y-4", formShake && "animate-shake")}
            noValidate
          >
            <FormField
              label={t('login.emailLabel')}
              htmlFor="email"
              required
              error={errors.email}
            >
              <Input
                id="email"
                type="email"
                placeholder={t('login.emailPlaceholder')}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                }}
                disabled={isLoading}
                autoComplete="email"
                className={cn(errors.email && "input-error")}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
            </FormField>

            <FormField
              label={t('login.passwordLabel')}
              htmlFor="password"
              required
              error={errors.password}
            >
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('login.passwordPlaceholder')}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                  }}
                  disabled={isLoading}
                  autoComplete="current-password"
                  className={cn("pr-10", errors.password && "input-error")}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
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
            </FormField>

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
});

LoginPage.displayName = 'LoginPage';

export default LoginPage;