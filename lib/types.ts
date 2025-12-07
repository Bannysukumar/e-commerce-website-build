export type Product = {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  category: string
  subcategory: string
  gender?: "GIRLS" | "BOYS" | ""
  rating: number
  reviews: number
  inStock: boolean
  description: string
  images: string[]
  size?: string[]
  colors?: string[]
}

export type CartItem = {
  productId: string
  quantity: number
  selectedSize?: string
  selectedColor?: string
}

export type User = {
  id: string
  email: string
  name: string
  createdAt: Date
}
