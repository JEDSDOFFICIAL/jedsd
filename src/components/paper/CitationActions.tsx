"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, Quote } from "lucide-react";
import { toast } from "react-hot-toast";

interface CitationActionsProps {
  title: string;
  authors: string;
  year: number;
  journal: string;
  volume?: number | null;
  issue?: number | null;
  doi?: string | null;
  url: string;
}

export default function CitationActions({
  title,
  authors,
  year,
  journal,
  volume,
  issue,
  doi,
  url,
}: CitationActionsProps) {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const handleCopy = (text: string, format: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(format);
    toast.success(`${format} citation copied!`);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  // Generate citations
  const apaCitation = `${authors} (${year}). ${title}. ${journal}${
    volume ? `, ${volume}` : ""
  }${issue ? `(${issue})` : ""}. ${doi ? `https://doi.org/${doi}` : url}`;

  const ieeeAuthors = authors.split(",").length > 3 
    ? authors.split(",").slice(0, 3).join(",") + " et al."
    : authors;
  
  const ieeeCitation = `${ieeeAuthors}, "${title}," ${journal}${
    volume ? `, vol. ${volume}` : ""
  }${issue ? `, no. ${issue}` : ""}, ${year}${
    doi ? `, doi: ${doi}` : ""
  }.`;

  const mlaAuthors = authors.split(",")[0];
  const mlaCitation = `${mlaAuthors}${
    authors.split(",").length > 1 ? ", et al" : ""
  }. "${title}." ${journal}${volume ? `, vol. ${volume}` : ""}${
    issue ? `, no. ${issue}` : ""
  }, ${year}${doi ? `, doi:${doi}` : ""}.`;

  const bibtexKey = `${authors.split(",")[0].split(" ").pop()?.toLowerCase() || "author"}${year}`;
  const bibtexCitation = `@article{${bibtexKey},
  title={${title}},
  author={${authors}},
  journal={${journal}},${volume ? `\n  volume={${volume}},` : ""}${
    issue ? `\n  number={${issue}},` : ""
  }
  year={${year}},${doi ? `\n  doi={${doi}},` : ""}
  url={${url}}
}`;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Quote className="h-4 w-4 mr-2" />
          Cite Article
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cite This Article</DialogTitle>
          <DialogDescription>
            Choose your preferred citation format
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="apa" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="apa">APA</TabsTrigger>
            <TabsTrigger value="ieee">IEEE</TabsTrigger>
            <TabsTrigger value="mla">MLA</TabsTrigger>
            <TabsTrigger value="bibtex">BibTeX</TabsTrigger>
          </TabsList>

          <TabsContent value="apa" className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm leading-relaxed font-mono">{apaCitation}</p>
            </div>
            <Button
              onClick={() => handleCopy(apaCitation, "APA")}
              className="w-full"
              variant="secondary"
            >
              {copiedFormat === "APA" ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy APA Citation
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="ieee" className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm leading-relaxed font-mono">{ieeeCitation}</p>
            </div>
            <Button
              onClick={() => handleCopy(ieeeCitation, "IEEE")}
              className="w-full"
              variant="secondary"
            >
              {copiedFormat === "IEEE" ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy IEEE Citation
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="mla" className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm leading-relaxed font-mono">{mlaCitation}</p>
            </div>
            <Button
              onClick={() => handleCopy(mlaCitation, "MLA")}
              className="w-full"
              variant="secondary"
            >
              {copiedFormat === "MLA" ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy MLA Citation
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="bibtex" className="space-y-4">
            <div className="bg-muted p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm font-mono">{bibtexCitation}</pre>
            </div>
            <Button
              onClick={() => handleCopy(bibtexCitation, "BibTeX")}
              className="w-full"
              variant="secondary"
            >
              {copiedFormat === "BibTeX" ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy BibTeX Citation
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
