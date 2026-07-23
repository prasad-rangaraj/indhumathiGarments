import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Globe, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const languages = [
  { code: 'en', label: 'EN', name: 'English (EN)' },
  { code: 'ta', label: 'த', name: 'தமிழ் (TA)' },
  { code: 'hi', label: 'हि', name: 'हिन्दी (HI)' },
];

interface LanguageSwitcherProps {
  className?: string;
  responsive?: boolean;
}

export const LanguageSwitcher = ({ className = '', responsive = true }: LanguageSwitcherProps) => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  const currentLang = languages.find((lang) => lang.code === i18n.language) || languages[0];

  // Pill Switcher markup (matching reference image with solid orange #FF6B00 active indicator)
  const PillSwitcher = (
    <div className="flex items-center bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-full p-1 shadow-sm select-none">
      {languages.map((lang) => {
        const isActive = i18n.language === lang.code;
        return (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`relative px-4 py-1.5 text-sm font-semibold rounded-full transition-colors duration-300 focus:outline-none flex items-center justify-center min-w-[42px] h-8 ${
              isActive
                ? 'text-white font-bold'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeLangIndicator"
                className="absolute inset-0 bg-[#FF6B00] rounded-full z-0 shadow-sm"
                transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
              />
            )}
            <span className="relative z-10">{lang.label}</span>
          </button>
        );
      })}
    </div>
  );

  // Dropdown Switcher markup (clean & modern with #FF6B00 accents)
  const DropdownSwitcher = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold border border-zinc-200 dark:border-zinc-800 rounded-full bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 focus:outline-none shadow-sm transition-colors h-9">
          <Globe className="h-4 w-4 text-zinc-500" />
          <span className="text-[#FF6B00] font-bold">{currentLang.label}</span>
          <ChevronDown className="h-3 w-3 text-zinc-400" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 rounded-xl p-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-lg z-50">
        {languages.map((lang) => {
          const isActive = i18n.language === lang.code;
          return (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors focus:bg-zinc-50 dark:focus:bg-zinc-900 ${
                isActive
                  ? 'bg-zinc-50 dark:bg-zinc-900 text-[#FF6B00] font-bold'
                  : 'text-zinc-700 dark:text-zinc-300'
              }`}
            >
              <span>{lang.name}</span>
              {isActive && <div className="h-1.5 w-1.5 rounded-full bg-[#FF6B00]" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (!responsive) {
    return <div className={className}>{PillSwitcher}</div>;
  }

  return (
    <div className={className}>
      {/* Desktop layout: Pill switcher */}
      <div className="hidden md:block">{PillSwitcher}</div>
      {/* Mobile layout: Dropdown switcher */}
      <div className="block md:hidden">{DropdownSwitcher}</div>
    </div>
  );
};
