import { initializeApp, getApps } from "firebase/app"
import { getFirestore, collection, getDocs, doc, writeBatch, query } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyB8pssETBZdviOtlAo7TplqMVQ4zU5FWUg",
  authDomain: "ecommerce-website-6aa12.firebaseapp.com",
  projectId: "ecommerce-website-6aa12",
  storageBucket: "ecommerce-website-6aa12.firebasestorage.app",
  messagingSenderId: "795427918186",
  appId: "1:795427918186:web:a8370def746fd551b39513",
  measurementId: "G-84QE5E3RVQ"
}

// Initialize Firebase
let app
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig)
} else {
  app = getApps()[0]
}

const db = getFirestore(app)
const PRODUCTS_COLLECTION = "products"

// Main function to delete all products
async function deleteAllProducts() {
  try {
    console.log("Fetching all products from Firebase...")
    
    // Get all products
    const productsRef = collection(db, PRODUCTS_COLLECTION)
    const snapshot = await getDocs(productsRef)
    const totalProducts = snapshot.size
    
    if (totalProducts === 0) {
      console.log("No products found in Firebase.")
      return
    }
    
    console.log(`Found ${totalProducts} products to delete.\n`)
    
    // Delete products in batches (Firestore allows 500 deletes per batch)
    const batchSize = 500
    let deletedCount = 0
    const docs = snapshot.docs
    
    for (let i = 0; i < docs.length; i += batchSize) {
      const batch = writeBatch(db)
      const batchDocs = docs.slice(i, i + batchSize)
      
      for (const productDoc of batchDocs) {
        batch.delete(productDoc.ref)
      }
      
      await batch.commit()
      deletedCount += batchDocs.length
      console.log(`  ✓ Deleted batch ${Math.floor(i / batchSize) + 1} (${batchDocs.length} products) - Total: ${deletedCount}/${totalProducts}`)
    }
    
    console.log(`\n✅ Successfully deleted ${deletedCount} products from Firebase!`)
  } catch (error) {
    console.error("Error deleting products:", error)
    throw error
  }
}

// Run the script
deleteAllProducts()
  .then(() => {
    console.log("Script completed successfully!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("Error:", error)
    process.exit(1)
  })

