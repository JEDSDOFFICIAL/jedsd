"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResearchPaper } from "@prisma/client";
import axios from "axios";
import { toast } from "react-hot-toast";
import { 
  Calendar, 
  Star, 
  FileText, 
  Download, 
  Mail, 
  Phone, 
  Building, 
  User,
  Archive
} from "lucide-react";
import { format } from "date-fns";

interface ViewPaperModalProps {
  paperId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ViewPaperModal({ paperId, isOpen, onClose }: ViewPaperModalProps) {
  const [loading, setLoading] = useState(false);
  const [paper, setPaper] = useState<ResearchPaper | null>(null);

  // Fetch paper data when modal opens
  useEffect(() => {
    const fetchPaperData = async () => {
      if (!paperId || !isOpen) return;
      
      setLoading(true);
      try {
        const response = await axios.get(`/api/paper/${paperId}`);
        if (response.status === 200 && response.data) {
          setPaper(response.data.paper);
        }
      } catch (error) {
        console.error("Error fetching paper data:", error);
        toast.error("Failed to load paper data");
        onClose();
      } finally {
        setLoading(false);
        console.log("Finished fetching paper data", paper);
      }
    };

    fetchPaperData();
  }, [paperId, isOpen, onClose]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "UPLOAD":
        return "bg-blue-100 text-blue-800";
      case "REVIEWER_ALLOCATION":
        return "bg-yellow-100 text-yellow-800";
      case "ON_REVIEW":
        return "bg-orange-100 text-orange-800";
      case "EDITOR_DECISION":
        return "bg-purple-100 text-purple-800";
      case "ACCEPTED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "PUBLISH":
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "UPLOAD":
        return "Uploaded";
      case "REVIEWER_ALLOCATION":
        return "Reviewer Allocation";
      case "ON_REVIEW":
        return "Under Review";
      case "EDITOR_DECISION":
        return "Editor Decision";
      case "ACCEPTED":
        return "Accepted";
      case "REJECTED":
        return "Rejected";
      case "PUBLISH":
        return "Published";
      default:
        return status;
    }
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClose = () => {
    setPaper(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Paper Details</DialogTitle>
          <DialogDescription>
            Complete information about the research paper
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading paper details...</p>
            </div>
          </div>
        ) : paper ? (
          <ScrollArea className="max-h-[70vh] pr-4">
            <div className="space-y-6">
              {/* Header Section */}
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold leading-tight">{paper.title}</h2>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        <span>ID: {paper.paperId}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Submitted: {format(new Date(paper.submissionDate), "MMM dd, yyyy")}</span>
                      </div>
                      {paper.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{paper.rating}/10</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge className={getStatusColor(paper.status)}>
                    {getStatusLabel(paper.status)}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Abstract Section */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Abstract</h3>
                <p className="text-sm leading-relaxed text-justify">
                  {paper.abstract}
                </p>
              </div>

              <Separator />

              {/* Keywords Section */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {paper.keywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Authors Section */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Authors</h3>
                {paper.contributors && Array.isArray(paper.contributors) ? (
                  <div className="grid gap-4">
                    {(paper.contributors as any[]).map((contributor, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-start gap-3">
                          <User className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-medium">{contributor.fullName}</h4>
                            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Mail className="h-3 w-3" />
                                <span>{contributor.email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3" />
                                <span>{contributor.contactNumber}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Building className="h-3 w-3" />
                                <span>{contributor.affiliation}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No authors information available</p>
                )}
              </div>

              <Separator />

              {/* Point of Contact Section */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Point of Contact</h3>
                {paper.pointOfContact && typeof paper.pointOfContact === 'object' ? (
                  <div className="border rounded-lg p-4 bg-amber-50">
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium">{(paper.pointOfContact as any).fullName}</h4>
                        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            <span>{(paper.pointOfContact as any).email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            <span>{(paper.pointOfContact as any).contactNumber}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Building className="h-3 w-3" />
                            <span>{(paper.pointOfContact as any).affiliation}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No point of contact information available</p>
                )}
              </div>

              <Separator />

              {/* Files Section */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Files</h3>
                <div className="space-y-3">
                  {/* Paper File */}
                  <div className="border rounded-lg p-4 bg-blue-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <h4 className="font-medium">Research Paper</h4>
                          <p className="text-sm text-muted-foreground">Main manuscript file</p>
                        </div>
                      </div>
                      {paper.filePath && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(paper.filePath, `${paper.paperId}_paper.pdf`)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Corresponding File */}
                  {paper.correspondingFile && (
                    <div className="border rounded-lg p-4 bg-green-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Archive className="h-5 w-5 text-green-600" />
                          <div>
                            <h4 className="font-medium">Corresponding File</h4>
                            <p className="text-sm text-muted-foreground">Additional supporting files</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(paper.correspondingFile!, `${paper.paperId}_files.zip`)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download ZIP
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Info */}
              {(paper.doi || paper.acceptedDate) && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Additional Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {paper.doi && (
                        <div>
                          <span className="font-medium">DOI:</span>
                          <p className="text-muted-foreground">{paper.doi}</p>
                        </div>
                      )}
                      {paper.acceptedDate && (
                        <div>
                          <span className="font-medium">Accepted Date:</span>
                          <p className="text-muted-foreground">
                            {format(new Date(paper.acceptedDate), "MMM dd, yyyy")}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">No paper data available</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}