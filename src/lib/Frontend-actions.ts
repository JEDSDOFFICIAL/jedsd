// src/lib/paperActions.ts
"use client";

import axios from "axios";
import toast from "react-hot-toast";
import { ResearchPaper, ReviewerStatus } from "@prisma/client";

interface FetchPapersParams {
  authorId?: string;
  reviewerId?: string;
  page?: number;
  limit?: number;
  keywords?: string;
  title?: string;
  status?: string;
  reviewerStatus?: "ACCEPTED_FOR_PUBLICATION" | "REJECTED_FOR_PUBLICATION" | "ACCEPTED_FOR_REVIEW" | "REJECTED_FOR_REVIEW" | "PENDING";
}

interface FetchPapersResponse {
  papers: ResearchPaper[];
  total: number;
  page: number;
  totalPages: number;
}
export async function fetchPapers(
  params: FetchPapersParams = {}
): Promise<FetchPapersResponse | null> {
  try {
    const queryParams = new URLSearchParams();

    if (params.authorId) {
      queryParams.append("authorId", params.authorId);
    }
    if (params.reviewerId) {
      queryParams.append("reviewerId", params.reviewerId);
    }
    if (params.page) {
      queryParams.append("page", params.page.toString());
    }
    if (params.limit) {
      queryParams.append("limit", params.limit.toString());
    }
    if (params.keywords) {
      queryParams.append("keywords", params.keywords);
    }
    if (params.title) {
      queryParams.append("title", params.title);
    }
    if (params.status) {
      queryParams.append("status", params.status);
    }
    if (params.reviewerStatus) {
      queryParams.append("reviewerStatus", params.reviewerStatus);
    }

    const queryString = queryParams.toString();
    const url = `/api/paper${queryString ? `?${queryString}` : ""}`;
    console.log("Fetching papers with URL:", url);
    const res = await axios.get(url);
    console.log("Fetched papers from the function :", res.data);

    return res.data; // Return the entire response as expected by the function signature
  } catch (error) {
    console.error("Failed to fetch papers:", error);
    toast.error("Failed to fetch papers.");
    return null;
  }
}



export async function deletePapers(
  paperIds: string | string[], // Changed from 'emails' to 'paperIds'
  onSuccess?: () => void
): Promise<void> {
  try {
    const idsToDelete = Array.isArray(paperIds) ? paperIds : [paperIds];
    await axios.delete("/api/paper", {
      data: { paperIds: idsToDelete }, // Sending an array of paper IDs
    });
    toast.success("Deleted successfully!");
    onSuccess?.();
  } catch (error) {
    console.error("Failed to delete papers:", error);
    toast.error("Failed to delete papers.");
  }
}



export async function updatePaper(
  paperId: string,
  updates: Partial<ResearchPaper>,
  onSuccess?: () => void
): Promise<void> {
  try {
    await axios.put(
      `/api/paper/${paperId}`,
      updates,
      { headers: { "Content-Type": "application/json" } }
    );
    toast.success("Updated successfully!");
    onSuccess?.();
  } catch (error) {
    console.error("Failed to update paper:", error);
    toast.error("Failed to update paper.");
  }
}


export async function fetchPaperDetails(
  paperId: string
): Promise<ResearchPaper | null> {
  try {
    const res = await axios.get(`/api/paper/${paperId}`);
    console.log("Fetched paper details:", res.data);
    return res.data.paper; // Assuming the response structure contains a 'paper' field
  } catch (error) {
    console.error("Failed to fetch paper details:", error);
    toast.error("Failed to fetch paper details.");
    return null;
  }
}

export async function fetchReviewer(){
  try {
    const res = await axios.get(`/api/user/reviewer`);
    console.log("Fetched reviewers:", res.data);
    return res.data; 
  } catch (error) {
    console.error("Failed to fetch reviewers:", error);
    toast.error("Failed to fetch reviewers.");
    return null;
  }
}

export async function fetchAllUser(){
  try {
    const res = await axios.get(`/api/user`);
    console.log("Fetched all users:", res.data);
    return res.data; 
  } catch (error) {
    console.error("Failed to fetch all users:", error);
    toast.error("Failed to fetch all users.");
    return null;
  }
}

export async function fetchReviewerPapers(reviewerId:string,page: number = 1, limit: number = 10) {
  try {
    const res = await axios.get(`/api/paper/reviewer-papers?reviewerId=${reviewerId}&page=${page}&limit=${limit}`);
    console.log("Fetched reviewer papers:", res.data);
    return {
      data: res.data.data,
      page: page,
      totalPages: Math.ceil(res.data.count / limit) || 1,
      total: res.data.count || 0,
      limit: limit
    };
  } catch (error) {
    console.error("Failed to fetch reviewer papers:", error);
    toast.error("Failed to fetch reviewer papers.");
    return null;
  }
}

