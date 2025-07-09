// src/lib/reviewerActions.ts (New file or add to existing actions)
import axios from "axios";
import toast from "react-hot-toast";

export interface Reviewer {
  id: string;
  name: string;
  email: string;
  // Add any other relevant reviewer properties, e.g., userType: "REVIEWER"
}
export async function fetchReviewers(): Promise<Reviewer[] | null> {
  try {
    console.log("Fetching ADMIN users...");
    const res2 = await axios.get("/api/user?userType=ADMIN");
    console.log("Response for ADMIN users:", res2);
    console.log("Data for ADMIN users:", res2.data);

    if (res2.status !== 200) {
      throw new Error("Failed to fetch admin");
    }

    console.log("Fetching REVIEWER users...");
    const res = await axios.get("/api/user?userType=REVIEWER");
    console.log("Response for REVIEWER users:", res);
    console.log("Data for REVIEWER users:", res.data);

    // Add a check to prevent the error
    if (!Array.isArray(res.data)) {
      console.error("Expected an array for REVIEWERs, but received:", res.data);
      return null; // or handle the error appropriately
    }

    const reviewersData: Reviewer[] = res.data
      .filter((user: any) => user.userType === "REVIEWER")
      .map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
      }));

    // Add a check to prevent the error
    if (!Array.isArray(res2.data)) {
      console.error("Expected an array for ADMINs, but received:", res2.data);
      // Decide how to handle this - either continue with only reviewers or return null
    } else {
        reviewersData.push(
          ...res2.data
            .filter((user: any) => user.userType === "ADMIN")
            .map((user: any) => ({
              id: user.id,
              name: user.name,
              email: user.email,
            }))
        );
    }

    console.log("Combined reviewers data:", reviewersData);
    return reviewersData;

  } catch (error) {
    console.error("Failed to fetch reviewers:", error);
    // You can inspect the error object here to get more details
    if (axios.isAxiosError(error)) {
      console.error("Axios error response:", error.response);
      console.error("Axios error request:", error.request);
      console.error("Axios error message:", error.message);
    }
    toast.error("Failed to fetch reviewers.");
    return null;
  }
}

export async function assignReviewer(
  paperId: string,
  reviewerId: string,
  status?: string | "REVIEWER_ALLOCATION", // Default to "PENDING" if not provided
  onSuccess?: () => void
): Promise<void> {
  try {
    await axios.put(`/api/paper?paperId=${paperId}`, {
      reviewerId,
      status,
      ReviewerStatus: "NOT_RESPONDED",
    });
    toast.success("Reviewer assigned successfully!");
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
  ReviewerStatus: "ACCEPT_FOR_REVIEW" | "REJECT_FOR_REVIEW",
  onSuccess?: () => void
): Promise<void> {
  try {
    if (ReviewerStatus === "REJECT_FOR_REVIEW") {
      await axios.put(`/api/paper?paperId=${paperId}`, {
        reviewerStatus: "REJECTED_FOR_REVIEW",
        status: "REVIEWER_ALLOCATION",
      });
      toast.error("Reviewer rejected the paper for review successfully!");
     
    }
    // If the reviewer accepts the paper for review
    if (ReviewerStatus === "ACCEPT_FOR_REVIEW") {
      await axios.put(`/api/paper?paperId=${paperId}`, {
        reviewerStatus: "ACCEPTED_FOR_REVIEW",
        status: "ON_REVIEW",
      });

     toast.success("Reviewer accepted the paper for review successfully!");
    }
    onSuccess?.();
  } catch (error) {
    console.error("Failed to update reviewer acceptance:", error);
    toast.error("Failed to update reviewer acceptance.");
  }
}
