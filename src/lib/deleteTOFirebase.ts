import { getStorage, ref, deleteObject } from "firebase/storage";

const deleteFileByDownloadURL = async (downloadUrl: string) => {
  try {
    const matches = downloadUrl.match(/\/o\/(.*?)\?/);
    if (!matches || matches.length < 2) {
      throw new Error("Invalid Firebase download URL");
    }

    const encodedPath = matches[1]; // e.g. papers%2Fpaper04-06-25%3A14.05.12.pdf
    const filePath = decodeURIComponent(encodedPath); // e.g. papers/paper04-06-25:14.05.12.pdf

    const storage = getStorage();
    const fileRef = ref(storage, filePath);

    await deleteObject(fileRef);
    console.log("File deleted successfully");
    return true;
  } catch (error) {
    console.error("Failed to delete file:", error);
    return false;
  }
};
export default deleteFileByDownloadURL;