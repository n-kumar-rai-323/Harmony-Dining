export type MenuGroup = 'FOOD' | 'BEVERAGES' | 'BAR';

export type MenuStatus =
  | 'VERIFIED'
  | 'NEEDS_CONFIRMATION'
  | 'DISABLED';

export type MenuVariant = {
  name: string;
  price: number;
};

export type DietaryType = 'VEG' | 'NON_VEG' | 'EGG';

export type MenuItem = {
  name: string;
  price?: number | null;
  variants?: MenuVariant[];
  description?: string;
  status: MenuStatus;
  note?: string;
  imageUrl?: string | null;
  ingredients?: string[];
  tags?: string[];
  dietary?: DietaryType | null;
  isAvailable?: boolean;
};

export type MenuCategory = {
  id: string;
  group: MenuGroup;
  name: string;
  items: MenuItem[];
};

export const menuData: MenuCategory[] = [
  // =====================================================
  // FOOD
  // =====================================================

  {
    id: 'soups',
    group: 'FOOD',
    name: 'Soups',
    items: [
      { name: 'Dal Palak Soup', price: 280, status: 'VERIFIED' },
      { name: 'Creamy Tomato Soup', price: 240, status: 'VERIFIED' },
      {
        name: 'Hot & Sour Soup',
        variants: [
          { name: 'Veg', price: 280 },
          { name: 'Chicken', price: 340 },
        ],
        status: 'VERIFIED',
      },
      {
        name: 'Manchow Soup',
        variants: [
          { name: 'Veg', price: 290 },
          { name: 'Chicken', price: 340 },
        ],
        status: 'VERIFIED',
      },
      { name: 'Mutton Bone Soup', price: 260, status: 'VERIFIED' },
      { name: 'Cream of Mushroom Soup', price: 260, status: 'VERIFIED' },
      { name: 'Cream of Chicken Soup', price: 280, status: 'VERIFIED' },
    ],
  },

  {
    id: 'salads-raita',
    group: 'FOOD',
    name: 'Salads & Raita',
    items: [
      { name: 'Garden Green Salad', price: 240, status: 'VERIFIED' },
      { name: 'Fresh Fruit Salad', price: 390, status: 'VERIFIED' },
      { name: 'Caesar Salad', price: 420, status: 'VERIFIED' },
      { name: 'Russian Salad', price: 340, status: 'VERIFIED' },
      { name: 'Avocado Royal Salad', price: 460, status: 'VERIFIED' },
      { name: 'Indian Salad', price: 190, status: 'VERIFIED' },
      { name: 'Classic Raita', price: 240, status: 'VERIFIED' },
      {
        name: 'Mix Raita',
        price: 290,
        description: 'Boondi, Pineapple, Onion, Cucumber, Mint',
        status: 'VERIFIED',
      },
    ],
  },

  {
    id: 'fish-seafood-appetizers',
    group: 'FOOD',
    name: 'Fish & Seafood Appetizers',
    items: [
      { name: 'Kali Mirch Fish Tikka', price: 490, status: 'VERIFIED' },
      { name: 'Amritsari Machhi', price: 460, status: 'VERIFIED' },
      { name: 'Tandoori Prawns', price: 690, status: 'VERIFIED' },
      { name: 'Tandoori Tiger Prawns', price: 890, status: 'VERIFIED' },
      { name: 'Tandoori Pomfret', price: 990, status: 'VERIFIED' },
      { name: 'Tandoori Non-Veg Platter', price: 1690, status: 'VERIFIED' },
    ],
  },

  {
    id: 'tandoori-vegetarian',
    group: 'FOOD',
    name: 'Tandoori Appetizers — Vegetarian',
    items: [
      { name: 'Crispy Hara Bhara Kebab', price: 390, status: 'VERIFIED' },
      { name: 'Paneer Tikka', price: 490, status: 'VERIFIED' },
      { name: 'Cheese Malai Paneer Tikka', price: 490, status: 'VERIFIED' },
      { name: 'Hyderabadi Paneer Tikka', price: 490, status: 'VERIFIED' },
      { name: 'Stuffed Mushroom', price: 460, status: 'VERIFIED' },
      { name: 'Masala French Fries', price: 320, status: 'VERIFIED' },
      { name: 'Cheese Malai Broccoli', price: 390, status: 'VERIFIED' },
      {
        name: 'Masala Corn Basket',
        price: 490,
        status: 'NEEDS_CONFIRMATION',
        note: 'Printed item is crossed/edited. Final dish name needs client confirmation.',
      },
      { name: 'Aloo Nazakat', price: 390, status: 'VERIFIED' },
      { name: 'Bhindi Kurkure', price: 290, status: 'VERIFIED' },
      { name: 'Crispy Aloo Corn Tikki', price: 390, status: 'VERIFIED' },
      { name: 'Tandoori Veg Platter', price: 1490, status: 'VERIFIED' },
    ],
  },

  {
    id: 'tandoori-chicken',
    group: 'FOOD',
    name: 'Tandoori Appetizers — Chicken',
    items: [
      { name: 'Murgh Tikka', price: 480, status: 'VERIFIED' },
      { name: 'Banjara Kebab', price: 540, status: 'VERIFIED' },
      { name: 'Murgh Malai Cheese Tikka', price: 540, status: 'VERIFIED' },
      { name: 'Murgh Seekh Kebab', price: 490, status: 'VERIFIED' },
      { name: 'Murgh Reshmi Kebab', price: 540, status: 'VERIFIED' },
      { name: 'Murgh Gilafi Kebab', price: 560, status: 'VERIFIED' },
      { name: 'Murgh Tangdi', price: 590, status: 'VERIFIED' },
      {
        name: 'Tandoori Chicken',
        variants: [
          { name: 'Half', price: 690 },
          { name: 'Full', price: 1290 },
        ],
        status: 'VERIFIED',
      },
      {
        name: 'Murgh Samba Kebab',
        price: 490,
        status: 'NEEDS_CONFIRMATION',
        note: 'Dish spelling needs client confirmation.',
      },
    ],
  },

  {
    id: 'tandoori-mutton',
    group: 'FOOD',
    name: 'Tandoori Appetizers — Mutton',
    items: [
      { name: 'Mutton Seekh Kebab', price: 590, status: 'VERIFIED' },
      { name: 'Mutton Pudina Seekh Kebab', price: 590, status: 'VERIFIED' },
      {
        name: 'Gilafi Kebab',
        price: 590,
        status: 'NEEDS_CONFIRMATION',
        note: 'Printed dish name was crossed out and replaced by unclear handwriting.',
      },
      { name: 'Mutton Boti Tikka', price: 560, status: 'VERIFIED' },
    ],
  },

  {
    id: 'rice-biryani',
    group: 'FOOD',
    name: 'Rice & Biryani',
    items: [
      { name: 'Sada Chawal (Basmati Steam Rice)', price: 260, status: 'VERIFIED' },
      { name: 'Jeera Rice', price: 290, status: 'VERIFIED' },
      {
        name: 'Matar Pulao',
        price: 290,
        status: 'NEEDS_CONFIRMATION',
        note: 'Printed/handwritten wording needs client confirmation.',
      },
      { name: 'Kashmiri Pulao', price: 340, status: 'VERIFIED' },
      { name: 'N.T Biryani', price: 590, status: 'VERIFIED' },
      { name: 'Chicken Dum Biryani', price: 690, status: 'VERIFIED' },
      { name: 'Chicken Hyderabadi Biryani', price: 740, status: 'VERIFIED' },
      { name: 'Mutton Dum Biryani', price: 790, status: 'VERIFIED' },
      { name: 'Mutton Hyderabadi Biryani', price: 790, status: 'VERIFIED' },
      { name: 'Prawns Biryani', price: 990, status: 'VERIFIED' },
      { name: 'Paneer Biryani', price: 690, status: 'VERIFIED' },
    ],
  },

  {
    id: 'chinese-appetizers',
    group: 'FOOD',
    name: 'Chinese Appetizers',
    items: [
      {
        name: 'Spring Roll',
        variants: [
          { name: 'Veg', price: 390 },
          { name: 'Non-Veg', price: 490 },
        ],
        status: 'VERIFIED',
      },
      {
        name: 'Honey Potato Chilli Potato',
        price: 390,
        status: 'NEEDS_CONFIRMATION',
        note: 'Printed dish wording needs confirmation.',
      },
      {
        name: 'Chicken Wings',
        price: 480,
        status: 'NEEDS_CONFIRMATION',
        note: 'Dish name has handwritten correction.',
      },
      { name: 'Crispy Corn', price: 390, status: 'VERIFIED' },
      { name: 'Crispy Fried Fish', price: 490, status: 'VERIFIED' },
      { name: 'Soya Garlic Prawns', price: 790, status: 'VERIFIED' },
      {
        name: 'Lemon Chicken',
        price: null,
        status: 'DISABLED',
        note: 'Dish is crossed out on the client menu.',
      },
      { name: 'Chicken Lollipop', price: 420, status: 'VERIFIED' },
      {
        name: 'Manchurian',
        variants: [
          { name: 'Veg', price: 420 },
          { name: 'Non-Veg', price: 520 },
        ],
        status: 'VERIFIED',
      },
      { name: 'Chinese Platter (Non-Veg)', price: 1390, status: 'VERIFIED' },
      { name: 'Special Veg Platter', price: 1190, status: 'VERIFIED' },
    ],
  },

  {
    id: 'momos',
    group: 'FOOD',
    name: 'Momos',
    items: [
      {
        name: 'Veg Momo',
        variants: [
          { name: 'Steam', price: 290 },
          { name: 'Kothey', price: 320 },
          { name: 'Jhol', price: 340 },
        ],
        status: 'NEEDS_CONFIRMATION',
        note: 'Jhol heading appears handwritten and needs confirmation.',
      },
      {
        name: 'Chicken Momo',
        variants: [
          { name: 'Steam', price: 320 },
          { name: 'Kothey', price: 340 },
          { name: 'Jhol', price: 380 },
        ],
        status: 'NEEDS_CONFIRMATION',
      },
      {
        name: 'Mutton Momo',
        variants: [
          { name: 'Steam', price: 390 },
          { name: 'Kothey', price: 420 },
          { name: 'Jhol', price: 440 },
        ],
        status: 'NEEDS_CONFIRMATION',
      },
    ],
  },

  {
    id: 'chilli',
    group: 'FOOD',
    name: 'Chilli',
    items: [
      {
        name: 'Mix Veg',
        price: null,
        status: 'DISABLED',
        note: 'Dish and price are crossed out.',
      },
      { name: 'Paneer Chilli', price: 490, status: 'VERIFIED' },
      { name: 'Chips', price: 390, status: 'VERIFIED' },
      { name: 'Chicken Chilli', price: 490, status: 'VERIFIED' },
      { name: 'Mutton Chilli', price: 590, status: 'VERIFIED' },
      { name: 'Prawns Chilli', price: 790, status: 'VERIFIED' },
      { name: 'Mushroom Chilli', price: 440, status: 'VERIFIED' },
    ],
  },

  {
    id: 'fried-rice',
    group: 'FOOD',
    name: 'Fried Rice',
    items: [
      { name: 'Veg Fried Rice', price: 390, status: 'VERIFIED' },
      { name: 'Chicken Fried Rice', price: 490, status: 'VERIFIED' },
      { name: 'Mutton Fried Rice', price: 540, status: 'VERIFIED' },
      { name: 'Prawns Fried Rice', price: 690, status: 'VERIFIED' },
      { name: 'Mix Non-Veg Fried Rice', price: 710, status: 'VERIFIED' },
    ],
  },

  {
    id: 'hakka-noodles',
    group: 'FOOD',
    name: 'Hakka Noodles',
    items: [
      { name: 'Veg Hakka Noodles', price: 490, status: 'NEEDS_CONFIRMATION' },
      { name: 'Chicken Hakka Noodles', price: 590, status: 'NEEDS_CONFIRMATION' },
      { name: 'Mutton Hakka Noodles', price: 690, status: 'NEEDS_CONFIRMATION' },
      { name: 'Prawns Hakka Noodles', price: 790, status: 'NEEDS_CONFIRMATION' },
      { name: 'Mix Non-Veg Hakka Noodles', price: 890, status: 'NEEDS_CONFIRMATION' },
    ],
  },

  {
    id: 'chicken-curries',
    group: 'FOOD',
    name: 'Curries — Chicken',
    items: [
      { name: 'Butter Chicken', price: 590, status: 'VERIFIED' },
      { name: 'Chicken Tikka Masala', price: 580, status: 'VERIFIED' },
      { name: 'Kadhai Chicken', price: 560, status: 'VERIFIED' },
      { name: 'Chicken Mughlai', price: 590, status: 'VERIFIED' },
      {
        name: 'Punjabi Murgh',
        price: 540,
        status: 'NEEDS_CONFIRMATION',
        note: 'Printed wording contains handwritten correction.',
      },
    ],
  },

  {
    id: 'mutton-curries',
    group: 'FOOD',
    name: 'Curries — Mutton',
    items: [
      { name: 'Mutton Saag', price: 660, status: 'VERIFIED' },
      { name: 'Mutton Rogan Josh', price: 690, status: 'VERIFIED' },
      { name: 'Bhuna Gosht', price: 680, status: 'VERIFIED' },
      { name: 'Mutton Rara', price: 690, status: 'VERIFIED' },
    ],
  },

  {
    id: 'fish-seafood-curries',
    group: 'FOOD',
    name: 'Curries — Fish / Seafood',
    items: [
      { name: 'Fish Tikka Masala', price: 590, status: 'VERIFIED' },
      { name: 'Goan Fish Curry', price: 540, status: 'VERIFIED' },
      { name: 'Kadhai Prawns', price: 790, status: 'VERIFIED' },
    ],
  },

  {
    id: 'vegetable-curries',
    group: 'FOOD',
    name: 'Vegetable Curries',
    items: [
      { name: 'Dal Makhani', price: 490, status: 'VERIFIED' },
      { name: 'Lassuni Dal Tadka', price: 390, status: 'VERIFIED' },
      { name: 'Kashmiri Dum Aloo', price: 420, status: 'VERIFIED' },
      { name: 'Kadhai Paneer', price: 590, status: 'VERIFIED' },
      { name: 'Tawa Ki Sabziyan', price: 390, status: 'VERIFIED' },
      { name: 'Paneer Butter Masala', price: 590, status: 'VERIFIED' },
      { name: 'Mutter Mushroom', price: 490, status: 'VERIFIED' },
      { name: 'Mix Veg Curry', price: 390, status: 'VERIFIED' },
      { name: 'Paneer Tikka Masala', price: 590, status: 'VERIFIED' },
      { name: 'Corn Chatpata Palak', price: 460, status: 'VERIFIED' },
    ],
  },

  {
    id: 'paneer-specialties',
    group: 'FOOD',
    name: 'Paneer Specialties',
    items: [
      { name: 'Palak Paneer', price: 590, status: 'VERIFIED' },
      { name: 'Kadhai Gobi Masala', price: 440, status: 'VERIFIED' },
      { name: 'Mullayam Methi Chaman', price: 590, status: 'VERIFIED' },
      { name: 'Paneer Burji', price: 560, status: 'VERIFIED' },
      { name: 'Aloo Jeera', price: 290, status: 'VERIFIED' },
      {
        name: 'Kofta',
        price: 890,
        status: 'NEEDS_CONFIRMATION',
        note: 'Printed word before Kofta is crossed out.',
      },
    ],
  },

  {
    id: 'naan-roti',
    group: 'FOOD',
    name: 'Naan / Roti',
    items: [
      { name: 'Tandoori Roti / Tawa Roti', price: 80, status: 'VERIFIED' },
      { name: 'Payaz Mirchi Ki Roti', price: 90, status: 'VERIFIED' },
      { name: 'Missi Roti', price: 110, status: 'VERIFIED' },
      { name: 'Roomali Roti', price: 160, status: 'VERIFIED' },
      { name: 'Laccha Paratha', price: 120, status: 'VERIFIED' },
      { name: 'Mint Paratha', price: 140, status: 'VERIFIED' },
      { name: 'Naan', price: 90, status: 'VERIFIED' },
      { name: 'Butter Naan', price: 140, status: 'VERIFIED' },
      { name: 'Garlic Naan', price: 190, status: 'VERIFIED' },
      { name: 'Peshawari Naan', price: 190, status: 'VERIFIED' },
      { name: 'Cheese Naan', price: 220, status: 'VERIFIED' },
      {
        name: 'Keema Naan',
        variants: [
          { name: 'Mutton', price: 220 },
          { name: 'Chicken', price: 240 },
        ],
        status: 'VERIFIED',
      },
      { name: 'Potato Kulcha', price: 180, status: 'VERIFIED' },
      { name: 'Onion Kulcha', price: 140, status: 'VERIFIED' },
      { name: 'Masala Kulcha', price: 190, status: 'VERIFIED' },
    ],
  },

  {
    id: 'desserts',
    group: 'FOOD',
    name: 'Sweets & Desserts',
    items: [
      { name: 'Kesari Matka Kulfi', price: 340, status: 'VERIFIED' },
      { name: 'Gulab Jamun', price: 290, status: 'VERIFIED' },
      { name: 'Gajar ka Halwa', price: 320, status: 'VERIFIED' },
      { name: 'Ice Cream', price: 220, status: 'VERIFIED' },
    ],
  },

  {
    id: 'kathi-rolls',
    group: 'FOOD',
    name: 'Kathi Rolls',
    items: [
      { name: 'Mix Veg Roll', price: 340, status: 'VERIFIED' },
      { name: 'Paneer Roll', price: 480, status: 'VERIFIED' },
      { name: 'Egg Roll', price: 340, status: 'VERIFIED' },
      { name: 'Chicken Roll', price: 390, status: 'VERIFIED' },
      { name: 'Egg Chicken Roll', price: 460, status: 'VERIFIED' },
      { name: 'Mutton Roll', price: 520, status: 'VERIFIED' },
      { name: 'Fish Roll', price: 390, status: 'VERIFIED' },
      {
        name: "SIP Roll 'Harmony' Special",
        price: 890,
        status: 'VERIFIED',
        note: 'SIP spelling preserved from client menu.',
      },
    ],
  },

  // =====================================================
  // BEVERAGES
  // =====================================================

  {
    id: 'coffee',
    group: 'BEVERAGES',
    name: 'Coffee',
    items: [
      {
        name: 'Espresso',
        variants: [
          { name: 'Option 1', price: 110 },
          { name: 'Option 2', price: 140 },
        ],
        status: 'NEEDS_CONFIRMATION',
        note: 'Two prices are visible but variant labels are not clear.',
      },
      {
        name: 'Americano',
        variants: [
          { name: 'Option 1', price: 190 },
          { name: 'Option 2', price: 220 },
        ],
        status: 'NEEDS_CONFIRMATION',
      },
      { name: 'Espresso Macchiato', price: 210, status: 'VERIFIED' },
      { name: 'Espresso Affogato', price: 250, status: 'VERIFIED' },
      { name: 'Cortado', price: 220, status: 'VERIFIED' },
      { name: 'Flat White', price: 230, status: 'VERIFIED' },
      {
        name: 'Cappuccino',
        variants: [
          { name: 'Option 1', price: 230 },
          { name: 'Option 2', price: 250 },
        ],
        status: 'NEEDS_CONFIRMATION',
      },
      {
        name: 'Café Latte',
        variants: [
          { name: 'Option 1', price: 220 },
          { name: 'Option 2', price: 240 },
        ],
        status: 'NEEDS_CONFIRMATION',
      },
      {
        name: 'Spanish Latte',
        variants: [
          { name: 'Option 1', price: 240 },
          { name: 'Option 2', price: 260 },
        ],
        status: 'NEEDS_CONFIRMATION',
      },
      {
        name: 'Rose Latte',
        variants: [
          { name: 'Option 1', price: 240 },
          { name: 'Option 2', price: 260 },
        ],
        status: 'NEEDS_CONFIRMATION',
      },
      {
        name: 'Caramel Latte',
        variants: [
          { name: 'Option 1', price: 240 },
          { name: 'Option 2', price: 260 },
        ],
        status: 'NEEDS_CONFIRMATION',
      },
      {
        name: 'Caffè Mocha',
        variants: [
          { name: 'Option 1', price: 240 },
          { name: 'Option 2', price: 260 },
        ],
        status: 'NEEDS_CONFIRMATION',
      },
      {
        name: 'Saffron Latte',
        variants: [
          { name: 'Option 1', price: 260 },
          { name: 'Option 2', price: 290 },
        ],
        status: 'NEEDS_CONFIRMATION',
      },
      {
        name: 'V60 (Pour Over)',
        variants: [
          { name: 'Option 1', price: 210 },
          { name: 'Option 2', price: 240 },
        ],
        status: 'NEEDS_CONFIRMATION',
      },
    ],
  },

  {
    id: 'tea-flavours',
    group: 'BEVERAGES',
    name: 'Tea & Flavours',
    items: [
      { name: 'Tea (Black / Green)', price: 60, status: 'VERIFIED' },
      { name: 'Masala Tea', price: 90, status: 'VERIFIED' },
      { name: 'Flavoured Ice Tea', price: 160, status: 'VERIFIED' },
      { name: 'Hot Chocolate', price: 210, status: 'VERIFIED' },
      { name: 'Hot Lemon Honey & Ginger', price: 150, status: 'VERIFIED' },
      { name: 'Lemon Ice Tea', price: 140, status: 'VERIFIED' },
    ],
  },

  {
    id: 'soft-drinks',
    group: 'BEVERAGES',
    name: 'Soft Drinks',
    items: [
      { name: 'Coke', price: 140, status: 'VERIFIED' },
      { name: 'Coke Zero', price: 140, status: 'VERIFIED' },
      { name: 'Sprite', price: 140, status: 'VERIFIED' },
      { name: 'Fanta', price: 140, status: 'VERIFIED' },
      { name: 'Fresh Lime Soda', price: 160, status: 'VERIFIED' },
      { name: 'Tonic Water', price: 160, status: 'VERIFIED' },
      { name: 'Ginger Ale', price: 190, status: 'VERIFIED' },
      { name: 'Red Bull', price: 190, status: 'VERIFIED' },
      { name: 'Soda Water', price: 120, status: 'VERIFIED' },
    ],
  },

  {
    id: 'fresh-juice',
    group: 'BEVERAGES',
    name: 'Fresh Juice',
    items: [
      { name: 'Seasonal Fresh Juice', price: 220, status: 'VERIFIED' },
      { name: 'Lime Juice (Sweet / Salt)', price: 120, status: 'VERIFIED' },
      { name: 'Mint Lemonade', price: 150, status: 'VERIFIED' },
    ],
  },

  {
    id: 'smoothies-lassi-shakes',
    group: 'BEVERAGES',
    name: 'Smoothies, Lassi & Shakes',
    items: [
      { name: 'Seasonal Fresh Smoothie', price: 260, status: 'VERIFIED' },
      { name: 'Lassi (Sweet / Salted)', price: 140, status: 'VERIFIED' },
      { name: 'Mango Lassi', price: 160, status: 'VERIFIED' },
      { name: 'Strawberry Lassi', price: 160, status: 'VERIFIED' },
      {
        name: 'Shakes (Chocolate / Vanilla / Strawberry)',
        price: 150,
        status: 'VERIFIED',
      },
    ],
  },

  {
    id: 'mojito',
    group: 'BEVERAGES',
    name: 'Mojito',
    items: [
      { name: 'Virgin Mojito', price: 210, status: 'VERIFIED' },
      { name: 'Strawberry Mojito', price: 230, status: 'VERIFIED' },
      { name: 'Mix Berries Mojito', price: 230, status: 'VERIFIED' },
      { name: 'Passion Fruit Mojito', price: 240, status: 'VERIFIED' },
      { name: 'Watermelon Mojito', price: 230, status: 'VERIFIED' },
      { name: 'Spicy Mojito', price: 260, status: 'VERIFIED' },
    ],
  },

  {
    id: 'water',
    group: 'BEVERAGES',
    name: 'Water',
    items: [
      { name: 'Mineral Water', price: 120, status: 'VERIFIED' },
      { name: 'Perrier (Spring Water)', price: 120, status: 'VERIFIED' },
    ],
  },

  // =====================================================
  // BAR
  // =====================================================

  {
    id: 'domestic-scotch-whisky',
    group: 'BAR',
    name: 'Domestic Scotch Whisky',
    items: [
      {
        name: 'Old Durbar Regular',
        variants: [
          { name: '30ml', price: 195 },
          { name: 'Bottle', price: 4750 },
        ],
        status: 'VERIFIED',
      },
      {
        name: 'Old Durbar Black Chimney',
        variants: [
          { name: '30ml', price: 256 },
          { name: 'Bottle', price: 6320 },
        ],
        status: 'VERIFIED',
      },
      {
        name: 'Signature Rare',
        variants: [
          { name: '30ml', price: 165 },
          { name: 'Bottle', price: 3970 },
        ],
        status: 'VERIFIED',
      },
      {
        name: 'Blenders Pride',
        variants: [
          { name: '30ml', price: 165 },
          { name: 'Bottle', price: 3970 },
        ],
        status: 'VERIFIED',
      },
      {
        name: "Director's Special",
        variants: [
          { name: '30ml', price: 165 },
          { name: 'Bottle', price: 3970 },
        ],
        status: 'VERIFIED',
      },
    ],
  },

  {
    id: 'imported-scotch-whisky',
    group: 'BAR',
    name: 'Imported Scotch Whisky',
    items: [
      {
        name: "Dewar's 12 Years",
        variants: [
          { name: '30ml', price: 380 },
          { name: 'Bottle', price: 12450 },
        ],
        status: 'VERIFIED',
      },
      {
        name: 'JW Black Label',
        variants: [
          { name: '30ml', price: 415 },
          { name: 'Bottle', price: 13600 },
        ],
        status: 'VERIFIED',
      },
      {
        name: 'JW Double Black',
        variants: [
          { name: '30ml', price: 515 },
          { name: 'Bottle', price: 17000 },
        ],
        status: 'VERIFIED',
      },
      {
        name: 'Chivas Regal 12 Yrs',
        variants: [
          { name: '30ml', price: 430 },
          { name: 'Bottle', price: 14010 },
        ],
        status: 'VERIFIED',
      },
      {
        name: "Dewar's White Label",
        variants: [
          { name: '30ml', price: 280 },
          { name: 'Bottle', price: 9150 },
        ],
        status: 'VERIFIED',
      },
      {
        name: "Teacher's",
        variants: [
          { name: '30ml', price: 310 },
          { name: 'Bottle', price: 10150 },
        ],
        status: 'VERIFIED',
      },
    ],
  },

  {
    id: 'single-malt-whisky',
    group: 'BAR',
    name: 'Single Malt Whisky',
    items: [
      {
        name: 'Aberfeldy 12 Yrs',
        variants: [
          { name: '30ml', price: 840 },
          { name: 'Bottle', price: 22750 },
        ],
        status: 'VERIFIED',
      },
      {
        name: 'Glenfiddich 12 Yrs',
        variants: [
          { name: '30ml', price: 745 },
          { name: 'Bottle', price: 24550 },
        ],
        status: 'VERIFIED',
      },
    ],
  },

  {
    id: 'domestic-vodka',
    group: 'BAR',
    name: 'Domestic Vodka',
    items: [
      {
        name: '8848',
        variants: [
          { name: '30ml', price: 150 },
          { name: 'Bottle', price: 3710 },
        ],
        status: 'VERIFIED',
      },
      {
        name: 'Romanov',
        variants: [
          { name: '30ml', price: 155 },
          { name: 'Bottle', price: 3750 },
        ],
        status: 'VERIFIED',
      },
    ],
  },

  {
    id: 'imported-vodka',
    group: 'BAR',
    name: 'Imported Vodka',
    items: [
      {
        name: 'Grey Goose',
        variants: [
          { name: '30ml', price: 580 },
          { name: 'Bottle', price: 19000 },
        ],
        status: 'VERIFIED',
      },
      {
        name: 'Absolute',
        variants: [
          { name: '30ml', price: 315 },
          { name: 'Bottle', price: 10250 },
        ],
        status: 'VERIFIED',
      },
    ],
  },

  {
    id: 'domestic-gin',
    group: 'BAR',
    name: 'Domestic Gin',
    items: [
      {
        name: 'Snowman',
        variants: [
          { name: '30ml', price: 165 },
          { name: 'Bottle', price: 3970 },
        ],
        status: 'VERIFIED',
      },
      {
        name: 'Pathane Gin',
        variants: [
          { name: '30ml', price: 165 },
          { name: 'Bottle', price: 3970 },
        ],
        status: 'VERIFIED',
      },
      {
        name: 'Blue Riband',
        variants: [
          { name: '30ml', price: 165 },
          { name: 'Bottle', price: 3970 },
        ],
        status: 'VERIFIED',
      },
    ],
  },

  {
    id: 'imported-gin',
    group: 'BAR',
    name: 'Imported Gin',
    items: [
      {
        name: 'Bombay Sapphire',
        variants: [
          { name: '30ml', price: 510 },
          { name: 'Bottle', price: 16700 },
        ],
        status: 'VERIFIED',
      },
      {
        name: 'Beefeater (London Dry)',
        variants: [
          { name: '30ml', price: 325 },
          { name: 'Bottle', price: 10500 },
        ],
        status: 'VERIFIED',
      },
    ],
  },

  {
    id: 'rum',
    group: 'BAR',
    name: 'Rum',
    items: [
      {
        name: 'Bacardi',
        variants: [
          { name: '30ml', price: 360 },
          { name: 'Bottle', price: 11650 },
        ],
        status: 'VERIFIED',
      },
      {
        name: 'Khukri Spice Rum',
        variants: [
          { name: '30ml', price: 340 },
          { name: 'Bottle', price: 9900 },
        ],
        status: 'VERIFIED',
      },
      {
        name: 'Captain Morgan',
        variants: [
          { name: '30ml', price: 340 },
          { name: 'Bottle', price: 9900 },
        ],
        status: 'VERIFIED',
      },
    ],
  },

  {
    id: 'tequila',
    group: 'BAR',
    name: 'Tequila',
    items: [
      {
        name: 'Payton',
        variants: [
          { name: '30ml', price: 840 },
          { name: 'Bottle', price: 27950 },
        ],
        status: 'NEEDS_CONFIRMATION',
        note: 'Brand spelling needs confirmation from client.',
      },
      {
        name: 'Camino',
        variants: [
          { name: '30ml', price: 250 },
          { name: 'Bottle', price: 8245 },
        ],
        status: 'VERIFIED',
      },
      {
        name: 'Agavita',
        variants: [
          { name: '30ml', price: 230 },
          { name: 'Bottle', price: 7550 },
        ],
        status: 'VERIFIED',
      },
    ],
  },

  {
    id: 'beer',
    group: 'BAR',
    name: 'Beer',
    items: [
      {
        name: 'Carlsberg',
        variants: [{ name: '330ml', price: 785 }],
        status: 'VERIFIED',
      },
      {
        name: 'Tuborg',
        variants: [{ name: '330ml', price: 680 }],
        status: 'VERIFIED',
      },
      {
        name: 'Kingfisher Premium',
        variants: [{ name: '330ml', price: 625 }],
        status: 'VERIFIED',
      },
      {
        name: 'Budweiser',
        variants: [{ name: '330ml', price: 785 }],
        status: 'VERIFIED',
      },
      {
        name: 'Corona',
        variants: [{ name: '330ml', price: 785 }],
        status: 'VERIFIED',
      },
      {
        name: 'Heineken',
        variants: [{ name: '330ml', price: 785 }],
        status: 'VERIFIED',
      },
    ],
  },

  {
    id: 'wine',
    group: 'BAR',
    name: 'Wine',
    items: [
      {
        name: "Tyrell's",
        status: 'NEEDS_CONFIRMATION',
        note: 'Price is not clearly visible in supplied menu image.',
      },
      {
        name: 'Red Wine Estate',
        status: 'NEEDS_CONFIRMATION',
        note: 'Price is not clearly visible in supplied menu image.',
      },
      {
        name: "Jacob's Creek",
        status: 'NEEDS_CONFIRMATION',
        note: 'Price is not clearly visible in supplied menu image.',
      },
    ],
  },
];