/**
 * Category Entity - represents a food category
 */
export interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  order: number;
  active: boolean;
  createdAt: number;
  updatedAt: number;
}
