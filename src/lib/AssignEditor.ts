// src/lib/reviewerActions.ts (New file or add to existing actions)
import axios from "axios";
import toast from "react-hot-toast";

export interface Editor {
  id: string;
  name: string;
  email: string;
  // Add any other relevant reviewer properties, e.g., userType: "REVIEWER"
}

export async function fetchReviewers(): Promise<Editor[] | null> {
  try {
    const res = await axios.get("/api/user?userType=REVIEWER");
    if (res.status !== 200) {
      throw new Error("Failed to fetch reviewers");
    }
    const res2 = await axios.get("/api/user?userType=ADMIN");
    if (res2.status !== 200) {
      throw new Error("Failed to fetch reviewers");
    }
    const res3 = await axios.get("/api/user?userType=EDITOR");
    if (res3.status !== 200) {
      throw new Error("Failed to fetch reviewers");
    }

    const reviewersData: Editor[] = res.data
      .filter((user: any) => user.userType === "REVIEWER")
      .map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        // Include other properties if your Reviewer interface expects them
      }));
    reviewersData.push(
      ...res2.data
        .filter((user: any) => user.userType === "ADMIN")
        .map((user: any) => ({
          id: user.id,
          name: user.name,
          email: user.email,
        }))
    );
    reviewersData.push(
      ...res3.data
        .filter((user: any) => user.userType === "EDITOR")
        .map((user: any) => ({
          id: user.id,
          name: user.name,
          email: user.email,
        }))
    );
    return reviewersData;
  } catch (error) {
    console.error("Failed to fetch reviewers:", error);
    toast.error("Failed to fetch reviewers.");
    return null;
  }
}

export async function assignEditor(
  paperId: string,
  editorId: string,
  status?: string | "EDITOR_ALLOCATION", // Default to "PENDING" if not provided
  onSuccess?: () => void
): Promise<void> {
  try {
    await axios.put(`/api/paper?paperId=${paperId}`, {
      editorId,
      status,
      editorStatus: "NOT_RESPONDED",
    });
    toast.success("Editor assigned successfully!");
    onSuccess?.();
  } catch (error) {
    console.error("Failed to assign reviewer:", error);
    toast.error("Failed to assign reviewer.");
  }
}

export async function reviewerAcceptenceforPublication(
  paperId: string,
  ReviewerStatus: "PUBLISH" | "REJECTED",
  onSuccess?: () => void
): Promise<void> {
  try {
    if (ReviewerStatus === "PUBLISH") {
      await axios.put(`/api/paper?paperId=${paperId}`, {
        status: "PUBLISH",
      });

      toast.success("Reviewer accept the paper successfully!");
    }
    if (ReviewerStatus === "REJECTED") {
      await axios.put(`/api/paper?paperId=${paperId}`, {
        status: "REJECTED",
      });

      toast.error("Reviewer reject the paper successfully!");
    }
    onSuccess?.();
  } catch (error) {
    console.error("Failed to update reviewer acceptance:", error);
    toast.error("Failed to update reviewer acceptance.");
  }
}

export async function reviewerAcceptence(
  paperId: string,
  ReviewerStatus: "ACCEPT" | "REJECT",
  onSuccess?: () => void
): Promise<void> {
  try {
    if (ReviewerStatus === "ACCEPT") {
      await axios.put(`/api/paper?paperId=${paperId}`, {
        reviewerStatus: "ACCEPTED",
        status: "ON_REVIEW",
      });

      toast.success("Reviewer accept the paper successfully!");
    }
    if (ReviewerStatus === "REJECT") {
      await axios.put(`/api/paper?paperId=${paperId}`, {
        reviewerStatus: "REJECTED",
        status: "REVIEWER_ALLOCATION",
      });

      toast.error("Reviewer reject the paper successfully!");
    }
    onSuccess?.();
  } catch (error) {
    console.error("Failed to update reviewer acceptance:", error);
    toast.error("Failed to update reviewer acceptance.");
  }
}
