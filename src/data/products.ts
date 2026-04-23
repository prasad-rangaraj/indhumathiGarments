import { Product } from '@/types';
import product1 from '@/assets/product-1.jpg';
import product2 from '@/assets/product-2.jpg';
import product3 from '@/assets/product-3.jpg';
import product4 from '@/assets/product-4.jpg';
import product5 from '@/assets/product-5.jpg';
import product6 from '@/assets/product-6.jpg';

export const categoryStructure = {
  'Slips & Bottoms': ['Girls Slips', 'Sports Slips', 'Girls Inner Shorts / Cycling Shorts'],
  'Bras - Padded': ['Padded Bra', 'Semi Padded Bra'],
  'Bras - Non-Padded': ['Non Padded Bra', 'Double Layer Non-Padded Bra', 'Round Cup Single Layered Bra'],
  'Bras - Sports': ['Sports Bra', 'Sports Bra (Moulded Cup)'],
  'Bras - Moulded Cup': ['Moulded Cup Bra', 'Sports Bra (Moulded Cup)']
};

export const products: Product[] = [
  // Slips & Bottoms
  {
    id: '1',
    name: 'Girls Cotton Slip',
    price: 399,
    image: product1,
    description: 'Soft and comfortable cotton slip for girls. Perfect for everyday wear with breathable fabric.',
    material: '100% Pure Cotton',
    sizes: ['S', 'M', 'L', 'XL'],
    category: 'Slips & Bottoms',
    subcategory: 'Girls Slips'
  },
  {
    id: '2',
    name: 'Sports Cotton Slip',
    price: 449,
    image: product2,
    description: 'Athletic cotton slip with moisture-wicking properties. Ideal for active lifestyles.',
    material: '95% Cotton, 5% Elastane',
    sizes: ['S', 'M', 'L', 'XL'],
    category: 'Slips & Bottoms',
    subcategory: 'Sports Slips'
  },
  {
    id: '3',
    name: 'Girls Cycling Shorts',
    price: 549,
    image: product3,
    description: 'Comfortable inner shorts perfect for cycling and sports activities. Anti-chafe design.',
    material: '90% Cotton, 10% Spandex',
    sizes: ['S', 'M', 'L', 'XL'],
    category: 'Slips & Bottoms',
    subcategory: 'Girls Inner Shorts / Cycling Shorts'
  },
  // Bras - Padded
  {
    id: '4',
    name: 'Full Padded Cotton Bra',
    price: 899,
    image: product4,
    description: 'Fully padded cotton bra with seamless cups. Provides excellent shape and support.',
    material: '100% Pure Cotton',
    sizes: ['32B', '34B', '36B', '38B'],
    category: 'Bras - Padded',
    subcategory: 'Padded Bra'
  },
  {
    id: '5',
    name: 'Semi Padded Comfort Bra',
    price: 799,
    image: product5,
    description: 'Light padding for natural look with added comfort. Perfect for daily wear.',
    material: '100% Pure Cotton',
    sizes: ['32B', '34B', '36B', '38B'],
    category: 'Bras - Padded',
    subcategory: 'Semi Padded Bra'
  },
  // Bras - Non-Padded
  {
    id: '6',
    name: 'Non Padded Cotton Bra',
    price: 649,
    image: product6,
    description: 'Classic non-padded bra with excellent support. Breathable and comfortable.',
    material: '100% Pure Cotton',
    sizes: ['32B', '34B', '36B', '38B', '40B'],
    category: 'Bras - Non-Padded',
    subcategory: 'Non Padded Bra'
  },
  {
    id: '7',
    name: 'Double Layer Cotton Bra',
    price: 749,
    image: product1,
    description: 'Double layer construction for extra coverage without padding. Ultra comfortable.',
    material: '100% Pure Cotton',
    sizes: ['32B', '34B', '36B', '38B'],
    category: 'Bras - Non-Padded',
    subcategory: 'Double Layer Non-Padded Bra'
  },
  {
    id: '8',
    name: 'Round Cup Single Layer Bra',
    price: 599,
    image: product2,
    description: 'Single layer round cup design for natural shape. Lightweight and breathable.',
    material: '100% Pure Cotton',
    sizes: ['32B', '34B', '36B', '38B'],
    category: 'Bras - Non-Padded',
    subcategory: 'Round Cup Single Layered Bra'
  },
  // Bras - Sports
  {
    id: '9',
    name: 'Active Sports Bra',
    price: 999,
    image: product3,
    description: 'High support sports bra for intense workouts. Moisture-wicking fabric.',
    material: '90% Cotton, 10% Spandex',
    sizes: ['S', 'M', 'L', 'XL'],
    category: 'Bras - Sports',
    subcategory: 'Sports Bra'
  },
  {
    id: '10',
    name: 'Sports Bra Moulded Cup',
    price: 1199,
    image: product4,
    description: 'Sports bra with moulded cups for better shape during activities. Medium to high support.',
    material: '85% Cotton, 15% Elastane',
    sizes: ['S', 'M', 'L', 'XL'],
    category: 'Bras - Sports',
    subcategory: 'Sports Bra (Moulded Cup)'
  },
  // Bras - Moulded Cup
  {
    id: '11',
    name: 'Classic Moulded Cup Bra',
    price: 1099,
    image: product5,
    description: 'Seamless moulded cup bra for smooth silhouette. Perfect under fitted clothes.',
    material: '95% Cotton, 5% Elastane',
    sizes: ['32B', '34B', '36B', '38B'],
    category: 'Bras - Moulded Cup',
    subcategory: 'Moulded Cup Bra'
  },
  {
    id: '12',
    name: 'Sports Moulded Cup Bra',
    price: 1199,
    image: product6,
    description: 'Athletic moulded cup bra combining sports support with smooth finish.',
    material: '85% Cotton, 15% Elastane',
    sizes: ['S', 'M', 'L', 'XL'],
    category: 'Bras - Moulded Cup',
    subcategory: 'Sports Bra (Moulded Cup)'
  }
];
