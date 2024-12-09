import type { EditorThemeClasses } from 'lexical';

import './StickyEditorTheme.css';

// import baseTheme from 'EditorTheme';
import EditorTheme from './editorTheme';

const theme: EditorThemeClasses = {
  ...EditorTheme,
  paragraph: 'sticker-paragraph',
};

export default theme;
