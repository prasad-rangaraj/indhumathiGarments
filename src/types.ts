export interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    description: string;
    material: string;
    sizes: string[];
    category: string;
    subcategory: string;
    inStock?: boolean;
    stock?: number;
    isActive?: boolean;
}
