import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import storage from "./firebase";
import toast from "react-hot-toast";
const uploadFileToFirebase = async (file: File, folder: string) => {
  try {
    // Create a date string like 10-11-22:09.34.36
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

    const filename = `paper${dateStr}:${timeStr}.${file.name.split(".").pop()}`;
    const fileRef = ref(storage, `${folder}/${filename}`);

    toast.loading(`Uploading paper to Firebase...`);

    const snapshot = await uploadBytes(fileRef, file);
    const url = await getDownloadURL(snapshot.ref);

    toast.dismiss();
    toast.success(`Paper uploaded successfully!`);

    return url;
  } catch (error) {
    toast.dismiss();
    console.error(`Firebase ${folder} upload failed`, error);
    toast.error(`Upload failed`);
    return null;
  }
};


export default uploadFileToFirebase;