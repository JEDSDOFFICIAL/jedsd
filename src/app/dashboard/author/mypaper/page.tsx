"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResearchPaper } from "@prisma/client";
import { FileText } from "lucide-react";
import Link from "next/link";
import { DataTable } from "./data-table";
import { createColumns } from "./columns";
import { EditPaperModal } from "./edit-paper-modal";
import { ViewPaperModal } from "../../../../components/view-paper-modal";

export default function MyPapersPage() {
  const { data: session } = useSession();
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPaperId, setEditingPaperId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewingPaperId, setViewingPaperId] = useState<string | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    const fetchPapers = async () => {
      if (!session?.user?.email) return;

      try {
        setLoading(true);
        const response = await axios.get(`/api/paper?authorId=${session.user.id}`);
        setPapers(response.data.papers || []);
      } catch (err) {
        console.error("Error fetching papers:", err);
        setError("Failed to load your papers");
      } finally {
        setLoading(false);
      }
    };

    fetchPapers();
  }, [session?.user?.email]);

  const handleEditPaper = (paperId: string) => {
    setEditingPaperId(paperId);
    setIsEditModalOpen(true);
  };

  const handleViewPaper = (paperId: string) => {
    setViewingPaperId(paperId);
    setIsViewModalOpen(true);
  };

  const handleEditSuccess = () => {
    // Refresh the papers list
    const fetchPapers = async () => {
      if (!session?.user?.email) return;

      try {
        const response = await axios.get(`/api/paper?authorId=${session.user.id}`);
        setPapers(response.data.papers || []);
      } catch (err) {
        console.error("Error fetching papers:", err);
      }
    };

    fetchPapers();
  };

  const columns = createColumns({ onEditPaper: handleEditPaper, onViewPaper: handleViewPaper });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your papers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Papers</h1>
        <p className="text-muted-foreground mt-2">
          View and manage all your submitted manuscripts
        </p>
      </div>

      {papers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No papers submitted yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              You haven&apos;t submitted any manuscripts yet. Start by uploading your first paper.
            </p>
            <Link href="/dashboard/paper/upload">
              <Button>
                Upload Your First Paper
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <DataTable columns={columns} data={papers} />
      )}

      <EditPaperModal
        paperId={editingPaperId}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingPaperId(null);
        }}
        onSuccess={handleEditSuccess}
      />

      <ViewPaperModal
        paperId={viewingPaperId}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingPaperId(null);
        }}
      />
    </div>
  );
}