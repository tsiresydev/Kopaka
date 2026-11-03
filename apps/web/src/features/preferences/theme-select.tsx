'use client';
import { Select } from '@kopaka/ui';
import { useTheme } from './theme-provider';
import { useLocale } from './locale-provider';
export function ThemeSelect() {
  const { messages: fr } = useLocale();
  const { choice, setChoice } = useTheme();
  return (
    <Select
      label={fr.theme.label}
      value={choice}
      onChange={(event) =>
        setChoice(event.target.value as 'light' | 'dark' | 'system')
      }
    >
      <option value="light">{fr.theme.light}</option>
      <option value="dark">{fr.theme.dark}</option>
      <option value="system">{fr.theme.system}</option>
    </Select>
  );
}
