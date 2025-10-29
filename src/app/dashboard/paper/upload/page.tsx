"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
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

import axios from "axios";
import { FileUpload } from "@/components/ui/file-upload";

import { useSession } from "next-auth/react";
import { uploadFileToFirebase } from "@/lib/Firebase-Action";
import { useRouter } from "next/navigation";

// Zod Schema
const contributorSchema = z.object({
  fullName: z.string().min(1, "Full Name is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  contactNumber: z.string().min(1, "Contact Number is required"),
  affiliation: z.string().min(1, "Affiliation is required"),
});

const formSchema = z.object({
  title: z
    .string()
    .min(20, "Paper Title is required (min 20 chars)")
    .max(200, "Paper Title must be less than 200 characters"),
  abstract: z
    .string()
    .min(350, "Abstract is required (min 350 chars)")
    .max(3000, "Abstract must be less than 1000 characters"),
  keywords: z.string().min(1, "Keywords are required"),
  contributors: z
    .array(contributorSchema)
    .min(1, "At least one Contributor is required"),
  pocDetails: contributorSchema, // This now directly maps to the contactInfoSchema
  file: z
    .instanceof(File)
    .refine(
      (file) => file.type === "application/pdf",
      "Only PDF files are allowed for the paper."
    )
    .refine(
      (file) => file.size <= 10 * 1024 * 1024,
      "Paper file size must be less than 10MB."
    ),
  coverLetter: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || file.type === "application/pdf",
      "Only PDF files are allowed for the cover letter."
    )
    .refine(
      (file) => !file || file.size <= 10 * 1024 * 1024,
      "Cover letter file size must be less than 10MB."
    )
    .nullable(), // Allows undefined (optional) or null
});

