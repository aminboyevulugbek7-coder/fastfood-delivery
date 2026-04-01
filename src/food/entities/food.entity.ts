/**
 * Food Entity - represents a food item in the catalog
 */
export interface Food {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  imageUrl?: string;
  available: boolean;
  stock: number;
  createdAt: number;
  updatedAt: number;
}
