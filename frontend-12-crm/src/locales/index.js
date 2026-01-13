import en from './en.json'
import hi from './hi.json'
import ar from './ar.json'
import es from './es.json'
import fr from './fr.json'
import de from './de.json'

export const translations = {
  en,
  hi,
  ar,
  es,
  fr,
  de
}

export const languages = [
  { code: 'en', name: 'English', dir: 'ltr' },
  { code: 'es', name: 'Spanish', dir: 'ltr' },
  { code: 'fr', name: 'French', dir: 'ltr' },
  { code: 'de', name: 'German', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', dir: 'rtl' },
  { code: 'hi', name: 'Hindi', dir: 'ltr' }
]

export default translations
