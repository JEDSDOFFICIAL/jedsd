"use client";

import { toast } from "react-hot-toast";
import { Share, Download } from "lucide-react";
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
    <>
      <Button variant="outline" onClick={sharePaper} className="w-full">
        <Share className="h-4 w-4 mr-2" />
        Share
      </Button>
      <Button variant="outline" onClick={handleDownload} className="w-full">
        <Download className="h-4 w-4 mr-2" />
        Download PDF
      </Button>
    </>
  );
}
