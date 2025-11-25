export type Theme = 'pokemon' | 'ultraman' | 'bluey' | 'sanrio';

export interface GridItem {
  id: string;
  type: 'text' | 'surprise';
  theme: Theme;
  content: string; // Hanzi or "Surprise!"
  subContent?: string; // Pinyin
  imageUrl?: string;
  isRevealed: boolean;
  color: string;
}

export interface AppState {
  inputText: string;
  items: GridItem[];
  theme: Theme;
  mode: 'interactive' | 'print';
  isLoading: boolean;
  showPinyin: boolean;
}

// Updated with "Cuter" pastel colors
export const THEME_CONFIG: Record<Theme, { name: string; bg: string; accent: string; pattern: string; icon: string }> = {
  pokemon: { 
    name: '宝可梦', 
    bg: 'bg-rose-400', 
    accent: 'bg-yellow-300', 
    pattern: 'pattern-dots',
    icon: '🔴'
  },
  ultraman: { 
    name: '奥特曼', 
    bg: 'bg-sky-500', 
    accent: 'bg-red-400', 
    pattern: 'pattern-grid',
    icon: '✨'
  },
  bluey: { 
    name: '布鲁伊', 
    bg: 'bg-blue-300', 
    accent: 'bg-orange-300', 
    pattern: 'pattern-dots',
    icon: '🦴'
  },
  sanrio: { 
    name: '三丽鸥', 
    bg: 'bg-pink-300', 
    accent: 'bg-white', 
    pattern: 'pattern-stripes',
    icon: '🎀'
  },
};

export const COLORS = [
  'bg-rose-400',
  'bg-sky-400',
  'bg-amber-300',
  'bg-emerald-400',
  'bg-violet-400',
  'bg-pink-400',
  'bg-indigo-400',
  'bg-orange-400'
];