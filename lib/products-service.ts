"use client"

import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, query, orderBy, onSnapshot, type DocumentData } from "firebase/firestore"
import { db } from "./firebase"
import type { Product } from "./types"

const PRODUCTS_COLLECTION = "products"

// Get all products
export async function getProducts(): Promise<Product[]> {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION)
    const q = query(productsRef, orderBy("name"))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as Product[]
  } catch (error) {
    console.error("Error fetching products:", error)
    return []
  }
}

// Get a single product by ID
export async function getProductById(id: string): Promise<Product | null> {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, id)
    const productSnap = await getDoc(productRef)
    if (productSnap.exists()) {
      return {
        id: productSnap.id,
        ...productSnap.data(),
        createdAt: productSnap.data().createdAt?.toDate() || new Date(),
      } as Product
    }
    return null
  } catch (error) {
    console.error("Error fetching product:", error)
    return null
  }
}

// Create or update a product
export async function saveProduct(product: Product): Promise<void> {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, product.id)
    // Remove undefined values as Firestore doesn't support them
    const productData: any = {
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      subcategory: product.subcategory,
      rating: product.rating,
      reviews: product.reviews,
      inStock: product.inStock,
      description: product.description,
      images: product.images || [],
      createdAt: product.createdAt || new Date(),
    }
    
    // Only include optional fields if they have valid values (not undefined)
    if (product.originalPrice !== undefined && product.originalPrice !== null) {
      productData.originalPrice = product.originalPrice
    }
    if (product.size !== undefined && product.size !== null && Array.isArray(product.size) && product.size.length > 0) {
      productData.size = product.size
    }
    if (product.colors !== undefined && product.colors !== null && Array.isArray(product.colors) && product.colors.length > 0) {
      productData.colors = product.colors
    }
    
    // Remove any undefined values that might have slipped through
    Object.keys(productData).forEach(key => {
      if (productData[key] === undefined) {
        delete productData[key]
      }
    })
    
    await setDoc(productRef, productData, { merge: true })
  } catch (error) {
    console.error("Error saving product:", error)
    throw error
  }
}

// Delete a product
export async function deleteProduct(id: string): Promise<void> {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, id)
    await deleteDoc(productRef)
  } catch (error) {
    console.error("Error deleting product:", error)
    throw error
  }
}

// Subscribe to products changes (real-time)
export function subscribeToProducts(callback: (products: Product[]) => void): () => void {
  const productsRef = collection(db, PRODUCTS_COLLECTION)
  const q = query(productsRef, orderBy("name"))
  
  return onSnapshot(q, (snapshot) => {
    const products = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as Product[]
    callback(products)
  })
}

// Initialize products data (run once to seed Firestore)
// This function no longer seeds demo data - products must be added manually through admin panel
export async function initializeProducts(): Promise<void> {
  // Check if products exist, but don't seed any demo data
  const existingProducts = await getProducts()
  if (existingProducts.length > 0) {
    // Products exist, nothing to do
    return
  }
  // No products exist - admin can add products through the admin panel
}
