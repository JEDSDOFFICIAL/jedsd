// src/lib/paperActions.ts
"use client";

import axios from "axios";
import toast from "react-hot-toast";
import { ResearchPaper } from "@prisma/client";

interface FetchPapersParams {
  authorId?: string;
  reviewerId?: string;
  editorId?: string;
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
    if (params.editorId) {
      queryParams.append("editorId", params.editorId);
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
    console.log("editor id from the function is", params.editorId);

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
      `/api/paper?paperId=${paperId}`,
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