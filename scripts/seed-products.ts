import { initializeApp, getApps } from "firebase/app"
import { getFirestore, collection, doc, setDoc, writeBatch } from "firebase/firestore"

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

// Categories and their subcategories
const categories = [
  { name: "JEWELLERY", subcategories: ["Necklaces", "Earrings", "Rings", "Bracelets", "Anklets", "Pendants"] },
  { name: "GIFTS", subcategories: ["Gift Sets", "Personalized", "Special Occasions", "Corporate"] },
  { name: "NEW", subcategories: ["Latest Arrivals", "Trending", "Featured"] },
  { name: "SHADES", subcategories: ["Sunglasses", "Reading Glasses", "Fashion Glasses", "Sports"] },
  { name: "SCARVES", subcategories: ["Silk", "Cotton", "Wool", "Cashmere", "Designer"] },
  { name: "HATS", subcategories: ["Baseball Caps", "Beanies", "Fedoras", "Bucket Hats", "Sun Hats"] },
  { name: "WATCHES", subcategories: ["Analog", "Digital", "Smart Watches", "Luxury", "Sports"] },
  { name: "BELTS", subcategories: ["Leather", "Fabric", "Chain", "Designer", "Casual"] },
  { name: "HAIRWEAR", subcategories: ["Hair Clips", "Headbands", "Hair Ties", "Scrunchies", "Hair Pins"] },
  { name: "CURATED COMBOS", subcategories: ["Complete Sets", "Matching Sets", "Gift Combos"] },
  { name: "BAGS & BAG ACCESSORIES", subcategories: ["Handbags", "Backpacks", "Tote Bags", "Clutches", "Wallets"] },
  { name: "GIRLS", subcategories: ["Jewelry", "Accessories", "Hair Accessories", "Bags", "Watches"] },
  { name: "BOYS", subcategories: ["Watches", "Belts", "Hats", "Bags", "Accessories"] },
]

// Product name templates
const productTemplates = {
  JEWELLERY: ["Elegant", "Classic", "Modern", "Vintage", "Designer", "Luxury", "Chic", "Stylish", "Premium", "Exquisite"],
  GIFTS: ["Thoughtful", "Special", "Personalized", "Unique", "Premium", "Luxury", "Elegant", "Charming", "Delightful", "Memorable"],
  NEW: ["Latest", "Trending", "Hot", "New Arrival", "Featured", "Popular", "Exclusive", "Limited", "Fresh", "Modern"],
  SHADES: ["Stylish", "Classic", "Sporty", "Designer", "Trendy", "Vintage", "Modern", "Luxury", "Premium", "Cool"],
  SCARVES: ["Silk", "Elegant", "Designer", "Luxury", "Chic", "Classic", "Modern", "Stylish", "Premium", "Soft"],
  HATS: ["Classic", "Trendy", "Sporty", "Designer", "Vintage", "Modern", "Stylish", "Cool", "Premium", "Comfortable"],
  WATCHES: ["Elegant", "Classic", "Modern", "Luxury", "Sporty", "Designer", "Premium", "Stylish", "Sophisticated", "Timeless"],
  BELTS: ["Leather", "Classic", "Designer", "Modern", "Stylish", "Premium", "Elegant", "Luxury", "Trendy", "Durable"],
  HAIRWEAR: ["Elegant", "Cute", "Stylish", "Designer", "Trendy", "Chic", "Modern", "Classic", "Adorable", "Fashionable"],
  "CURATED COMBOS": ["Complete", "Luxury", "Premium", "Elegant", "Designer", "Exclusive", "Special", "Deluxe", "Ultimate", "Perfect"],
  "BAGS & BAG ACCESSORIES": ["Designer", "Luxury", "Elegant", "Stylish", "Modern", "Classic", "Premium", "Chic", "Trendy", "Sophisticated"],
  GIRLS: ["Cute", "Adorable", "Pretty", "Charming", "Sweet", "Elegant", "Stylish", "Trendy", "Modern", "Delightful"],
  BOYS: ["Cool", "Stylish", "Modern", "Sporty", "Classic", "Trendy", "Designer", "Premium", "Tough", "Durable"],
}

// Colors
const colors = ["Black", "White", "Red", "Blue", "Green", "Yellow", "Pink", "Purple", "Orange", "Brown", "Gray", "Gold", "Silver", "Rose Gold", "Navy", "Beige"]

// Sizes (for applicable products)
const sizes = {
  HATS: ["S", "M", "L", "XL", "One Size"],
  BELTS: ["S", "M", "L", "XL", "28", "30", "32", "34", "36", "38"],
  WATCHES: ["Small", "Medium", "Large", "One Size"],
  "BAGS & BAG ACCESSORIES": ["Small", "Medium", "Large", "One Size"],
  GIRLS: ["XS", "S", "M", "L", "One Size"],
  BOYS: ["S", "M", "L", "XL", "One Size"],
}