export async function reviewerAllocation(paperId:string,reviewerIds:string[],onSuccess?:()=>void){
  try {
    const res = await axios.post(`/api/paper/${paperId}/assign-reviewer`, {
      paperId,
      reviewerIds,
    });
    console.log("Successfully allocated reviewers:", res.data);
    onSuccess?.();
    return res.data;
  } catch (error: any) {
    const message = error?.response?.data?.message || "Failed to allocate reviewers.";
    console.error("Failed to allocating reviewers:", error);
    toast.error(message);
    throw new Error(message);
  }
 
}
export async function reviewerAcceptancy(paperId:string,reviewerId:string,tag:ReviewerStatus,onSuccess?:()=>void){
try {
  console.log("Accepting or rejecting paper by reviewer with paperId:", paperId, "reviewerId:", reviewerId, "status:", tag);
  const res = await axios.patch(`/api/paper/reviewer-acceptance`, {
    paperId,
    reviewerId,
    status:tag,
  });
  console.log("Reviewer acceptancy response:", res.data);
  toast.success("Reviewer acceptancy updated successfully!");
  onSuccess?.();
  return res.data;

  
} catch (error) {
   console.error("Failed to Accept or reject the paper by the reviewer:", error);
    toast.error("Failed to accept or reject the paper.");
}
}
export async function reassignReviewer(
  paperId: string,
  rejectedReviewerId: string,
  newReviewerId: string
): Promise<void> {
  try {
    console.log("Reassigning reviewer for paperId:", paperId, "from", rejectedReviewerId, "to", newReviewerId);
    await axios.post(`/api/paper/reviewer-acceptance`, {
      paperId,
      rejectedReviewerId,
      newReviewerId,
    });
    toast.success("Reviewer reassigned successfully!");
  } catch (error) {
    console.error("Failed to reassign reviewer:", error);
    toast.error("Failed to reassign reviewer.");
  }
}

export async function fetchPaperReviews(
  paperId: string,
  reviewerId?: string
): Promise<any> {
  try {
    const res = await axios.get(`/api/paper/${paperId}/fetch-review`, {
      params: { reviewerId }
    });
    console.log("Fetched paper reviews:", res.data);
    return res.data; // Assuming the response structure contains a 'reviews' field
  } catch (error) {
    console.error("Failed to fetch paper reviews:", error);
    toast.error("Failed to fetch paper reviews.");
    return null;
  }
}


export async function publishPaper(paperId:string,onSuccess?:()=>void){
  try {
    const res = await axios.patch(`/api/paper/${paperId}/publish`, {
      status: "PUBLISH"
    });
    console.log("Published paper:", res.data);
    onSuccess?.();
    return res.data;
  } catch (error) {
    console.error("Failed to publish paper:", error);
    toast.error("Failed to publish paper.");
    return null;
  }
}

export async function acceptPaper(paperId: string, onSuccess?: () => void) {
  try {
    const res = await axios.patch(`/api/paper/${paperId}/accept`);
    console.log("Accepted paper:", res.data);
    toast.success("Paper accepted for publication successfully!");
    onSuccess?.();
    return res.data;
  } catch (error) {
    console.error("Failed to accept paper:", error);
    toast.error("Failed to accept paper.");
    return null;
  }
}

export async function rejectPaper(paperId: string, onSuccess?: () => void) {
  try {
    const res = await axios.patch(`/api/paper/${paperId}/reject`);
    console.log("Rejected paper:", res.data);
    toast.success("Paper rejected successfully!");
    onSuccess?.();
    return res.data;
  } catch (error) {
    console.error("Failed to reject paper:", error);
    toast.error("Failed to reject paper.");
    return null;
  }
}

export async function submitReview(
  paperId: string,
  reviewerId: string,
  reviewText: string,
  reviewTextForAuthor: string | null,
  rating: number,
  reviewerStatus: "ACCEPTED_FOR_PUBLICATION" | "REJECTED_FOR_PUBLICATION" | "MINOR_REVISION" | "MAJOR_REVISION",
  correspondingFile?: string | null,
  onSuccess?: () => void
): Promise<any> {
  try {
    console.log("Submitting review for paperId:", paperId, "reviewerId:", reviewerId);
    const res = await axios.post(`/api/paper/review`, {
      paperId,
      reviewerId,
      reviewText,
      reviewTextForAuthor: reviewTextForAuthor || null,
      rating,
      reviewerStatus,
      correspondingFile
    });
    console.log("Review submission response:", res.data);
    toast.success("Review submitted successfully!");
    onSuccess?.();
    return res.data;
  } catch (error) {
    console.error("Failed to submit review:", error);
    toast.error("Failed to submit review.");
    throw error;
  }
}

// ─── Revision workflow ────────────────────────────────────────────────────────

