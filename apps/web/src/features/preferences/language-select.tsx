'use client';
import { Select } from '@kopaka/ui';
import { useLocale } from './locale-provider';
import type { Locale } from '../../lib/i18n/index';

export function LanguageSelect() {
  const { locale, setLocale, messages } = useLocale();
  return (
    <Select
      label={messages.language.label}
      value={locale}
      onChange={(event) => setLocale(event.target.value as Locale)}
    >
      <option value="fr" lang="fr">
        {messages.language.french}
      </option>
      <option value="mg" lang="mg">
        {messages.language.malagasy}
      </option>
    </Select>
  );
}
