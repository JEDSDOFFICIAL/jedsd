"use client";

import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import storage from "./firebase";
import toast from "react-hot-toast";

const uploadFileToFirebase = async (file: File, folder: string) => {
  try {
    // Create a date string like 10-11-22_09.34.36
    const now = new Date();
    const dateStr = now
      .toLocaleDateString("en-GB") // DD/MM/YYYY
      .replace(/\//g, "-") // -> 10-11-2022
      .split("-")
      .map((val, idx) => (idx === 2 ? val.slice(2) : val)) // Get YY instead of YYYY
      .join("-");

    const timeStr = now
      .toTimeString()
      .split(" ")[0] // HH:MM:SS
      .replace(/:/g, "."); // -> 09.34.36

    const filename = `paper${dateStr}_${timeStr}.${file.name.split(".").pop()}`;
    const fileRef = ref(storage, `${folder}/${filename}`);

    toast.loading(`Uploading Manuscript...`);

    const snapshot = await uploadBytes(fileRef, file);
    const url = await getDownloadURL(snapshot.ref);

    toast.dismiss();
    toast.success(`Paper uploaded successfully!`);

    return url;
  } catch (error) {
    toast.dismiss();
    console.error(`Manuscript ${folder} upload failed`, error);
    toast.error(`Upload failed`);
    return null;
  }
};

const deleteFile = async (downloadUrl: string): Promise<void> => {
  const fileRef = ref(storage, downloadUrl);
  try {
    await deleteObject(fileRef);
    console.log("File deleted successfully");
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
};

export { uploadFileToFirebase, deleteFile };