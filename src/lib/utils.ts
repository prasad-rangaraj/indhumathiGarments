import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function resolveItemImage(item: any): string | null {
  if (!item) return null;

  // 1. Try to resolve based on selectedColor if we have the colors data
  const productColors = item.product?.colors || item.colors;
  const colorToMatch = item.selectedColor || item.color || item.wishlistColor;
  if (colorToMatch && Array.isArray(productColors)) {
    const colorObj = productColors.find((c: any) => c.name === colorToMatch);
    if (colorObj) {
      if (colorObj.primaryImage) return colorObj.primaryImage;
      if (colorObj.images && colorObj.images.length > 1) return colorObj.images[1];
      if (colorObj.images && colorObj.images.length > 0) return colorObj.images[0];
    }
  }

  // 2. Use the dynamically resolved image if available (from cart)
  if (item.image) return item.image;

  // 3. Fallback to product images array
  const productImages = item.product?.images || item.images;
  if (productImages && productImages.length > 1) return productImages[1];
  if (productImages && productImages.length > 0) return productImages[0];

  // 4. Ultimate fallback to single product image
  return item.product?.image || null;
}
