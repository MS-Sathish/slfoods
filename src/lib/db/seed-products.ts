import { ProductCategory, UnitType } from "@/types";

interface ProductSeed {
  name: string;
  category: ProductCategory;
  rate: number;
  unitType: UnitType;
  defaultQuantity: number;
}

export const productSeeds: ProductSeed[] = [
  // Mixture Category
  { name: "Sweet Mixture", category: "mixture", rate: 145, unitType: "kg", defaultQuantity: 1 },
  { name: "Mix Mixture", category: "mixture", rate: 145, unitType: "kg", defaultQuantity: 1 },
  { name: "Lasoon Mixture", category: "mixture", rate: 145, unitType: "kg", defaultQuantity: 1 },
  { name: "Colour Mixture", category: "mixture", rate: 145, unitType: "kg", defaultQuantity: 1 },
  { name: "SP Special Mixture", category: "mixture", rate: 145, unitType: "kg", defaultQuantity: 1 },

  // Bhel Category
  { name: "Karam Bhel", category: "bhel", rate: 145, unitType: "kg", defaultQuantity: 1 },
  { name: "Sweet Bhel", category: "bhel", rate: 145, unitType: "kg", defaultQuantity: 1 },

  // Chevda Category
  { name: "Sadha Chev", category: "chevda", rate: 145, unitType: "kg", defaultQuantity: 1 },
  { name: "Lasoon Chev", category: "chevda", rate: 145, unitType: "kg", defaultQuantity: 1 },
  { name: "Zero Chev", category: "chevda", rate: 145, unitType: "kg", defaultQuantity: 1 },
  { name: "Bounagiri Sadha", category: "chevda", rate: 145, unitType: "kg", defaultQuantity: 1 },
  { name: "Bounagiri Karam", category: "chevda", rate: 145, unitType: "kg", defaultQuantity: 1 },
  { name: "Ghatti", category: "chevda", rate: 145, unitType: "kg", defaultQuantity: 1 },

  // Dhal & Legumes Category
  { name: "Dhaal Mottu", category: "dhal", rate: 145, unitType: "kg", defaultQuantity: 1 },
  { name: "Masala Kallai", category: "dhal", rate: 170, unitType: "kg", defaultQuantity: 1 },
  { name: "Salt Kalai", category: "dhal", rate: 170, unitType: "kg", defaultQuantity: 1 },
  { name: "Pattani (Green)", category: "dhal", rate: 170, unitType: "kg", defaultQuantity: 1 },
  { name: "Kabuli Chenna", category: "dhal", rate: 170, unitType: "kg", defaultQuantity: 1 },
  { name: "Moong Dhal", category: "dhal", rate: 170, unitType: "kg", defaultQuantity: 1 },
  { name: "Chenna Dhal", category: "dhal", rate: 170, unitType: "kg", defaultQuantity: 1 },
  { name: "Gujarat Kalai Salt", category: "dhal", rate: 180, unitType: "kg", defaultQuantity: 1 },

  // Sabudana Category
  { name: "Sabudana Sweet", category: "sabudana", rate: 140, unitType: "kg", defaultQuantity: 1 },
  { name: "Sabudana Karam", category: "sabudana", rate: 140, unitType: "kg", defaultQuantity: 1 },
  { name: "Sabudana Vada Masala", category: "sabudana", rate: 180, unitType: "kg", defaultQuantity: 1 },

  // Chips Category
  { name: "Nendharam Chips CO (Coconut Oil)", category: "chips", rate: 300, unitType: "kg", defaultQuantity: 1 },
  { name: "Nendharam Chips Oil (Ordinary Oil)", category: "chips", rate: 200, unitType: "kg", defaultQuantity: 1 },
  { name: "Nendharam Sweet Chips", category: "chips", rate: 260, unitType: "kg", defaultQuantity: 1 },
  { name: "Kappa Chips Sadha", category: "chips", rate: 180, unitType: "kg", defaultQuantity: 1 },
  { name: "Kappa Chips Special Karam", category: "chips", rate: 180, unitType: "kg", defaultQuantity: 1 },
  { name: "Rathal Stick", category: "chips", rate: 180, unitType: "kg", defaultQuantity: 1 },
  { name: "Karela Chips", category: "chips", rate: 290, unitType: "kg", defaultQuantity: 1 },
  { name: "Pudhina Chips", category: "chips", rate: 180, unitType: "kg", defaultQuantity: 1 },
  { name: "Ginger Chips", category: "chips", rate: 180, unitType: "kg", defaultQuantity: 1 },
  { name: "Potato Challi", category: "chips", rate: 200, unitType: "kg", defaultQuantity: 1 },
  { name: "Potato Chips", category: "chips", rate: 210, unitType: "kg", defaultQuantity: 1 },
  { name: "Banana Chips", category: "chips", rate: 210, unitType: "kg", defaultQuantity: 1 },
  { name: "Jack Fruit", category: "chips", rate: 200, unitType: "kg", defaultQuantity: 1 },
  { name: "Macca (Corn Flakes)", category: "chips", rate: 145, unitType: "kg", defaultQuantity: 1 },
  { name: "Kaala Pottana", category: "chips", rate: 140, unitType: "kg", defaultQuantity: 1 },
  { name: "Peela Pottana", category: "chips", rate: 140, unitType: "kg", defaultQuantity: 1 },
  { name: "Aalu Regam", category: "chips", rate: 210, unitType: "kg", defaultQuantity: 1 },

  // Murukku Category
  { name: "Bhajini Murukku", category: "murukku", rate: 180, unitType: "kg", defaultQuantity: 1 },
  { name: "Bhajini Thukkada Murukku", category: "murukku", rate: 180, unitType: "kg", defaultQuantity: 1 },
  { name: "Thenkullal Murukku (Ordinary)", category: "murukku", rate: 50, unitType: "packet", defaultQuantity: 1 },
  { name: "Thenkullal Murukku (Masala)", category: "murukku", rate: 50, unitType: "packet", defaultQuantity: 1 },
  { name: "Mullu Murukku (Ordinary)", category: "murukku", rate: 50, unitType: "packet", defaultQuantity: 1 },
  { name: "Mullu Murukku (Masala)", category: "murukku", rate: 50, unitType: "packet", defaultQuantity: 1 },
  { name: "Poondu Murukku", category: "murukku", rate: 190, unitType: "kg", defaultQuantity: 1 },
  { name: "Metti Murukku", category: "murukku", rate: 190, unitType: "kg", defaultQuantity: 1 },
  { name: "Namakkal Murukku (Ordinary)", category: "murukku", rate: 190, unitType: "kg", defaultQuantity: 1 },
  { name: "Namakkal Murukku (Masala)", category: "murukku", rate: 190, unitType: "kg", defaultQuantity: 1 },

  // Boondi Category
  { name: "Boondi Salt", category: "boondi", rate: 245, unitType: "kg", defaultQuantity: 1 },
  { name: "Boondi Karam", category: "boondi", rate: 245, unitType: "kg", defaultQuantity: 1 },

  // Papdi & Chakli Category
  { name: "Bhakarwadi Small Size", category: "papdi", rate: 150, unitType: "kg", defaultQuantity: 1 },
  { name: "Bhakarwadi Large Size", category: "papdi", rate: 150, unitType: "kg", defaultQuantity: 1 },
  { name: "Aalu Papdi", category: "papdi", rate: 200, unitType: "kg", defaultQuantity: 1 },
  { name: "Bhelan Papadi", category: "papdi", rate: 270, unitType: "kg", defaultQuantity: 1 },
  { name: "Butter Chakli Masala", category: "papdi", rate: 200, unitType: "kg", defaultQuantity: 1 },
  { name: "Butter Chakli Sadha", category: "papdi", rate: 200, unitType: "kg", defaultQuantity: 1 },
  { name: "Butter Chakli Palak", category: "papdi", rate: 200, unitType: "kg", defaultQuantity: 1 },

  // Sweets Category
  { name: "Shankarpalle", category: "sweets", rate: 150, unitType: "kg", defaultQuantity: 1 },
  { name: "Soan Pappadi", category: "sweets", rate: 2800, unitType: "box", defaultQuantity: 1 },
  { name: "Halwa", category: "sweets", rate: 200, unitType: "kg", defaultQuantity: 1 },

  // Biscuits Category
  { name: "Biscuit Coconut", category: "biscuits", rate: 300, unitType: "kg", defaultQuantity: 1 },
  { name: "Biscuit Chocolate", category: "biscuits", rate: 300, unitType: "kg", defaultQuantity: 1 },

  // Others Category
  { name: "Cheese Ball", category: "others", rate: 230, unitType: "kg", defaultQuantity: 1 },
  { name: "Namuda", category: "others", rate: 180, unitType: "kg", defaultQuantity: 1 },
  { name: "Mayora", category: "others", rate: 180, unitType: "kg", defaultQuantity: 1 },
  { name: "White Chingudra Noodles", category: "others", rate: 170, unitType: "kg", defaultQuantity: 1 },
  { name: "Meggie Masala", category: "others", rate: 180, unitType: "kg", defaultQuantity: 1 },
  { name: "Meggie Sadha", category: "others", rate: 180, unitType: "kg", defaultQuantity: 1 },
  { name: "Stick Chutni Soya", category: "others", rate: 230, unitType: "kg", defaultQuantity: 1 },
  { name: "Stick Chutni Tomato", category: "others", rate: 230, unitType: "kg", defaultQuantity: 1 },
  { name: "Stick Chutni Schezwan", category: "others", rate: 230, unitType: "kg", defaultQuantity: 1 },
  { name: "Anu Stick", category: "others", rate: 275, unitType: "kg", defaultQuantity: 1 },
  { name: "Potato Chali", category: "others", rate: 250, unitType: "kg", defaultQuantity: 1 },
  { name: "Lollipop", category: "others", rate: 200, unitType: "kg", defaultQuantity: 1 },
];
