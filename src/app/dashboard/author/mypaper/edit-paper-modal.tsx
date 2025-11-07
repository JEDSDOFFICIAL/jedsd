"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import { ResearchPaper } from "@prisma/client";
import axios from "axios";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Upload, FileIcon } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import { uploadFileToFirebase, deleteFile } from "@/lib/Firebase-Action";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";

// Zod Schema for editing (simplified without file uploads)
const contributorSchema = z.object({
  fullName: z.string().min(1, "Full Name is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  contactNumber: z.string().min(1, "Contact Number is required"),
  affiliation: z.string().min(1, "Affiliation is required"),
});

const editFormSchema = z.object({
  title: z
    .string()
    .min(20, "Paper Title is required (min 20 chars)")
    .max(200, "Paper Title must be less than 200 characters"),
  abstract: z
    .string()
    .min(350, "Abstract is required (min 350 chars)")
    .max(3000, "Abstract must be less than 3000 characters"),
  keywords: z.string().min(1, "Keywords are required"),
  contributors: z
    .array(contributorSchema)
    .min(1, "At least one Contributor is required"),
  pocDetails: contributorSchema,
  file: z
    .any()
    .optional()
    .refine(
      (file) => !file || (file instanceof File && file.type === "application/pdf"),
      "Only PDF files are allowed for the paper."
    )
    .refine(
      (file) => !file || (file instanceof File && file.size <= 10 * 1024 * 1024),
      "Paper file size must be less than 10MB."
    ),
  correspondingFile: z
    .any()
    .optional()
    .refine(
      (file) => !file || (file instanceof File &&( file.type === "application/zip" || file.type === "application/x-zip-compressed" || file.name.endsWith('.zip') )),
      "Only ZIP files are allowed for the corresponding file."
    )
    .refine(
      (file) => !file || (file instanceof File && file.size <= 50 * 1024 * 1024),
      "Corresponding file size must be less than 50MB."
    ),
});

interface EditPaperModalProps {
  paperId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditPaperModal({ paperId, isOpen, onClose, onSuccess }: EditPaperModalProps) {
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [paper, setPaper] = useState<ResearchPaper | null>(null);
  const [originalData, setOriginalData] = useState<any>(null);
  const [showPaperFileConfirm, setShowPaperFileConfirm] = useState(false);
  const [showCorrespondingFileConfirm, setShowCorrespondingFileConfirm] = useState(false);
  const [pendingPaperFile, setPendingPaperFile] = useState<File | null>(null);
  const [pendingCorrespondingFile, setPendingCorrespondingFile] = useState<File | null>(null);
  
  // Preview dialog state
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [confirmChanges, setConfirmChanges] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      title: "",
      abstract: "",
      keywords: "",
      contributors: [
        { fullName: "", email: "", contactNumber: "", affiliation: "" },
      ],
      pocDetails: {
        fullName: "",
        email: "",
        contactNumber: "",
        affiliation: "",
      },
      file: undefined,
      correspondingFile: undefined,
    },
  });

  const {
    fields: contributorFields,
    append: appendContributor,
    remove: removeContributor,
  } = useFieldArray({
    control,
    name: "contributors",
  });

  const watchFile = watch("file");
  const watchCorrespondingFile = watch("correspondingFile");

  // Fetch paper data when modal opens and paperId is provided
  useEffect(() => {
    const fetchPaperData = async () => {
      if (!paperId || !isOpen) return;
      
      setFetchingData(true);
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
        setFetchingData(false);
      }
    };

    fetchPaperData();
  }, [paperId, isOpen, onClose]);

  // Populate form when paper data is available
  useEffect(() => {
    if (paper && isOpen) {
      // Normalize contributors data structure
      const normalizeContributors = (contributors: any) => {
        if (!contributors || !Array.isArray(contributors)) {
          return [{ fullName: "", email: "", contactNumber: "", affiliation: "" }];
        }
        return contributors.map((contributor: any) => ({
          fullName: contributor.fullName || "",
          email: contributor.email || "",
          contactNumber: contributor.contactNumber || "",
          affiliation: contributor.affiliation || ""
        }));
      };

      // Normalize POC data structure
      const normalizePOC = (poc: any) => {
        if (!poc || typeof poc !== 'object') {
          return { fullName: "", email: "", contactNumber: "", affiliation: "" };
        }
        return {
          fullName: poc.fullName || "",
          email: poc.email || "",
          contactNumber: poc.contactNumber || "",
          affiliation: poc.affiliation || ""
        };
      };

      const formData = {
        title: paper.title || "",
        abstract: paper.abstract || "",
        keywords: Array.isArray(paper.keywords) ? paper.keywords.join(", ") : "",
        contributors: normalizeContributors(paper.contributors),
        pocDetails: normalizePOC(paper.pointOfContact)
      };

      // Store original data for comparison
      setOriginalData(formData);

      // Set form values
      setValue("title", formData.title);
      setValue("abstract", formData.abstract);
      setValue("keywords", formData.keywords);
      setValue("contributors", formData.contributors);
      setValue("pocDetails", formData.pocDetails);
      
      // Ensure file fields are cleared
      setValue("file", undefined);
      setValue("correspondingFile", undefined);
    }
  }, [paper, isOpen, setValue]);

  // Cleanup when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Reset all dialog states
      setShowPaperFileConfirm(false);
      setShowCorrespondingFileConfirm(false);
      setShowPreviewDialog(false);
      setPendingPaperFile(null);
      setPendingCorrespondingFile(null);
      setPreviewData(null);
      setConfirmChanges(false);
      setPaper(null);
      setOriginalData(null);
      reset();
    }
  }, [isOpen, reset]);

  // Handle file selection with confirmation
  const handlePaperFileChange = (files: File[]) => {
    if (files[0]) {
      setPendingPaperFile(files[0]);
      setShowPaperFileConfirm(true);
    }
  };

  const handleCorrespondingFileChange = (files: File[]) => {
    if (files[0]) {
      setPendingCorrespondingFile(files[0]);
      setShowCorrespondingFileConfirm(true);
    }
  };

  const confirmPaperFileUpload = () => {
    if (pendingPaperFile) {
      setValue("file", pendingPaperFile, { shouldValidate: true, shouldDirty: true });
      setShowPaperFileConfirm(false);
      setPendingPaperFile(null);
      toast.success("Paper file selected for upload");
    }
  };

  const confirmCorrespondingFileUpload = () => {
    if (pendingCorrespondingFile) {
      setValue("correspondingFile", pendingCorrespondingFile, { shouldValidate: true, shouldDirty: true });
      setShowCorrespondingFileConfirm(false);
      setPendingCorrespondingFile(null);
      toast.success("Source file selected for upload");
    }
  };

  const cancelPaperFileUpload = () => {
    setShowPaperFileConfirm(false);
    setPendingPaperFile(null);
    setValue("file", undefined);
  };

  const cancelCorrespondingFileUpload = () => {
    setShowCorrespondingFileConfirm(false);
    setPendingCorrespondingFile(null);
    setValue("correspondingFile", undefined);
  };

  // Helper function to detect changes
  const getChangedFields = (currentData: any) => {
    if (!originalData) return {};
    
    const changes: any = {};
    
    // Check basic fields
    if (currentData.title !== originalData.title) {
      changes.title = currentData.title;
    }
    
    if (currentData.abstract !== originalData.abstract) {
      changes.abstract = currentData.abstract;
    }
    
    // Check keywords
    const currentKeywords = currentData.keywords.split(",").map((k: string) => k.trim()).filter(Boolean);
    const originalKeywords = originalData.keywords.split(",").map((k: string) => k.trim()).filter(Boolean);
    
    if (JSON.stringify(currentKeywords.sort()) !== JSON.stringify(originalKeywords.sort())) {
      changes.keywords = currentKeywords;
    }
    
    // Normalize contributors to consistent JSON structure for comparison
    const normalizeContributors = (contributors: any[]) => {
      return contributors.map(contributor => ({
        fullName: contributor.fullName || "",
        email: contributor.email || "",
        contactNumber: contributor.contactNumber || "",
        affiliation: contributor.affiliation || ""
      }));
    };
    
    const currentContributorsNormalized = normalizeContributors(currentData.contributors);
    const originalContributorsNormalized = normalizeContributors(originalData.contributors);
    
    // Compare normalized contributors as JSON strings
    if (JSON.stringify(currentContributorsNormalized) !== JSON.stringify(originalContributorsNormalized)) {
      changes.contributors = currentContributorsNormalized;
    }
    
    // Normalize POC to consistent JSON structure for comparison
    const normalizePOC = (poc: any) => ({
      fullName: poc.fullName || "",
      email: poc.email || "",
      contactNumber: poc.contactNumber || "",
      affiliation: poc.affiliation || ""
    });
    
    const currentPOCNormalized = normalizePOC(currentData.pocDetails);
    const originalPOCNormalized = normalizePOC(originalData.pocDetails);
    
    // Compare normalized POC as JSON strings
    if (JSON.stringify(currentPOCNormalized) !== JSON.stringify(originalPOCNormalized)) {
      changes.pointOfContact = currentPOCNormalized;
    }
    
    return changes;
  };

  // Preview submission - shows changes before actual submission
  const handlePreviewSubmit = async (data: z.infer<typeof editFormSchema>) => {
    if (!paper) return;

    // Prevent submission if any confirmation dialogs are open
    if (showPaperFileConfirm || showCorrespondingFileConfirm) {
      toast.error("Please confirm or cancel file upload first");
      return;
    }

    // Don't process if preview is already open
    if (showPreviewDialog) {
      return;
    }

    const changedFields = getChangedFields(data);
    const hasFileChanges = (data.file && data.file instanceof File) || (data.correspondingFile && data.correspondingFile instanceof File);

    // More thorough check for no changes
    const hasFieldChanges = Object.keys(changedFields).length > 0;
    
    if (!hasFieldChanges && !hasFileChanges) {
      toast("No changes detected to save", { icon: "ℹ️" });
      return;
    }

    setPreviewData({
      changedFields,
      files: {
        paperFile: data.file instanceof File ? data.file : null,
        correspondingFile: data.correspondingFile instanceof File ? data.correspondingFile : null,
      },
      formData: data
    });
    setConfirmChanges(false);
    setShowPreviewDialog(true);
  };

 
  const onSubmit = async () => {
    if (!paper || !previewData) return;
    
    setLoading(true);
    try {
      const { changedFields, files } = previewData;
      
      // Handle file uploads
      let filePath = paper.filePath;
      let correspondingFilePath = paper.correspondingFile || null;

      // Upload new paper file if provided
      if (files.paperFile) {
        // Delete existing paper file if it exists
        if (paper.filePath) {
          try {
            await deleteFile(paper.filePath);
            console.log("Existing paper file deleted successfully");
          } catch (error) {
            console.warn("Failed to delete existing paper file:", error);
          }
        }

        const uploadedFilePath = await uploadFileToFirebase(files.paperFile, "papers");
        if (!uploadedFilePath) {
          toast.error("Failed to upload paper file.");
          setLoading(false);
          return;
        }
        filePath = uploadedFilePath;
        changedFields.filePath = filePath;
      }

      // Upload new corresponding file if provided
      if (files.correspondingFile) {
        // Delete existing corresponding file if it exists
        if (paper.correspondingFile) {
          try {
            await deleteFile(paper.correspondingFile);
            console.log("Existing corresponding file deleted successfully");
          } catch (error) {
            console.warn("Failed to delete existing corresponding file:", error);
          }
        }

        const uploadedCorrespondingPath = await uploadFileToFirebase(files.correspondingFile, "corresponding-files");
        if (!uploadedCorrespondingPath) {
          toast.error("Failed to upload Source file.");
          setLoading(false);
          return;
        }
        correspondingFilePath = uploadedCorrespondingPath;
        changedFields.correspondingFile = correspondingFilePath;
      }

      // Submit data to API using PUT method
      console.log("Sending changedFields to API:", changedFields);
      const response = await axios.put(`/api/paper/${paper.paperId}`, changedFields);

      if (response.status === 200) {
        toast.success("Paper updated successfully!");
        setShowPreviewDialog(false);
        setPreviewData(null);
        setConfirmChanges(false);
        onSuccess();
        onClose();
      } else {
        toast.error(`Failed to update paper. Status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error updating paper:", error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        toast.error(`Update Error: ${errorMessage}`);
      } else {
        toast.error("An unexpected error occurred during update.");
      }
    } finally {
      setLoading(false);
    // Reset all modal states
    setShowPreviewDialog(false);
    setPreviewData(null);
    setConfirmChanges(false);
    setPendingPaperFile(null);
    setPendingCorrespondingFile(null);
    setShowPaperFileConfirm(false);
    setShowCorrespondingFileConfirm(false);
    setPaper(null);
    setOriginalData(null);
    reset();
    }
  };

  const handleClose = () => {
    // Prevent closing if any dialogs are open
    if (showPaperFileConfirm || showCorrespondingFileConfirm || showPreviewDialog) {
      return;
    }
    
    reset();
    setPaper(null);
    setPreviewData(null);
    setConfirmChanges(false);
    setOriginalData(null);
    setValue("file", undefined);
    setValue("correspondingFile", undefined);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Edit Paper</DialogTitle>
          <DialogDescription>
            Update your paper details and files. Uploading new files will replace existing ones.
          </DialogDescription>
        </DialogHeader>
        
        {fetchingData ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading paper details...</p>
            </div>
          </div>
        ) : (
          <ScrollArea className="max-h-[70vh] pr-4">
            <form onSubmit={handleSubmit(handlePreviewSubmit)} className="space-y-6">
              {/* Paper Details Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">BASIC INFO</Badge>
                </div>
                
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Paper Title *</Label>
                    <Input
                      id="edit-title"
                      placeholder="Title of your Paper"
                      {...register("title")}
                    />
                    {errors.title && (
                      <p className="text-sm text-red-500">{errors.title.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-abstract">Abstract *</Label>
                    <Textarea
                      id="edit-abstract"
                      placeholder="Abstract of your Paper"
                      className="h-32"
                      {...register("abstract")}
                    />
                    {errors.abstract && (
                      <p className="text-sm text-red-500">{errors.abstract.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-keywords">Keywords *</Label>
                    <Input
                      id="edit-keywords"
                      placeholder="Add keywords (comma separated)"
                      {...register("keywords")}
                    />
                    {errors.keywords && (
                      <p className="text-sm text-red-500">{errors.keywords.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Contributors Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">AUTHORS</Badge>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      appendContributor({
                        fullName: "",
                        email: "",
                        contactNumber: "",
                        affiliation: "",
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Author
                  </Button>
                </div>

                <div className="space-y-4">
                  {contributorFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="border rounded-lg p-4 space-y-3 relative"
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium text-sm">Author {index + 1}</h4>
                        {contributorFields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeContributor(index)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor={`edit-contributor-${index}-name`} className="text-xs">
                            Full Name *
                          </Label>
                          <Input
                            id={`edit-contributor-${index}-name`}
                            placeholder="Full Name"
                            {...register(`contributors.${index}.fullName`)}
                          />
                          {errors.contributors?.[index]?.fullName && (
                            <p className="text-xs text-red-500">
                              {errors.contributors[index].fullName.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor={`edit-contributor-${index}-email`} className="text-xs">
                            Email *
                          </Label>
                          <Input
                            id={`edit-contributor-${index}-email`}
                            type="email"
                            placeholder="Email"
                            {...register(`contributors.${index}.email`)}
                          />
                          {errors.contributors?.[index]?.email && (
                            <p className="text-xs text-red-500">
                              {errors.contributors[index].email.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor={`edit-contributor-${index}-contact`} className="text-xs">
                            Contact Number *
                          </Label>
                          <Input
                            id={`edit-contributor-${index}-contact`}
                            placeholder="Contact Number"
                            {...register(`contributors.${index}.contactNumber`)}
                          />
                          {errors.contributors?.[index]?.contactNumber && (
                            <p className="text-xs text-red-500">
                              {errors.contributors[index].contactNumber.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor={`edit-contributor-${index}-affiliation`} className="text-xs">
                            Affiliation *
                          </Label>
                          <Input
                            id={`edit-contributor-${index}-affiliation`}
                            placeholder="Affiliation"
                            {...register(`contributors.${index}.affiliation`)}
                          />
                          {errors.contributors?.[index]?.affiliation && (
                            <p className="text-xs text-red-500">
                              {errors.contributors[index].affiliation.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {errors.contributors && (
                  <p className="text-sm text-red-500">{errors.contributors.message}</p>
                )}
              </div>

              <Separator />

              {/* Point of Contact Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">POINT OF CONTACT</Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-poc-name">Full Name *</Label>
                    <Input
                      id="edit-poc-name"
                      placeholder="Full Name"
                      {...register("pocDetails.fullName")}
                    />
                    {errors.pocDetails?.fullName && (
                      <p className="text-sm text-red-500">
                        {errors.pocDetails.fullName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-poc-email">Email *</Label>
                    <Input
                      id="edit-poc-email"
                      type="email"
                      placeholder="Email Address"
                      {...register("pocDetails.email")}
                    />
                    {errors.pocDetails?.email && (
                      <p className="text-sm text-red-500">
                        {errors.pocDetails.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-poc-contact">Contact Number *</Label>
                    <Input
                      id="edit-poc-contact"
                      placeholder="Contact Number"
                      {...register("pocDetails.contactNumber")}
                    />
                    {errors.pocDetails?.contactNumber && (
                      <p className="text-sm text-red-500">
                        {errors.pocDetails.contactNumber.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-poc-affiliation">Affiliation *</Label>
                    <Input
                      id="edit-poc-affiliation"
                      placeholder="Affiliation"
                      {...register("pocDetails.affiliation")}
                    />
                    {errors.pocDetails?.affiliation && (
                      <p className="text-sm text-red-500">
                        {errors.pocDetails.affiliation.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* File Upload Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">FILES</Badge>
                </div>

                <div className="space-y-4">
                  {/* Paper File Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-paper-file">Update Paper File (PDF, max 10MB)</Label>
                    {watchFile ? (
                      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border">
                        <FileIcon className="h-5 w-5 text-blue-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">New file selected:</p>
                          <p className="text-xs text-muted-foreground">
                            {watchFile.name} ({(watchFile.size / (1024 * 1024)).toFixed(2)} MB)
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setValue("file", undefined)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                        <FileIcon className="h-5 w-5 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground">Current file will be kept if no new file is uploaded</p>
                        </div>
                      </div>
                    )}
                    <FileUpload
                      onChange={handlePaperFileChange}
                    />
                    {errors.file && (
                      <p className="text-sm text-red-500">{String(errors.file.message)}</p>
                    )}
                  </div>

                  {/* Corresponding File Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-corresponding-file">Update Source File (ZIP, max 50MB)</Label>
                    {watchCorrespondingFile ? (
                      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border">
                        <Upload className="h-5 w-5 text-green-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">New file selected:</p>
                          <p className="text-xs text-muted-foreground">
                            {watchCorrespondingFile.name} ({(watchCorrespondingFile.size / (1024 * 1024)).toFixed(2)} MB)
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setValue("correspondingFile", undefined)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                        <Upload className="h-5 w-5 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground">
                            {paper?.correspondingFile 
                              ? "Current corresponding file will be kept if no new file is uploaded" 
                              : "No corresponding file currently uploaded"
                            }
                          </p>
                        </div>
                      </div>
                    )}
                    <FileUpload
                      onChange={handleCorrespondingFileChange}
                    />
                    {errors.correspondingFile && (
                      <p className="text-sm text-red-500">{String(errors.correspondingFile.message)}</p>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </ScrollArea>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSubmit(handlePreviewSubmit)();
            }}
            disabled={loading || fetchingData || showPaperFileConfirm || showCorrespondingFileConfirm || showPreviewDialog}
          >
            {loading ? "Updating..." : "Preview Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
      
      {/* Paper File Confirmation Dialog */}
      <AlertDialog  open={showPaperFileConfirm} onOpenChange={(open) => {
        if (!open) {
          cancelPaperFileUpload();
        }
      }}>
        <AlertDialogContent className="max-w-4xl" onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm File Upload</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the manuscript file? 
              {paper?.filePath && " This will replace the existing file."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              cancelPaperFileUpload();
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              confirmPaperFileUpload();
            }}>
              Upload
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Corresponding File Confirmation Dialog */}
      <AlertDialog open={showCorrespondingFileConfirm} onOpenChange={(open) => {
        if (!open) {
          cancelCorrespondingFileUpload();
        }
      }}>
        <AlertDialogContent className="max-w-4xl" onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm File Upload</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the corresponding file?
              {paper?.correspondingFile && " This will replace the existing file."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              cancelCorrespondingFileUpload();
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              confirmCorrespondingFileUpload();
            }}>
              Upload
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview Changes Dialog */}
      <AlertDialog open={showPreviewDialog} onOpenChange={(open) => {
        if (!open) {
          setShowPreviewDialog(false);
          setConfirmChanges(false);
          setPreviewData(null);
        }
      }}>
        <AlertDialogContent className="max-w-3xl" onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Preview Changes</AlertDialogTitle>
            <AlertDialogDescription>
              Review the changes before saving to your paper.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="max-h-96 overflow-y-auto">
            {previewData && (
              <div className="space-y-4">
                {/* Changed Fields */}
                {Object.keys(previewData.changedFields).length > 0 ? (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Field Changes:</h4>
                    <div className="space-y-2">
                      {Object.entries(previewData.changedFields).map(([key, value]) => (
                        <div key={key} className="p-3 bg-blue-50 rounded border-l-4 border-blue-200">
                          <div className="font-medium text-sm capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                          </div>
                          <div className="text-sm mt-1">
                            {/* Handle different value types for better display */}
                            {(() => {
                              if (Array.isArray(value)) {
                                // Handle contributors array
                                if (key === 'contributors') {
                                  return (
                                    <div className="space-y-2">
                                      {value.map((contributor: any, index: number) => (
                                        <div key={index} className="p-2 bg-white rounded border">
                                          <div className="font-medium text-xs">Author {index + 1}:</div>
                                          <div className="text-xs text-gray-600">
                                            {contributor.fullName} ({contributor.email})
                                            <br />
                                            Contact: {contributor.contactNumber}
                                            <br />
                                            Affiliation: {contributor.affiliation}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  );
                                }
                                // Handle keywords array
                                return value.join(', ');
                              } else if (typeof value === 'object' && value !== null) {
                                // Handle point of contact object
                                if (key === 'pointOfContact') {
                                  const poc = value as { fullName: string; email: string; contactNumber: string; affiliation: string };
                                  return (
                                    <div className="p-2 bg-white rounded border">
                                      <div className="text-xs text-gray-600">
                                        <strong>{poc.fullName}</strong> ({poc.email})
                                        <br />
                                        Contact: {poc.contactNumber}
                                        <br />
                                        Affiliation: {poc.affiliation}
                                      </div>
                                    </div>
                                  );
                                }
                                // Fallback for other objects
                                return JSON.stringify(value, null, 2);
                              } else {
                                // Handle strings and other primitives
                                return String(value);
                              }
                            })()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 rounded border">
                    <div className="text-sm text-gray-600">No field changes detected</div>
                  </div>
                )}

                {/* File Changes */}
                {(previewData.files.paperFile || previewData.files.correspondingFile) && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">File Changes:</h4>
                    <div className="space-y-2">
                      {previewData.files.paperFile && (
                        <div className="p-3 bg-green-50 rounded border-l-4 border-green-200">
                          <div className="font-medium text-sm">Paper Manuscript:</div>
                          <div className="text-sm mt-1">
                            📄 {previewData.files.paperFile.name} 
                            ({(previewData.files.paperFile.size / 1024 / 1024).toFixed(2)} MB)
                          </div>
                        </div>
                      )}
                      {previewData.files.correspondingFile && (
                        <div className="p-3 bg-green-50 rounded border-l-4 border-green-200">
                          <div className="font-medium text-sm">Corresponding File:</div>
                          <div className="text-sm mt-1">
                            📦 {previewData.files.correspondingFile.name}
                            ({(previewData.files.correspondingFile.size / 1024 / 1024).toFixed(2)} MB)
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Confirmation Checkbox */}
                <div className="flex items-center space-x-2 p-4 bg-yellow-50 rounded border border-yellow-200">
                  <Checkbox 
                    id="confirm-changes" 
                    checked={confirmChanges}
                    onCheckedChange={(checked) => setConfirmChanges(checked as boolean)}
                  />
                  <label 
                    htmlFor="confirm-changes" 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I confirm that I want to save these changes
                  </label>
                </div>
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowPreviewDialog(false);
              setConfirmChanges(false);
              setPreviewData(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSubmit();
              }}
              disabled={!confirmChanges || loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
