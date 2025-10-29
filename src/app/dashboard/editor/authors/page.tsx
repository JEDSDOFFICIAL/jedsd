"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Mail, 
  User, 
  Building, 
  Send, 
  Search, 
  FileText,
  Calendar
} from "lucide-react";
import toast from "react-hot-toast";

interface Author {
  id: string;
  name: string;
  email: string;
  affiliation?: string;
  papers: Array<{
    id: string;
    paperId: string;
    title: string;
    status: string;
    submissionDate: string;
    filePath: string;
    contributors: Array<{
      fullName: string;
      email: string;
      affiliation: string;
      contactNumber: string;
    }>;
    pointOfContact: {
      fullName: string;
      email: string;
      affiliation: string;
      contactNumber: string;
    };
  }>;
}

export default function AuthorContactPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [selectedPaper, setSelectedPaper] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/user?userType=AUTHOR");
      const data = await response.json();
      
      if (Array.isArray(data)) {
        // Fetch papers for each author
        const authorsWithPapers = await Promise.all(
          data.map(async (author) => {
            try {
              const paperResponse = await fetch(`/api/paper?authorId=${author.id}`);
              const paperData = await paperResponse.json();
              return {
                ...author,
                papers: paperData.success ? paperData.papers : [],
              };
            } catch (error) {
              console.error(`Error fetching papers for author ${author.id}:`, error);
              return { ...author, papers: [] };
            }
          })
        );
        setAuthors(authorsWithPapers);
      }
    } catch (error) {
      console.error("Error fetching authors:", error);
      toast.error("Failed to fetch authors");
    } finally {
      setLoading(false);
    }
  };

  const filteredAuthors = authors.filter(
    (author) =>
      author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      author.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (author.affiliation && author.affiliation.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sendEmail = async () => {
    if (!selectedAuthor || !emailSubject || !emailMessage) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSending(true);
      
      // Determine recipients based on selected paper
      let recipients = [selectedAuthor.email];
      let paperInfo = null;
      
      if (selectedPaper) {
        const paper = selectedAuthor.papers.find(p => p.id === selectedPaper);
        if (paper) {
          paperInfo = paper;
          // Add contributors and point of contact
          recipients.push(paper.pointOfContact.email);
          recipients.push(...paper.contributors.map(c => c.email));
          // Remove duplicates
          recipients = [...new Set(recipients)];
        }
      }

      const emailData = {
        recipients,
        subject: emailSubject,
        message: emailMessage,
        paperInfo: paperInfo ? {
          paperId: paperInfo.paperId,
          title: paperInfo.title,
        } : null,
      };

      // You would implement this API endpoint
      const response = await fetch("/api/editor/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailData),
      });

      if (response.ok) {
        toast.success("Email sent successfully");
        setEmailSubject("");
        setEmailMessage("");
        setSelectedPaper("");
        setIsDialogOpen(false);
      } else {
        toast.error("Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Error sending email");
    } finally {
      setSending(false);
    }
  };

  const openEmailDialog = (author: Author) => {
    setSelectedAuthor(author);
    setIsDialogOpen(true);
    setEmailSubject("");
    setEmailMessage("");
    setSelectedPaper("");
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading authors...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Author Contact</h1>
        <p className="text-gray-600 mt-2">
          Communicate with paper authors and contributors
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search Authors</CardTitle>
          <CardDescription>
            Find authors by name, email, or affiliation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search authors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Authors ({filteredAuthors.length})</CardTitle>
          <CardDescription>
            Click on an author to send them an email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Author</TableHead>
                <TableHead>Papers</TableHead>
                <TableHead>Latest Paper</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAuthors.map((author) => (
                <TableRow key={author.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">{author.name}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {author.email}
                        </div>
                        {author.affiliation && (
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Building className="w-3 h-3" />
                            {author.affiliation}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {author.papers.length} paper(s)
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {author.papers.length > 0 ? (
                      <div>
                        <div className="font-medium text-sm">
                          {author.papers[0].title.length > 40
                            ? `${author.papers[0].title.substring(0, 40)}...`
                            : author.papers[0].title}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(author.papers[0].submissionDate).toLocaleDateString()}
                        </div>
                        <Badge 
                          variant={
                            author.papers[0].status === "ACCEPTED" ? "default" :
                            author.papers[0].status === "REJECTED" ? "destructive" :
                            "secondary"
                          }
                          className="text-xs mt-1"
                        >
                          {author.papers[0].status}
                        </Badge>
                      </div>
                    ) : (
                      <span className="text-gray-500">No papers</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => openEmailDialog(author)}
                        className="flex items-center gap-1"
                      >
                        <Mail className="w-4 h-4" />
                        Contact
                      </Button>
                      {author.papers.length > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const latestPaper = author.papers[0];
                            window.open(latestPaper.filePath, "_blank");
                          }}
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredAuthors.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No authors found matching your search.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Send Email to {selectedAuthor?.name}
            </DialogTitle>
            <DialogDescription>
              Compose and send an email to the author and related contributors
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Paper Selection */}
            {selectedAuthor && selectedAuthor.papers.length > 0 && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="paper" className="text-right">
                  Related Paper
                </Label>
                <Select value={selectedPaper} onValueChange={setSelectedPaper}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a paper (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No specific paper</SelectItem>
                    {selectedAuthor.papers.map((paper) => (
                      <SelectItem key={paper.id} value={paper.id}>
                        {paper.paperId} - {paper.title.length > 50 
                          ? `${paper.title.substring(0, 50)}...` 
                          : paper.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Subject */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subject" className="text-right">
                Subject *
              </Label>
              <Input
                id="subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="col-span-3"
                placeholder="Email subject"
              />
            </div>

            {/* Message */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="message" className="text-right mt-2">
                Message *
              </Label>
              <Textarea
                id="message"
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                className="col-span-3 min-h-32"
                placeholder="Compose your message..."
              />
            </div>

            {/* Recipients Preview */}
            {selectedAuthor && (
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right mt-2">Recipients</Label>
                <div className="col-span-3">
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>• {selectedAuthor.email} (Author)</div>
                    {selectedPaper && (() => {
                      const paper = selectedAuthor.papers.find(p => p.id === selectedPaper);
                      if (paper) {
                        const allEmails = new Set([
                          selectedAuthor.email,
                          paper.pointOfContact.email,
                          ...paper.contributors.map(c => c.email)
                        ]);
                        return Array.from(allEmails).slice(1).map((email, idx) => (
                          <div key={idx}>• {email}</div>
                        ));
                      }
                      return null;
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={sendEmail} 
              disabled={!emailSubject || !emailMessage || sending}
              className="flex items-center gap-2"
            >
              {sending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Email
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}