import { GridItem, Theme, COLORS } from '../types';

const POKEMON_COUNT = 151;

export const getRandomPokemonId = () => Math.floor(Math.random() * POKEMON_COUNT) + 1;

export const getPokemonImageUrl = (id: number) => 
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

export const getRandomColor = () => {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
};

export const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Generates the grid items mixing text and surprise slots
export const generateGridItems = (
  pinyinData: { char: string; pinyin: string }[],
  theme: Theme,
  totalSlots: number = 12
): GridItem[] => {
  
  const items: GridItem[] = [];
  
  // 1. Create Text Items
  pinyinData.forEach(data => {
    items.push({
      id: `text-${Math.random().toString(36).substr(2, 9)}`,
      type: 'text',
      theme: theme,
      content: data.char,
      subContent: data.pinyin,
      isRevealed: false,
      color: getRandomColor()
    });
  });

  // 2. Fill remaining slots with Surprise placeholders
  const remainingSlots = Math.max(0, totalSlots - items.length);
  
  for (let i = 0; i < remainingSlots; i++) {
    const isPokemon = theme === 'pokemon';
    const pokeId = getRandomPokemonId();
    
    items.push({
      id: `surprise-${Math.random().toString(36).substr(2, 9)}`,
      type: 'surprise',
      theme: theme,
      content: 'Surprise!',
      // If Pokemon, we can set URL immediately. If AI theme, we leave it undefined for App to fill.
      imageUrl: isPokemon ? getPokemonImageUrl(pokeId) : undefined,
      isRevealed: false,
      color: getRandomColor()
    });
  }

  // 3. Shuffle everything to ensure random distribution
  return shuffleArray(items).slice(0, totalSlots);
};