import {
  DEFAULT_HARMONY_THEME,
  DARK_HARMONY_THEMES,
  HARMONY_THEME_GROUND,
  THEME_STORAGE_KEY,
} from './theme-tokens';

/**
 * Blocking inline script that applies the visitor's saved theme
 * ground colour to <html> before first paint, so a non-default
 * theme never flashes the default palette while MUI hydrates.
 *
 * Only <html> is touched — it carries `suppressHydrationWarning`
 * in the root layout, and <body> stays transparent over it until
 * CssBaseline loads, so styling <body> here is both unnecessary
 * and a hydration mismatch.
 */
export default function ThemeInitScript() {
  const darkNames = [...DARK_HARMONY_THEMES];

  const script = `(function(){try{
var KEY=${JSON.stringify(THEME_STORAGE_KEY)};
var DEFAULT=${JSON.stringify(DEFAULT_HARMONY_THEME)};
var GROUND=${JSON.stringify(HARMONY_THEME_GROUND)};
var DARK=${JSON.stringify(darkNames)};
var saved=null;try{saved=window.localStorage.getItem(KEY);}catch(e){}
var name=(saved&&GROUND[saved])?saved:DEFAULT;
var el=document.documentElement;
el.setAttribute('data-theme',name);
el.style.colorScheme=DARK.indexOf(name)>-1?'dark':'light';
el.style.backgroundColor=GROUND[name].background;
}catch(e){}})();`;

  return (
    <script dangerouslySetInnerHTML={{ __html: script }} />
  );
}
