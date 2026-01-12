/**
 * Mock product data with stock status
 * Used until real API endpoints are available
 */

export interface MockProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  vendorId: string;
  vendorName: string;
  inStock: boolean;
  stockQuantity: number;
}

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: "prod_001",
    name: "Fresh Tomatoes (1kg)",
    description: "Locally grown fresh tomatoes",
    price: 25.00,
    image: "🍅",
    category: "Vegetables",
    vendorId: "vendor_001",
    vendorName: "Fresh Mart",
    inStock: true,
    stockQuantity: 50,
  },
  {
    id: "prod_002",
    name: "White Bread",
    description: "Freshly baked white bread",
    price: 12.50,
    image: "🍞",
    category: "Bakery",
    vendorId: "vendor_002",
    vendorName: "City Bakery",
    inStock: true,
    stockQuantity: 30,
  },
  {
    id: "prod_003",
    name: "Fresh Milk (1L)",
    description: "Farm fresh milk",
    price: 18.00,
    image: "🥛",
    category: "Dairy",
    vendorId: "vendor_001",
    vendorName: "Fresh Mart",
    inStock: false,
    stockQuantity: 0,
  },
  {
    id: "prod_004",
    name: "Chicken Breast (1kg)",
    description: "Premium chicken breast",
    price: 65.00,
    image: "🍗",
    category: "Meat",
    vendorId: "vendor_003",
    vendorName: "Butcher's Choice",
    inStock: true,
    stockQuantity: 15,
  },
  {
    id: "prod_005",
    name: "Rice (5kg)",
    description: "Premium white rice",
    price: 85.00,
    image: "🍚",
    category: "Grains",
    vendorId: "vendor_001",
    vendorName: "Fresh Mart",
    inStock: true,
    stockQuantity: 25,
  },
  {
    id: "prod_006",
    name: "Cooking Oil (2L)",
    description: "Pure vegetable cooking oil",
    price: 45.00,
    image: "🫗",
    category: "Pantry",
    vendorId: "vendor_001",
    vendorName: "Fresh Mart",
    inStock: false,
    stockQuantity: 0,
  },
  {
    id: "prod_007",
    name: "Eggs (Tray of 30)",
    description: "Fresh farm eggs",
    price: 55.00,
    image: "🥚",
    category: "Dairy",
    vendorId: "vendor_001",
    vendorName: "Fresh Mart",
    inStock: true,
    stockQuantity: 20,
  },
  {
    id: "prod_008",
    name: "Bananas (1 bunch)",
    description: "Sweet ripe bananas",
    price: 15.00,
    image: "🍌",
    category: "Fruits",
    vendorId: "vendor_001",
    vendorName: "Fresh Mart",
    inStock: true,
    stockQuantity: 40,
  },
  {
    id: "prod_009",
    name: "Sugar (2kg)",
    description: "White granulated sugar",
    price: 35.00,
    image: "🧂",
    category: "Pantry",
    vendorId: "vendor_001",
    vendorName: "Fresh Mart",
    inStock: false,
    stockQuantity: 0,
  },
  {
    id: "prod_010",
    name: "Onions (1kg)",
    description: "Fresh red onions",
    price: 20.00,
    image: "🧅",
    category: "Vegetables",
    vendorId: "vendor_001",
    vendorName: "Fresh Mart",
    inStock: true,
    stockQuantity: 35,
  },
];

/**
 * Filter products by stock status
 * Implements blueprint requirement: "Only show items marked as 'In Stock'"
 */
export function getInStockProducts(): MockProduct[] {
  return MOCK_PRODUCTS.filter((product) => product.inStock);
}

/**
 * Get products by category (in stock only)
 */
export function getProductsByCategory(category: string): MockProduct[] {
  return MOCK_PRODUCTS.filter(
    (product) => product.category === category && product.inStock
  );
}

/**
 * Get products by vendor (in stock only)
 */
export function getProductsByVendor(vendorId: string): MockProduct[] {
  return MOCK_PRODUCTS.filter(
    (product) => product.vendorId === vendorId && product.inStock
  );
}

/**
 * Search products by name (in stock only)
 */
export function searchProducts(query: string): MockProduct[] {
  const lowerQuery = query.toLowerCase();
  return MOCK_PRODUCTS.filter(
    (product) =>
      product.inStock &&
      (product.name.toLowerCase().includes(lowerQuery) ||
        product.description.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get all unique categories
 */
export function getCategories(): string[] {
  const categories = new Set(MOCK_PRODUCTS.map((p) => p.category));
  return Array.from(categories).sort();
}

/**
 * Get product by ID (including out of stock)
 */
export function getProductById(id: string): MockProduct | undefined {
  return MOCK_PRODUCTS.find((product) => product.id === id);
}
