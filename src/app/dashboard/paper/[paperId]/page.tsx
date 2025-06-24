"use client";

import { useEffect, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { ref, deleteObject } from "firebase/storage";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";

import { Progress } from "@/components/ui/progress";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import axios from "axios";
import { FileUpload } from "@/components/ui/file-upload";
import storage from "@/lib/firebase"; // Assuming this is correctly configured
import { getDownloadURL, uploadBytes } from "firebase/storage";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation"; // Import useParams for dynamic routes
import { ResearchPaper } from "@prisma/client";
import deleteFileByDownloadURL from "@/lib/deleteTOFirebase";
import uploadFileToFirebase from "@/lib/uploadToFirebase";

// Zod Schema (remains the same as it defines the structure)
const contributorSchema = z.object({
  fullName: z.string().min(1, "Full Name is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  contactNumber: z.string().min(1, "Contact Number is required"),
  affiliation: z.string().min(1, "Affiliation is required"),
});

const formSchema = z.object({
  title: z.string().min(1, "Paper Title is required"),
  abstract: z.string().min(1, "Abstract is required"),
  keywords: z.string().min(1, "Keywords are required"),
  contributors: z
    .array(contributorSchema)
    .min(1, "At least one Contributor is required"),
  pocDetails: contributorSchema,
  file: z
    .instanceof(File)
    .refine(
      (file) => !file || file.type === "application/pdf",
      "Only PDF files are allowed"
    )
    .nullable(),
  coverLetter: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || file.type === "application/pdf",
      "Only PDF files are allowed"
    )
    .nullable(),
});

// Define the type for the fetched paper data (adjust based on your API response)
interface PaperData {
  id: string;
  title: string;
  abstract: string;
  keywords: string[]; // Assuming keywords come as a comma-separated string from API
  contributors: {
    fullName: string;
    email: string;
    contactNumber: string;
    affiliation: string;
  }[];
  pointOfContact: {
    fullName: string;
    email: string;
    contactNumber: string;
    affiliation: string;
  };
  submittedAt: string | null;
  filePath: string | null;
  coverLetterPath: string | null;
  authorId: string | null;
}

export default function MultiPagePaperUpdate() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const totalSteps = 6; // Updated total steps
  const [paperData, setPaperData] = useState<PaperData | null>(null);

  const { data: session } = useSession();
  const params = useParams(); // Get dynamic route parameters
  const paperId = params.paperId as string; // Assuming paperId is passed in the URL

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    trigger,
    reset, // Added reset to clear form or set defaults
    formState: { errors, isSubmitting }, // Added isSubmitting for button state
  } = useForm({
    resolver: zodResolver(formSchema),
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
      file: null, // Default to null for file inputs
      coverLetter: null, // Default to null for file inputs
    },
  });

  const {
    fields: contributorFields,
    append: appendContributor,
    remove: removeContributor,
    replace: replaceContributors, // Added replace to set all contributors
  } = useFieldArray({
    control,
    name: "contributors",
  });

  const watchFile = watch("file");
  const watchCoverLetter = watch("coverLetter");

  // State to store existing file names for display
  const [existingPaperFileName, setExistingPaperFileName] = useState<
    string | null
  >(null);
  const [existingCoverLetterFileName, setExistingCoverLetterFileName] =
    useState<string | null>(null);

  // --- useEffect to fetch existing paper data ---
  useEffect(() => {
    if (!paperId) return; // Don't fetch if no paperId

    const fetchPaperData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/paper/${paperId}`); // Adjust your API endpoint
        if (response.status !== 200) {
          toast.error("Failed to fetch paper data.");
          setLoading(false);
          return;
        }

        setPaperData(response.data);
        //console.log("Fetched Paper Data:", response.data);

        // Set form values only if paperData is not null
        const pd = response.data;
        if (pd) {
          setValue("title", pd.title);
          setValue("abstract", pd.abstract);
          setValue("keywords", pd.keywords.join(",")); // keywords is already a string
          setValue("pocDetails", {
            fullName: pd.pointOfContact?.fullName || "",
            email: pd.pointOfContact?.email || "",
            contactNumber: pd.pointOfContact?.contactNumber || "",
            affiliation: pd.pointOfContact?.affiliation || "",
          });

          // For contributors, replace the field array
          replaceContributors(
            Array.isArray(pd.contributors) ? pd.contributors : []
          );

          // Store existing file names for display
          if (pd.filePath) {
            setExistingPaperFileName(pd.filePath || null);
          }
          if (pd.coverLetterPath) {
            setExistingCoverLetterFileName(pd.coverLetterPath || null);
          }
        }
      } catch (error) {
        console.error("Error fetching paper data:", error);
        toast.error("Failed to fetch paper data.");
      } finally {
        setLoading(false);
      }
    };

    fetchPaperData();
  }, [paperId, setValue, replaceContributors]); // Re-fetch if paperId or setValue/replaceContributors change

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const paperFile = data.file;
      const coverLetterFile = data.coverLetter;

      // File validation (remains the same)
      if (paperFile && paperFile.type !== "application/pdf") {
        toast.error("Only PDF files are allowed for the paper.");
        setLoading(false);
        return;
      }
      if (paperFile && paperFile.size > 10 * 1024 * 1024) {
        toast.error("Paper file size exceeds 10MB limit.");
        setLoading(false);
        return;
      }

      if (coverLetterFile && coverLetterFile.type !== "application/pdf") {
        toast.error("Only PDF files are allowed for the cover letter.");
        setLoading(false);
        return;
      }
      if (coverLetterFile && coverLetterFile.size > 10 * 1024 * 1024) {
        toast.error("Cover letter file size exceeds 10MB limit.");
        setLoading(false);
        return;
      }

      const finalData: {
        title: string;
        abstract: string;
        keywords: string[];
        contributors: typeof data.contributors;
        pointOfContact: typeof data.pocDetails;
        filePath: string | null;
        coverLetterPath: string | null;
        authorId: string | null;
      } = {
        title: data.title,
        abstract: data.abstract,
        keywords: data.keywords.split(",").map((k: any) => k.trim()),
        contributors: data.contributors,
        pointOfContact: data.pocDetails,
        filePath: existingPaperFileName, // Start with existing file path
        coverLetterPath: existingCoverLetterFileName, // Start with existing cover letter path
        authorId: session?.user?.id || null, // Ensure authorId is passed
      };
      if (paperFile) {
        // If a new file is selected, delete the previous file
        if (paperData?.filePath) {
          await deleteFileByDownloadURL(paperData.filePath);
        }

        // Upload the new paper file with the desired path structure
        const fileUrl = await uploadFileToFirebase(paperFile, "papers");
        if (fileUrl) {
          finalData.filePath = fileUrl;
        } else {
          setLoading(false);
          return;
        }
      }

      // --- Cover Letter File Handling ---
      if (coverLetterFile) {
        // If a new cover letter is selected, delete the previous one
        if (paperData?.coverLetterPath) {
         await deleteFileByDownloadURL(paperData.coverLetterPath);
        }

        const coverLetterUrl = await uploadFileToFirebase(
          coverLetterFile,
          "cover-letters",
        );
        if (coverLetterUrl) {
          finalData.coverLetterPath = coverLetterUrl;
        } else {
          setLoading(false);
          return;
        }
      }

      // --- API call to update the paper ---
      const updateApi = await axios.put(`/api/paper/${paperId}`, finalData); // Use PUT/PATCH
      if (updateApi.status !== 200) {
        toast.error("Failed to update paper.");
        setLoading(false);
        return;
      }

      toast.success("Paper updated successfully!");
    
    } catch (error) {
      console.error("Error updating paper:", error);
      toast.error("Failed to update paper.");
    } finally {
      setLoading(false);
      // Reset form to initial state after submission
      reset()
    }
  };



  const nextStep = async () => {
    let isValid = false;
    // Trigger validation for the current step's fields
    if (step === 1) {
      isValid = await trigger(["title", "abstract", "keywords"]);
    } else if (step === 2) {
      isValid = await trigger(["contributors"]);
    } else if (step === 3) {
      isValid = await trigger(["pocDetails"]);
    } else if (step === 4) {
      isValid = await trigger(["file"]);
    } else if (step === 5) {
      isValid = await trigger(["coverLetter"]);
      isValid = isValid || true; // Cover letter is optional, so always allow
    }

    if (isValid) {
      setStep((s) => Math.min(s + 1, totalSteps));
    } else {
      toast.error("Please fill in all required fields for this step.");
    }
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <div className="w-full h-fit md:p-9 p-4 min-h-fit">
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="text-white">Loading...</div>
        </div>
      )}
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Update Research Paper</span> {/* Changed Title */}
            <span className="text-sm text-muted-foreground">
              Step {step} of {totalSteps}
            </span>
          </CardTitle>
          <CardDescription>
            {step === 1 && "Edit paper details"}
            {step === 2 && "Edit contributor details"}
            {step === 3 && "Edit Point of Contact details"}
            {step === 4 &&
              "Upload new paper file (PDF only, max 10MB) or keep existing"}
            {step === 5 &&
              "Upload new cover letter (optional) or keep existing"}
            {step === 6 && "Review your updated submission"}
          </CardDescription>
          <Progress value={(step / totalSteps) * 100} className="mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid w-full items-center gap-4"
          >
            {step === 1 && (
              <>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="title">Paper Title</Label>
                  <Input
                    id="title"
                    placeholder="Title of your Paper"
                    {...register("title")}
                  />
                  {errors.title && (
                    <p className="text-red-500">{errors.title.message}</p>
                  )}
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="abstract">Abstract</Label>
                  <Textarea
                    id="abstract"
                    placeholder="Abstract of your Paper"
                    className="h-52"
                    {...register("abstract")}
                  />
                  {errors.abstract && (
                    <p className="text-red-500">{errors.abstract.message}</p>
                  )}
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="keywords">Keywords</Label>
                  <Input
                    id="keywords"
                    placeholder="Add keywords (, separated)"
                    {...register("keywords")}
                  />
                  {errors.keywords && (
                    <p className="text-red-500">{errors.keywords.message}</p>
                  )}
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <div className="flex flex-col space-y-1.5">
                  <Label>Contributors</Label>
                  {contributorFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="border p-4 rounded-md space-y-2 relative"
                    >
                      <h4 className="font-semibold mb-2">
                        Contributor #{index + 1}
                      </h4>
                      <div className="flex flex-col space-y-1.5">
                        <Label htmlFor={`contributors.${index}.fullName`}>
                          Full Name
                        </Label>
                        <Input
                          id={`contributors.${index}.fullName`}
                          placeholder="Contributor Full Name"
                          {...register(`contributors.${index}.fullName`)}
                        />
                        {errors.contributors?.[index]?.fullName && (
                          <p className="text-red-500">
                            {errors.contributors[index].fullName.message}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col space-y-1.5">
                        <Label htmlFor={`contributors.${index}.email`}>
                          Email
                        </Label>
                        <Input
                          id={`contributors.${index}.email`}
                          type="email"
                          placeholder="Contributor Email"
                          {...register(`contributors.${index}.email`)}
                        />
                        {errors.contributors?.[index]?.email && (
                          <p className="text-red-500">
                            {errors.contributors[index].email.message}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col space-y-1.5">
                        <Label htmlFor={`contributors.${index}.contactNumber`}>
                          Contact Number
                        </Label>
                        <Input
                          id={`contributors.${index}.contactNumber`}
                          placeholder="Contributor Contact Number"
                          {...register(`contributors.${index}.contactNumber`)}
                        />
                        {errors.contributors?.[index]?.contactNumber && (
                          <p className="text-red-500">
                            {errors.contributors[index].contactNumber.message}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col space-y-1.5">
                        <Label htmlFor={`contributors.${index}.affiliation`}>
                          Affiliation
                        </Label>
                        <Input
                          id={`contributors.${index}.affiliation`}
                          placeholder="Contributor Affiliation"
                          {...register(`contributors.${index}.affiliation`)}
                        />
                        {errors.contributors?.[index]?.affiliation && (
                          <p className="text-red-500">
                            {errors.contributors[index].affiliation.message}
                          </p>
                        )}
                      </div>
                      {contributorFields.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => removeContributor(index)}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      appendContributor({
                        fullName: "",
                        email: "",
                        contactNumber: "",
                        affiliation: "",
                      })
                    }
                  >
                    Add Contributor
                  </Button>
                  {errors.contributors && (
                    <p className="text-red-500">
                      {errors.contributors.message}
                    </p>
                  )}
                </div>
              </>
            )}
            {step === 3 && (
              <>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="pocFullName">
                    Point of Contact Full Name
                  </Label>
                  <Input
                    id="pocFullName"
                    placeholder="Full Name"
                    {...register("pocDetails.fullName")}
                  />
                  {errors.pocDetails?.fullName && (
                    <p className="text-red-500">
                      {errors.pocDetails?.fullName.message}
                    </p>
                  )}
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="pocEmail">Point of Contact Email</Label>
                  <Input
                    id="pocEmail"
                    type="email"
                    placeholder="Email Address"
                    {...register("pocDetails.email")}
                  />
                  {errors.pocDetails?.email && (
                    <p className="text-red-500">
                      {errors.pocDetails?.email.message}
                    </p>
                  )}
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="pocContactNumber">
                    Point of Contact Contact Number
                  </Label>
                  <Input
                    id="pocContactNumber"
                    placeholder="Contact Number"
                    {...register("pocDetails.contactNumber")}
                  />
                  {errors.pocDetails?.contactNumber && (
                    <p className="text-red-500">
                      {errors.pocDetails?.contactNumber.message}
                    </p>
                  )}
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="pocAffiliation">
                    Point of Contact Affiliation
                  </Label>
                  <Input
                    id="pocAffiliation"
                    placeholder="Affiliation"
                    {...register("pocDetails.affiliation")}
                  />
                  {errors.pocDetails?.affiliation && (
                    <p className="text-red-500">
                      {errors.pocDetails?.affiliation.message}
                    </p>
                  )}
                </div>
              </>
            )}
            {step === 4 && (
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="file">
                  Upload Paper File (only pdf max-10mb)
                </Label>
                {existingPaperFileName && !watchFile ? ( // Display existing file name if no new file selected
                  <p className="text-sm text-muted-foreground">
                    **Current file:** {existingPaperFileName}
                  </p>
                ) : null}
                {watchFile ? (
                  <p className="text-sm text-muted-foreground">
                    Selected new file: {watchFile.name} (
                    {(watchFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No new file selected. Keep existing file or upload a new
                    one.
                  </p>
                )}
                {watchFile && (
                  <p className="text-green-600 text-xs">
                    If you upload another file, the previous one will be
                    replaced.
                  </p>
                )}
                <FileUpload onChange={(files) => setValue("file", files[0])} />
                {errors.file && (
                  <p className="text-red-500">{errors.file.message}</p>
                )}
              </div>
            )}
            {step === 5 && (
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="coverLetter">
                  Upload Cover Letter (Optional, only pdf max-10mb)
                </Label>
                {existingCoverLetterFileName && !watchCoverLetter ? (
                  <p className="text-sm text-muted-foreground">
                    **Current file:** {existingCoverLetterFileName}
                  </p>
                ) : null}
                {watchCoverLetter ? (
                  <p className="text-sm text-muted-foreground">
                    Selected new file: {watchCoverLetter.name} (
                    {(watchCoverLetter.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No new cover letter selected. Keep existing or upload a new
                    one.
                  </p>
                )}
                {watchCoverLetter && (
                  <p className="text-green-600 text-xs">
                    If you upload another file, the previous one will be
                    replaced.
                  </p>
                )}
                <FileUpload
                  onChange={(files) => setValue("coverLetter", files[0])}
                />
                {errors.coverLetter && (
                  <p className="text-red-500">{errors.coverLetter.message}</p>
                )}
              </div>
            )}
            {step === 6 && (
              <>
                <div className="mt-4 max-w-full">
                  <h2 className="font-bold text-lg mb-2">Review Submission</h2>
                  <pre className="bg-muted p-2 rounded text-sm max-w-full overflow-x-auto whitespace-pre-wrap ">
                    {JSON.stringify(
                      {
                        title: watch("title"),
                        abstract: watch("abstract"),
                        keywords: watch("keywords"),
                        contributors: watch("contributors"),
                        pointOfContact: watch("pocDetails"),
                        fileName: watchFile?.name || existingPaperFileName, // Show new or existing file name
                        coverLetterName:
                          watchCoverLetter?.name || existingCoverLetterFileName, // Show new or existing file name
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
              </>
            )}
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            type="button"
            disabled={step === 1 || isSubmitting}
          >
            Previous
          </Button>
          {step < totalSteps ? (
            <Button onClick={nextStep} type="button" disabled={isSubmitting}>
              Next
            </Button>
          ) : (
            <Button
              type="submit"
              formMethod="post"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting} // Disable while submitting
            >
              {isSubmitting ? "Updating..." : "Update Paper"}{" "}
              {/* Change button text */}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
