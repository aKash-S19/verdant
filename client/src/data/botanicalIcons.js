// Curated botanical icon set for garden plants and sanctuary
export const BOTANICAL_ICONS = [
  { id: 'herb', icon: '🌿', label: 'Herbs & Aromatic' },
  { id: 'tomato', icon: '🍅', label: 'Fruiting Vegetables' },
  { id: 'flower', icon: '🌸', label: 'Flowering Blooms' },
  { id: 'citrus', icon: '🍋', label: 'Citrus & Fruit Trees' },
  { id: 'pepper', icon: '🌶️', label: 'Peppers & Chilies' },
  { id: 'houseplant', icon: '🪴', label: 'Indoor Foliage' },
  { id: 'succulent', icon: '🌵', label: 'Succulents & Cacti' },
  { id: 'greens', icon: '🥬', label: 'Leafy Greens' },
  { id: 'grass', icon: '🌾', label: 'Grasses & Microgreens' },
  { id: 'bonsai', icon: '🎋', label: 'Bonsai & Bamboo' },
  { id: 'berry', icon: '🍓', label: 'Berries & Vines' },
  { id: 'sunflower', icon: '🌻', label: 'Sunflowers' }
];

export function getPlantIcon(plant) {
  if (plant?.custom_icon) return plant.custom_icon;
  const name = ((plant?.custom_name || '') + ' ' + (plant?.species || '') + ' ' + (plant?.category || '')).toLowerCase();
  if (name.includes('basil') || name.includes('mint') || name.includes('herb') || name.includes('rosemary') || name.includes('thyme') || name.includes('coriander') || name.includes('tulsi')) return '🌿';
  if (name.includes('tomato') || name.includes('brinjal') || name.includes('eggplant') || name.includes('cucumber') || name.includes('veggie')) return '🍅';
  if (name.includes('rose') || name.includes('flower') || name.includes('marigold') || name.includes('jasmine') || name.includes('hibiscus') || name.includes('orchid')) return '🌸';
  if (name.includes('lemon') || name.includes('citrus') || name.includes('fruit') || name.includes('orange') || name.includes('mango')) return '🍋';
  if (name.includes('chili') || name.includes('pepper') || name.includes('capsicum')) return '🌶️';
  if (name.includes('aloe') || name.includes('succulent') || name.includes('cactus') || name.includes('jade')) return '🌵';
  if (name.includes('spinach') || name.includes('lettuce') || name.includes('kale') || name.includes('green')) return '🥬';
  if (name.includes('pothos') || name.includes('monstera') || name.includes('snake') || name.includes('indoor') || name.includes('fern')) return '🪴';
  return '🌱';
}
