import { collection, doc, getDocs, getDoc, setDoc, deleteDoc, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore"
import { db } from "./firebase"

export type SectionType = "product-section" | "category-section" | "custom-section"
export type SectionLayout = "grid" | "horizontal-scroll" | "masonry"

export interface HomepageSection {
  id: string
  title: string
  type: SectionType
  category?: string // For product sections
  order: number
  isActive: boolean
  layout: SectionLayout
  maxProducts?: number
  backgroundColor?: string
  showTitle: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

const COLLECTION_NAME = "homepageSections"

export async function getSections(): Promise<HomepageSection[]> {
  const q = query(collection(db, COLLECTION_NAME), orderBy("order", "asc"))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as HomepageSection[]
}

export function subscribeToSections(callback: (sections: HomepageSection[]) => void) {
  const q = query(collection(db, COLLECTION_NAME), orderBy("order", "asc"))
  return onSnapshot(q, (snapshot) => {
    const sections = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as HomepageSection[]
    callback(sections)
  })
}

export async function getSection(id: string): Promise<HomepageSection | null> {
  const docRef = doc(db, COLLECTION_NAME, id)
  const docSnap = await getDoc(docRef)
  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as HomepageSection
  }
  return null
}

export async function saveSection(section: Omit<HomepageSection, "id" | "createdAt" | "updatedAt"> & { id?: string }): Promise<string> {
  const now = Timestamp.now()
  const sectionData: any = {
    title: section.title,
    type: section.type,
    order: section.order,
    isActive: section.isActive,
    layout: section.layout,
    showTitle: section.showTitle,
    updatedAt: now,
  }

  // Only include optional fields if they have values
  if (section.category !== undefined && section.category !== null && section.category !== "") {
    sectionData.category = section.category
  }
  if (section.maxProducts !== undefined && section.maxProducts !== null) {
    sectionData.maxProducts = section.maxProducts
  }
  if (section.backgroundColor !== undefined && section.backgroundColor !== null && section.backgroundColor !== "") {
    sectionData.backgroundColor = section.backgroundColor
  }

  if (section.id) {
    // Update existing section
    const docRef = doc(db, COLLECTION_NAME, section.id)
    const existingDoc = await getDoc(docRef)
    if (existingDoc.exists()) {
      const existingData = existingDoc.data()
      sectionData.createdAt = existingData.createdAt || now
    } else {
      sectionData.createdAt = now
    }
    await setDoc(docRef, sectionData)
    return section.id
  } else {
    // Create new section
    sectionData.createdAt = now
    const docRef = doc(collection(db, COLLECTION_NAME))
    await setDoc(docRef, sectionData)
    return docRef.id
  }
}

export async function deleteSection(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id)
  await deleteDoc(docRef)
}

export async function updateSectionOrder(sections: { id: string; order: number }[]): Promise<void> {
  const updates = sections.map((section) => {
    const docRef = doc(db, COLLECTION_NAME, section.id)
    return setDoc(docRef, { order: section.order, updatedAt: Timestamp.now() }, { merge: true })
  })
  await Promise.all(updates)
}