// Image URLs (using placeholder service)
const getImageUrl = (category: string, index: number) => {
  // Using placeholder.com for reliable image URLs
  const categoryId = category.toLowerCase().replace(/\s+/g, "-")
  const imageId = (index % 1000) + 1 // Cycle through 1000 different images
  return `https://picsum.photos/600/600?random=${imageId}`
}

// Helper function to remove undefined values from object
function removeUndefined(obj: any): any {
  const cleaned: any = {}
  for (const key in obj) {
    if (obj[key] !== undefined) {
      cleaned[key] = obj[key]
    }
  }
  return cleaned
}

// Generate a random product
function generateProduct(category: string, subcategory: string, index: number): any {
  const templates = productTemplates[category as keyof typeof productTemplates] || productTemplates.JEWELLERY
  const template = templates[Math.floor(Math.random() * templates.length)]
  const productName = `${template} ${subcategory} ${index + 1}`
  
  const basePrice = Math.floor(Math.random() * 500) + 10 // $10 to $510
  const hasDiscount = Math.random() > 0.5
  const originalPrice = hasDiscount ? Math.floor(basePrice * 1.3) : undefined
  
  const rating = parseFloat((Math.random() * 2 + 3).toFixed(1)) // 3.0 to 5.0
  const reviews = Math.floor(Math.random() * 500) + 10 // 10 to 510
  
  const productColors = colors.slice(0, Math.floor(Math.random() * 5) + 2) // 2-6 colors
  const productSizes = sizes[category as keyof typeof sizes] || undefined
  
  const gender = category === "GIRLS" ? "GIRLS" : category === "BOYS" ? "BOYS" : undefined
  
  const description = `Premium quality ${subcategory.toLowerCase()} from our ${category.toLowerCase()} collection. ${template.toLowerCase()} design with excellent craftsmanship. Perfect for any occasion.`
  
  const images = [
    getImageUrl(category, index),
    getImageUrl(category, index + 10000),
    getImageUrl(category, index + 20000),
  ]
  
  const product: any = {
    id: `product-${category.toLowerCase().replace(/\s+/g, "-")}-${index}`,
    name: productName,
    price: basePrice,
    image: images[0],
    category: category,
    subcategory: subcategory,
    rating: rating,
    reviews: reviews,
    inStock: Math.random() > 0.1, // 90% in stock
    description: description,
    images: images,
    colors: productColors,
    createdAt: new Date(),
  }
  
  // Only add optional fields if they have values
  if (originalPrice !== undefined) {
    product.originalPrice = originalPrice
  }
  if (productSizes !== undefined) {
    product.size = productSizes
  }
  if (gender !== undefined) {
    product.gender = gender
  }
  
  return product
}

// Main function to seed products
async function seedProducts() {
  const totalProducts = 10000
  const productsPerCategory = Math.floor(totalProducts / categories.length)
  const remainder = totalProducts % categories.length
  
  console.log(`Starting to seed ${totalProducts} products...`)
  
  let productIndex = 0
  
  for (let catIndex = 0; catIndex < categories.length; catIndex++) {
    const category = categories[catIndex]
    const productsForThisCategory = productsPerCategory + (catIndex < remainder ? 1 : 0)
    
    console.log(`\nProcessing category: ${category.name} (${productsForThisCategory} products)`)
    
    const products: any[] = []
    
    // Generate products for this category
    for (let i = 0; i < productsForThisCategory; i++) {
      const subcategory = category.subcategories[Math.floor(Math.random() * category.subcategories.length)]
      const product = generateProduct(category.name, subcategory, productIndex)
      products.push(product)
      productIndex++
    }
    
    // Write products in batches (Firestore allows 500 writes per batch)
    const batchSize = 500
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = writeBatch(db)
      const batchProducts = products.slice(i, i + batchSize)
      
      for (const product of batchProducts) {
        const productRef = doc(collection(db, "products"), product.id)
        // Remove undefined values before writing to Firestore
        const cleanedProduct = removeUndefined(product)
        batch.set(productRef, cleanedProduct)
      }
      
      await batch.commit()
      console.log(`  ✓ Committed batch ${Math.floor(i / batchSize) + 1} (${batchProducts.length} products)`)
    }
    
    console.log(`✓ Completed category: ${category.name}`)
  }
  
  console.log(`\n✅ Successfully seeded ${totalProducts} products!`)
}

// Run the script
seedProducts()
  .then(() => {
    console.log("Script completed successfully!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("Error seeding products:", error)
    process.exit(1)
  })

