// utils/deleteFromFirebaseByURL.ts
import { getAdminStorage } from "@/lib/firebase-admin";

export const deleteFileByDownloadURL = async (downloadUrl: string) => {
  try {
    const matches = downloadUrl.match(/\/o\/(.*?)\?/);
    if (!matches || matches.length < 2) {
      throw new Error("Invalid Firebase download URL");
    }

    const encodedPath = matches[1];
    const filePath = decodeURIComponent(encodedPath);

    const adminStorage = getAdminStorage();
    const file = adminStorage.bucket().file(filePath);
    await file.delete();

    return true;
  } catch (error) {
    console.error("Error deleting Firebase file:", error);
    return false;
  }
};
