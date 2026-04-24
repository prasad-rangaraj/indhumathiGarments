import { useState, useEffect } from 'react';
import { settingsAPI } from '@/lib/api';

export interface SiteSettings {
  siteName: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'Indhumathi',
  tagline: "Pure Cotton Women's Innerwear",
  email: 'indhumathi.img@gmail.com',
  phone: '+91 87546 09226',
  address: 'Teachers colony 2nd street, Pandian nagar, Tiruppur,Tamilnadu .',
};

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    settingsAPI.getPublic()
      .then(data => {
        setSettings({ ...DEFAULT_SETTINGS, ...data });
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load site settings', err);
        setSettings(DEFAULT_SETTINGS);
        setLoading(false);
      });
  }, []);

  return { settings, loading };
};

// No longer relying on a module lock, so we export an empty function for backward compatibility
export const clearSettingsCache = () => {};
