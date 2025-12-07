import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore"
import { db } from "./firebase"

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  order: number
  isActive: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

const COLLECTION_NAME = "categories"

// Initialize default categories
const defaultCategories = [
  { name: "JEWELLERY", slug: "jewellery" },
  { name: "GIFTS", slug: "gifts" },
  { name: "NEW", slug: "new" },
  { name: "SHADES", slug: "shades" },
  { name: "SCARVES", slug: "scarves" },
  { name: "HATS", slug: "hats" },
  { name: "WATCHES", slug: "watches" },
  { name: "BELTS", slug: "belts" },
  { name: "HAIRWEAR", slug: "hairwear" },
  { name: "CURATED COMBOS", slug: "curated-combos" },
  { name: "BAGS & BAG ACCESSORIES", slug: "bags" },
  { name: "GIRLS", slug: "girls" },
  { name: "BOYS", slug: "boys" },
]

export async function initializeCategories(): Promise<void> {
  try {
    const snapshot = await getDocs(collection(db, COLLECTION_NAME))
    if (snapshot.empty) {
      // Add default categories
      const now = Timestamp.now()
      for (let i = 0; i < defaultCategories.length; i++) {
        const category = defaultCategories[i]
        const categoryRef = doc(collection(db, COLLECTION_NAME))
        await setDoc(categoryRef, {
          name: category.name,
          slug: category.slug,
          order: i,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        })
      }
    }
  } catch (error) {
    console.error("Error initializing categories:", error)
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy("order", "asc"))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Category[]
  } catch (error) {
    console.error("Error fetching categories:", error)
    return []
  }
}

export function subscribeToCategories(callback: (categories: Category[]) => void) {
  const q = query(collection(db, COLLECTION_NAME), orderBy("order", "asc"))
  return onSnapshot(q, (snapshot) => {
    const categories = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Category[]
    callback(categories)
  })
}

export async function getCategory(id: string): Promise<Category | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Category
    }
    return null
  } catch (error) {
    console.error("Error fetching category:", error)
    return null
  }
}

export async function saveCategory(
  category: Omit<Category, "id" | "createdAt" | "updatedAt"> & { id?: string }
): Promise<string> {
  try {
    const now = Timestamp.now()
    const categoryData: any = {
      name: category.name,
      slug: category.slug || category.name.toLowerCase().replace(/\s+/g, "-"),
      order: category.order,
      isActive: category.isActive,
      updatedAt: now,
    }

    if (category.description !== undefined && category.description !== null && category.description !== "") {
      categoryData.description = category.description
    }

    if (category.id) {
      // Update existing category
      const docRef = doc(db, COLLECTION_NAME, category.id)
      const existingDoc = await getDoc(docRef)
      if (existingDoc.exists()) {
        const existingData = existingDoc.data()
        categoryData.createdAt = existingData.createdAt || now
      } else {
        categoryData.createdAt = now
      }
      await setDoc(docRef, categoryData)
      return category.id
    } else {
      // Create new category
      categoryData.createdAt = now
      const docRef = doc(collection(db, COLLECTION_NAME))
      await setDoc(docRef, categoryData)
      return docRef.id
    }
  } catch (error) {
    console.error("Error saving category:", error)
    throw error
  }
}

export async function deleteCategory(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    await deleteDoc(docRef)
  } catch (error) {
    console.error("Error deleting category:", error)
    throw error
  }
}

export async function updateCategoryOrder(categories: { id: string; order: number }[]): Promise<void> {
  try {
    const updates = categories.map((category) => {
      const docRef = doc(db, COLLECTION_NAME, category.id)
      return setDoc(docRef, { order: category.order, updatedAt: Timestamp.now() }, { merge: true })
    })
    await Promise.all(updates)
  } catch (error) {
    console.error("Error updating category order:", error)
    throw error
  }
}
