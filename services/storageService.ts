import { storage } from "@/firebase/config";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

/**
 * Uploads a File or Base64 data URL to Firebase Storage under a specified folder path.
 * Returns the public download URL.
 */
export async function uploadImage(
  fileOrUrl: File | string,
  folderPath: string = "uploads"
): Promise<string> {
  if (typeof fileOrUrl === "string" && (fileOrUrl.startsWith("http://") || fileOrUrl.startsWith("https://"))) {
    return fileOrUrl;
  }

  try {
    const timestamp = Date.now();
    let fileRef;

    if (fileOrUrl instanceof File) {
      const extension = fileOrUrl.name.split(".").pop() || "jpg";
      const fileName = `${folderPath}/${timestamp}_${Math.random().toString(36).substring(2, 8)}.${extension}`;
      fileRef = ref(storage, fileName);
      const snapshot = await uploadBytesResumable(fileRef, fileOrUrl);
      return await getDownloadURL(snapshot.ref);
    } else if (typeof fileOrUrl === "string" && fileOrUrl.startsWith("data:")) {
      const fileName = `${folderPath}/${timestamp}_${Math.random().toString(36).substring(2, 8)}.jpg`;
      fileRef = ref(storage, fileName);
      const response = await fetch(fileOrUrl);
      const blob = await response.blob();
      const snapshot = await uploadBytesResumable(fileRef, blob);
      return await getDownloadURL(snapshot.ref);
    }

    return typeof fileOrUrl === "string" ? fileOrUrl : "";
  } catch (error) {
    console.error("Firebase Storage upload error:", error);
    return typeof fileOrUrl === "string" ? fileOrUrl : "";
  }
}

/**
 * Uploads multiple images to Firebase Storage concurrently and returns array of download URLs.
 */
export async function uploadMultipleImages(
  filesOrUrls: (File | string)[],
  folderPath: string = "uploads"
): Promise<string[]> {
  if (!filesOrUrls || filesOrUrls.length === 0) return [];
  const uploadPromises = filesOrUrls.map((item) => uploadImage(item, folderPath));
  return Promise.all(uploadPromises);
}

export const storageService = {
  uploadImage,
  uploadMultipleImages
};
