import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage"
import { storage, auth } from "./firebase"

/**
 * Upload a file to Firebase Storage
 * @param file - The file to upload
 * @param path - The path in storage (e.g., 'products/image.jpg', 'videos/video.mp4')
 * @param onProgress - Optional callback for upload progress (0-100)
 * @returns Promise with the download URL
 */
export async function uploadFile(
  file: File,
  path: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  try {
    // Check if user is authenticated
    if (!auth.currentUser) {
      throw new Error("User must be authenticated to upload files. Please log in.")
    }

    const storageRef = ref(storage, path)
    const uploadTask = uploadBytesResumable(storageRef, file)

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          if (onProgress) {
            onProgress(progress)
          }
        },
        (error) => {
          console.error("Error uploading file:", error)
          reject(error)
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
            resolve(downloadURL)
          } catch (error) {
            console.error("Error getting download URL:", error)
            reject(error)
          }
        }
      )
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    throw error
  }
}

/**
 * Upload an image file
 * @param file - The image file to upload
 * @param folder - The folder name (e.g., 'products', 'carousel', 'featured')
 * @param fileName - Optional custom file name, defaults to timestamp
 * @param onProgress - Optional callback for upload progress
 * @returns Promise with the download URL
 */
export async function uploadImage(
  file: File,
  folder: string = "images",
  fileName?: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const timestamp = Date.now()
  const fileExtension = file.name.split(".").pop() || "jpg"
  const name = fileName || `image_${timestamp}.${fileExtension}`
  const path = `${folder}/${name}`

  return uploadFile(file, path, onProgress)
}

/**
 * Upload a video file
 * @param file - The video file to upload
 * @param folder - The folder name (e.g., 'videos', 'featured')
 * @param fileName - Optional custom file name, defaults to timestamp
 * @param onProgress - Optional callback for upload progress
 * @returns Promise with the download URL
 */
export async function uploadVideo(
  file: File,
  folder: string = "videos",
  fileName?: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const timestamp = Date.now()
  const fileExtension = file.name.split(".").pop() || "mp4"
  const name = fileName || `video_${timestamp}.${fileExtension}`
  const path = `${folder}/${name}`

  return uploadFile(file, path, onProgress)
}

/**
 * Delete a file from Firebase Storage
 * @param url - The download URL of the file to delete
 */
export async function deleteFile(url: string): Promise<void> {
  try {
    // Extract the path from the URL
    const urlObj = new URL(url)
    const path = decodeURIComponent(urlObj.pathname.split("/o/")[1].split("?")[0])
    const storageRef = ref(storage, path)
    await deleteObject(storageRef)
  } catch (error) {
    console.error("Error deleting file:", error)
    throw error
  }
}

/**
 * Validate if a file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/")
}

/**
 * Validate if a file is a video
 */
export function isVideoFile(file: File): boolean {
  return file.type.startsWith("video/")
}

/**
 * Get file size in MB
 */
export function getFileSizeMB(file: File): number {
  return file.size / (1024 * 1024)
}

