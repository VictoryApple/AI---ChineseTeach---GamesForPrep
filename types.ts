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

// Pastel Colors from the reference image
// Pink, Yellow/Apricot, Green/Sage, Purple/Periwinkle
export const PASTEL_COLORS = {
  pink: 'bg-[#facbbd]',       // Peach/Pink
  yellow: 'bg-[#fceccb]',     // Apricot/Cream
  green: 'bg-[#d6f2e4]',      // Mint/Sage
  purple: 'bg-[#e2dbf8]',     // Lavender
  blue: 'bg-[#d0e8ff]',       // Baby Blue
  orange: 'bg-[#ffe0b2]',     // Soft Orange
};

export const PASTEL_TEXT_COLORS = {
  pink: 'text-[#e68a73]',
  yellow: 'text-[#dcb56d]',
  green: 'text-[#8abfa0]',
  purple: 'text-[#a696c7]',
  blue: 'text-[#8ab6e1]',
  orange: 'text-[#e6b173]',
};

export const COLORS = [
  'bg-[#facbbd]', // Pink
  'bg-[#fceccb]', // Yellow
  'bg-[#d6f2e4]', // Green
  'bg-[#e2dbf8]', // Purple
  'bg-[#d0e8ff]', // Blue
];

export const THEME_CONFIG: Record<Theme, { name: string; bg: string; accent: string; pattern: string; icon: string }> = {
  pokemon: { 
    name: '宝可梦', 
    bg: 'bg-[#facbbd]', 
    accent: 'bg-[#e74c3c]', 
    pattern: 'pattern-dots',
    icon: '⚡'
  },
  ultraman: { 
    name: '奥特曼', 
    bg: 'bg-[#d0e8ff]', 
    accent: 'bg-[#3498db]', 
    pattern: 'pattern-grid',
    icon: '💫'
  },
  bluey: { 
    name: '布鲁伊', 
    bg: 'bg-[#e2dbf8]', 
    accent: 'bg-[#9b59b6]', 
    pattern: 'pattern-dots',
    icon: '🦴'
  },
  sanrio: { 
    name: '三丽鸥', 
    bg: 'bg-[#fceccb]', 
    accent: 'bg-[#f39c12]', 
    pattern: 'pattern-stripes',
    icon: '🎀'
  },
};
