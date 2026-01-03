import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function LanguageToggle() {
  const { i18n, t } = useTranslation('navigation');

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const currentLanguage = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0];
  const currentFlag = currentLanguage === 'it' ? '🇮🇹' : '🇬🇧';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <span className="text-base leading-none" aria-hidden="true">
            {currentFlag}
          </span>
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => changeLanguage('it')}>
          <span className="mr-2">🇮🇹</span>
          {t('language.it')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage('en')}>
          <span className="mr-2">🇬🇧</span>
          {t('language.en')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
