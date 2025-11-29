"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { Share, Eye, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaperDetailsClientProps {
  paper: {
    title: string;
    abstract: string;
    filePath: string;
  };
}

export default function PaperDetailsClient({ paper }: PaperDetailsClientProps) {
  // Share paper
  const sharePaper = () => {
    if (navigator.share) {
      navigator.share({
        title: paper.title,
        text: paper.abstract,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = paper.filePath;
    link.download = `${paper.title}.pdf`;
    link.click();
  };

  return (
    <div className="flex gap-2 ml-4">
      <Button variant="outline" onClick={sharePaper}>
        <Share className="h-4 w-4 mr-2" />
        Share
      </Button>
      <Button onClick={() => window.open(paper.filePath, "_blank")}>
        <Eye className="h-4 w-4 mr-2" />
        View Full Paper
      </Button>
      <Button variant="outline" onClick={handleDownload}>
        <Download className="h-4 w-4 mr-2" />
        Download PDF
      </Button>
    </div>
  );
}