export interface SubmitRevisionParams {
  revisedManuscriptUrl: string;
  revisedManuscriptName: string;
  revisedManuscriptSize?: number;
  revisedManuscriptType?: "MANUSCRIPT_PDF" | "MANUSCRIPT_DOCX";
  coverLetterUrl?: string | null;
  coverLetterName?: string | null;
  coverLetterSize?: number | null;
  sourceZipUrl?: string | null;
  sourceZipName?: string | null;
  sourceZipSize?: number | null;
  responseToReviewers?: string | null;
  revisionNotes?: string | null;
}

/**
 * Author submits a revised manuscript.
 * paperId = UUID internal id.
 */
export async function submitRevision(
  paperId: string,
  data: SubmitRevisionParams,
  onSuccess?: () => void
): Promise<any> {
  try {
    const res = await axios.post(`/api/paper/${paperId}/submit-revision`, data);
    toast.success("Revision submitted successfully!");
    onSuccess?.();
    return res.data;
  } catch (error: any) {
    const message = error?.response?.data?.message || "Failed to submit revision.";
    toast.error(message);
    throw new Error(message);
  }
}

/**
 * Editor requests a revision from the author.
 */
export async function requestRevision(
  paperId: string,
  comments: string,
  decision: "MINOR_REVISION" | "MAJOR_REVISION" = "MINOR_REVISION",
  onSuccess?: () => void
): Promise<any> {
  try {
    const res = await axios.post(`/api/paper/${paperId}/request-revision`, { comments, decision });
    toast.success("Revision requested. Author has been notified.");
    onSuccess?.();
    return res.data;
  } catch (error: any) {
    const message = error?.response?.data?.message || "Failed to request revision.";
    toast.error(message);
    throw new Error(message);
  }
}

/**
 * Fetch all revisions for a paper (with files, respecting access level).
 */
export async function fetchRevisions(paperId: string): Promise<any> {
  try {
    const res = await axios.get(`/api/paper/${paperId}/revisions`);
    return res.data;
  } catch (error) {
    console.error("fetchRevisions error:", error);
    toast.error("Failed to fetch revisions.");
    return null;
  }
}

/**
 * Editor accepts the revision (status → ACCEPTED).
 */
export async function acceptRevision(
  paperId: string,
  comments?: string,
  onSuccess?: () => void
): Promise<any> {
  try {
    const res = await axios.post(`/api/paper/${paperId}/accept-revision`, { comments });
    toast.success("Revision accepted. Paper status set to ACCEPTED.");
    onSuccess?.();
    return res.data;
  } catch (error: any) {
    const message = error?.response?.data?.message || "Failed to accept revision.";
    toast.error(message);
    throw new Error(message);
  }
}

/**
 * Editor starts a new review round for the current revision.
 */
export async function startReviewRound(
  paperId: string,
  reviewerIds: string[],
  options?: {
    revisionId?: string;
    shareManuscript?: boolean;
    shareCoverLetter?: boolean;
    shareSourceZip?: boolean;
  },
  onSuccess?: () => void
): Promise<any> {
  try {
    const res = await axios.post(`/api/paper/${paperId}/review-rounds`, {
      reviewerIds,
      ...options,
    });
    toast.success(`Review round started with ${reviewerIds.length} reviewer(s).`);
    onSuccess?.();
    return res.data;
  } catch (error: any) {
    const message = error?.response?.data?.message || "Failed to start review round.";
    toast.error(message);
    throw new Error(message);
  }
}

/**
 * Fetch all review rounds for a paper.
 */
export async function fetchReviewRounds(paperId: string): Promise<any> {
  try {
    const res = await axios.get(`/api/paper/${paperId}/review-rounds`);
    return res.data;
  } catch (error) {
    console.error("fetchReviewRounds error:", error);
    toast.error("Failed to fetch review rounds.");
    return null;
  }
}

/**
 * Fetch the audit log for a paper (Editor/Admin only).
 */
export async function fetchAuditLog(paperId: string): Promise<any> {
  try {
    const res = await axios.get(`/api/paper/${paperId}/audit-log`);
    return res.data;
  } catch (error) {
    console.error("fetchAuditLog error:", error);
    return null;
  }
}

/**
 * Assign a DOI (Admin / Publication Editor only).
 */
export async function assignDoi(
  paperId: string,
  doi: string,
  onSuccess?: () => void
): Promise<any> {
  try {
    const res = await axios.patch(`/api/paper/${paperId}/assign-doi`, { doi });
    toast.success("DOI assigned successfully!");
    onSuccess?.();
    return res.data;
  } catch (error: any) {
    const message = error?.response?.data?.message || "Failed to assign DOI.";
    toast.error(message);
    throw new Error(message);
  }
}

/**
 * Request further revision after reviewing a submitted revision.
 */
export async function requestFurtherRevision(
  paperId: string,
  comments: string,
  decision: "MINOR_REVISION" | "MAJOR_REVISION" = "MINOR_REVISION",
  onSuccess?: () => void
): Promise<any> {
  return requestRevision(paperId, comments, decision, onSuccess);
}
