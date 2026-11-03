import fr from '../../messages/fr.json';
import mg from '../../messages/mg.json';

export type Locale = 'fr' | 'mg';
export type Messages = typeof fr;
export const locales: readonly Locale[] = ['fr', 'mg'];
export const dictionaries: Record<Locale, Messages> = { fr, mg };
