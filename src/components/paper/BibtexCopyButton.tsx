"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Copy, Check, FileCode } from "lucide-react";
import { toast } from "react-hot-toast";

interface BibtexCopyButtonProps {
  title: string;
  authors: string;
  year: number;
  journal: string;
  volume?: number | null;
  issue?: number | null;
  doi?: string | null;
  url: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export default function BibtexCopyButton({
  title,
  authors,
  year,
  journal,
  volume,
  issue,
  doi,
  url,
  variant = "outline",
  size = "sm",
  className = "",
}: BibtexCopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  // Generate BibTeX citation key from first author's last name + year
  const bibtexKey = `${authors.split(",")[0].trim().split(" ").pop()?.toLowerCase().replace(/[^a-z]/g, "") || "author"}${year}`;
  
  // Generate BibTeX citation
  const bibtexCitation = `@article{${bibtexKey},
  title={${title}},
  author={${authors}},
  journal={${journal}},${volume ? `\n  volume={${volume}},` : ""}${
    issue ? `\n  number={${issue}},` : ""
  }
  year={${year}},${doi ? `\n  doi={${doi}},` : ""}
  url={${url}}
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(bibtexCitation);
    setCopied(true);
    toast.success("BibTeX citation copied to clipboard!");
    setTimeout(() => {
      setCopied(false);
      setOpen(false);
    }, 2000);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant={variant} size={size} className={`w-full ${className}`}>
          <FileCode className="h-4 w-4 mr-2" />
          Copy BibTeX
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[500px] p-0" align="start">
        <div className="space-y-3 p-4">
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">LaTeX BibTeX Citation</h4>
            <p className="text-xs text-muted-foreground">
              Copy this citation for use in LaTeX documents
            </p>
          </div>
          
          <div className="bg-muted p-3 rounded-lg overflow-x-auto">
            <pre className="text-xs font-mono leading-relaxed">{bibtexCitation}</pre>
          </div>

          <Button
            onClick={handleCopy}
            className="w-full"
            variant="secondary"
            size="sm"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied to Clipboard!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy BibTeX Citation
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Citation key: <code className="font-mono font-semibold">{bibtexKey}</code>
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