export default function MultiPagePaperUpload() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const totalSteps = 6;
  const router = useRouter();
  const { data: session } = useSession();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    trigger,
    formState: { errors },
    reset, // Added reset for easier form clearing
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
      file: undefined, // Default to undefined for File inputs
      coverLetter: undefined, // Default to undefined for File inputs
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
  const watchCoverLetter = watch("coverLetter");

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const paperFile = data.file;
      const coverLetterFile = data.coverLetter;

      // Zod schema already handles type and size validation for files,
      // so explicit checks here are redundant if Zod is strictly applied.
      // However, keeping them as an extra safeguard before upload if needed.
      if (!paperFile) {
        toast.error("Paper file is required.");
        setLoading(false);
        return;
      }

      // Upload paper file to Firebase (required)
      const filePath = await uploadFileToFirebase(paperFile, "papers");
      if (!filePath) {
        toast.error("Failed to upload paper file.");
        setLoading(false);
        return;
      }

      // Upload cover letter to Firebase if provided
      let coverLetterPath: string | null = null;
      if (coverLetterFile) {
        const uploadedCoverLetterPath = await uploadFileToFirebase(
          coverLetterFile,
          "cover-letters"
        );
        if (uploadedCoverLetterPath) {
          coverLetterPath = uploadedCoverLetterPath;
        } else {
          toast.error("Failed to upload cover letter. Proceeding without it.");
        }
      }

      // Prepare data for API submission
      const finalData = {
        title: data.title,
        abstract: data.abstract,
        // Convert comma-separated keywords string to array
        keywords: data.keywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
        // Pass contributors and pocDetails directly as objects (Axios will stringify them)
        contributors: data.contributors,
        pointOfContact: data.pocDetails,
        filePath: filePath, // The URL/ID from Firebase
        coverLetterPath: coverLetterPath, // The URL/ID from Firebase, or null
        authorId: session?.user?.id || null, // Ensure authorId is null if not authenticated
      };
      console.log("final Data is ", finalData);
      // Submit data to API
      const uploadApi = await axios.post("/api/paper", finalData); // Corrected API endpoint

      if (uploadApi.status === 201) {
        // Expect 201 Created for successful POST
        toast.success("Research paper uploaded successfully!");
        reset(); // Reset form fields after successful submission
        setStep(1); // Go back to the first step
        router.push("/dashboard")
      } else {
        toast.error(`Failed to submit form. Status: ${uploadApi.status}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        const errorDetails = error.response?.data?.errors
          ? JSON.stringify(error.response.data.errors, null, 2)
          : "";
        toast.error(`Submission Error: ${errorMessage} ${errorDetails}`);
      } else {
        toast.error("An unexpected error occurred during submission.");
      }
    } finally {
      setLoading(false);
    }
  };

  const nextStep = async () => {
    let isValid = false;
    if (step === 1) {
      isValid = await trigger(["title", "abstract", "keywords"]);
    } else if (step === 2) {
      isValid = await trigger(["contributors"]);
    } else if (step === 3) {
      isValid = await trigger(["pocDetails"]);
    } else if (step === 4) {
      // Validate 'file' for requiredness and type/size
      isValid = await trigger("file");
      if (isValid && !watchFile) {
        toast.error("Paper file is required for this step.");
        isValid = false;
      }
    } else if (step === 5) {
      // Validate 'coverLetter' (optional)
      isValid = await trigger("coverLetter");
      // If coverLetter is optional, `trigger` will return true even if it's null.
      // We explicitly make it valid here to allow proceeding if it's empty.
      isValid = true;
    }

    if (isValid) {
      setStep((s) => Math.min(s + 1, totalSteps));
    } else {
      toast.error(
        "Please fill in all required fields correctly for this step."
      );
    }
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <div className="w-full md:p-9 p-4 h-fit">
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="text-white">Submitting your paper...</div>
        </div>
      )}
      <Card className="w-full h-full min-w-fit overflow-auto">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Upload Research Paper</span>
            <span className="text-sm text-muted-foreground">
              Step {step} of {totalSteps}
            </span>
          </CardTitle>
          <CardDescription>
            {step === 1 && "Enter paper details"}
            {step === 2 && "Enter contributor details"}
            {step === 3 && "Enter Point of Contact details"}
            {step === 4 && "Upload your paper file (PDF only, max 10MB)"}
            {step === 5 && "Upload your cover letter (optional)"}
            {step === 6 && "Review your submission"}
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
                {watchFile ? (
                  <p className="text-sm text-muted-foreground">
                    Selected file: {watchFile.name} (
                    {(watchFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No file selected
                  </p>
                )}
                {/* FileUpload component should handle file selection */}
                <FileUpload
                  onChange={(files) => setValue("file", files[0] || null)}
                />
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
                {watchCoverLetter ? (
                  <p className="text-sm text-muted-foreground">
                    Selected file: {watchCoverLetter.name} (
                    {(watchCoverLetter.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No cover letter selected
                  </p>
                )}
                <FileUpload
                  onChange={(files) =>
                    setValue("coverLetter", files[0] || null)
                  }
                />
                {errors.coverLetter && (
                  <p className="text-red-500">{errors.coverLetter.message}</p>
                )}
              </div>
            )}
            {step === 6 && (
              <>
                <div className="mt-6 max-w-full">
                  <h2 className="font-bold text-2xl mb-6 text-gray-800">
                    Review Submission
                  </h2>

                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    {/* Title Section */}
                    <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Manuscript Title
                      </h3>
                      <p className="text-xl font-semibold text-gray-900 leading-relaxed">
                        {watch("title") || (
                          <span className="text-gray-400 italic">
                            No title provided
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Abstract Section */}
                    <div className="border-b border-gray-200 p-6">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        Abstract
                      </h3>
                      <p className="text-gray-700 leading-relaxed text-justify">
                        {watch("abstract") || (
                          <span className="text-gray-400 italic">
                            No abstract provided
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Keywords Section */}
                    <div className="border-b border-gray-200 p-6">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        Keywords
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {watch("keywords")
                          .split(",")
                          .map((k: any) => k.trim())
                          .filter(Boolean).length > 0 ? (
                          watch("keywords")
                            .split(",")
                            .map((k: any) => k.trim())
                            .filter(Boolean)
                            .map((keyword: string, index: number) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200"
                              >
                                {keyword}
                              </span>
                            ))
                        ) : (
                          <span className="text-gray-400 italic">
                            No keywords provided
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Contributors Section */}
                    <div className="border-b border-gray-200 p-6">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        Contributors
                      </h3>
                      {watch("contributors") &&
                      watch("contributors").length > 0 ? (
                        <div className="space-y-4">
                          {watch("contributors").map(
                            (contributor: z.infer<typeof contributorSchema>, index: number) => (
                              <div
                                key={index}
                                className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <p className="font-semibold text-gray-900 text-lg">
                                      {contributor.fullName ||
                                        "Unnamed Contributor"}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                      {contributor.email || (
                                        <span className="text-gray-400 italic">
                                          No email
                                        </span>
                                      )}
                                    </p>
                                    {contributor.affiliation && (
                                      <p className="text-sm text-gray-500 mt-1 flex items-center">
                                        <svg
                                          className="w-4 h-4 mr-1"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                          />
                                        </svg>
                                        {contributor.affiliation}
                                      </p>
                                    )}
                                    {contributor.contactNumber && (
                                      <span className="inline-block mt-2 px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                        {contributor.contactNumber}
                                      </span>
                                    )}
                                  </div>
                                  
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-400 italic">
                          No contributors added
                        </p>
                      )}
                    </div>

                    {/* Point of Contact Section */}
                    <div className="border-b border-gray-200 p-6">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        Point of Contact
                      </h3>
                      {watch("pocDetails") ? (
                        <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <svg
                                className="w-6 h-6 text-amber-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                            </div>
                            <div className="ml-3 flex-1">
                              <p className="font-semibold text-gray-900">
                                {watch("pocDetails").fullName || "Unnamed Contact"}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {watch("pocDetails").email || (
                                  <span className="text-gray-400 italic">
                                    No email
                                  </span>
                                )}
                              </p>
                              {watch("pocDetails").contactNumber && (
                                <p className="text-sm text-gray-600 mt-1 flex items-center">
                                  <svg
                                    className="w-4 h-4 mr-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                    />
                                  </svg>
                                  {watch("pocDetails").contactNumber}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-400 italic">
                          No point of contact provided
                        </p>
                      )}
                    </div>

                    {/* Files Section */}
                    <div className="p-6 bg-gray-50">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        Attached Files
                      </h3>
                      <div className="space-y-3">
                        {watchFile ? (
                          <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                            <div className="flex-shrink-0">
                              <svg
                                className="w-8 h-8 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                            </div>
                            <div className="ml-3 flex-1">
                              <p className="font-medium text-gray-900">
                                Manuscript File
                              </p>
                              <p className="text-sm text-gray-600">
                                {watchFile.name}
                              </p>
                            </div>
                            <span className="flex-shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Attached
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
                            <div className="flex-shrink-0">
                              <svg
                                className="w-8 h-8 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <p className="font-medium text-gray-500">
                                No manuscript file attached
                              </p>
                            </div>
                          </div>
                        )}

                        {watchCoverLetter ? (
                          <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                            <div className="flex-shrink-0">
                              <svg
                                className="w-8 h-8 text-purple-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                            <div className="ml-3 flex-1">
                              <p className="font-medium text-gray-900">
                                Cover Letter
                              </p>
                              <p className="text-sm text-gray-600">
                                {watchCoverLetter.name}
                              </p>
                            </div>
                            <span className="flex-shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Attached
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
                            <div className="flex-shrink-0">
                              <svg
                                className="w-8 h-8 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <p className="font-medium text-gray-500">
                                No cover letter attached
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
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
            disabled={step === 1}
          >
            Previous
          </Button>
          {step < totalSteps ? (
            <Button onClick={nextStep} type="button">
              Next
            </Button>
          ) : (
            <Button
              type="submit"
              formMethod="post"
              onClick={handleSubmit(onSubmit)}
              disabled={loading} // Disable button when loading
            >
              {loading ? "Submitting..." : "Submit"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
