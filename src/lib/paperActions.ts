// src/lib/paperActions.ts
"use client";

import axios from "axios";
import toast from "react-hot-toast";
import { ResearchPaper } from "@prisma/client";

interface FetchPapersParams {
  authorId?: string;
  reviewerId?: string;
  page?: number;
  limit?: number;
  keywords?: string;
  title?: string;
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

    const queryString = queryParams.toString();
    const url = `/api/paper${queryString ? `?${queryString}` : ""}`;

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