"use client";

import { useState } from "react";
import { useForm,  useFieldArray } from "react-hook-form";
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
import uploadFileToFirebase from "@/lib/uploadToFirebase";

// Zod Schema
const contributorSchema = z.object({
  fullName: z.string().min(1, "Full Name is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  contactNumber: z.string().min(1, "Contact Number is required"),
  affiliation: z.string().min(1, "Affiliation is required"),
});

const formSchema = z.object({
  title: z.string().min(20, "Paper Title is required").max(200, "Paper Title must be less than 200 characters"),
  abstract: z.string().min(350, "Abstract is required").max(1000, "Abstract must be less than 1000 characters"),
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

export default function MultiPagePaperUpload() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const totalSteps = 6; // Updated total steps

  const { data: session } = useSession();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      abstract: "",
      keywords: "",
      contributors: [
        { fullName: "", email: "", contactNumber: "", affiliation: "" },
      ], // Default for dynamic fields
      pocDetails: {
        fullName: "",
        email: "",
        contactNumber: "",
        affiliation: "",
      },
      file: undefined,
      coverLetter: undefined,
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
        authorId: string | null; // Assuming you will add authorId later
      } = {
        title: data.title,
        abstract: data.abstract,
        keywords: data.keywords.split(",").map((k: any) => k.trim()),
        contributors: data.contributors,
        pointOfContact: data.pocDetails,
        filePath: null,
        coverLetterPath: null,
        authorId: null, // You can set this to the logged-in user's ID later
      };
        // Assuming paperData.submittedAt is always available for an update operation

      if (paperFile) {
        const fileId = await uploadFileToFirebase(paperFile, "papers");
        finalData.filePath = fileId;
      if (coverLetterFile) {
        const coverLetterId = await uploadFileToFirebase(
          coverLetterFile,
          "cover-letters"
        );
        finalData.coverLetterPath = coverLetterId;
      }
      // Make sure to set authorId if you have user authentication
      if (session?.user?.id) {
        finalData.authorId = session.user.id;
      }

      const uploadApi = await axios.post("/api/paper/", finalData);
      if (uploadApi.status !== 200) {
        toast.error("Failed to submit form");
        setLoading(false);
        return;
      }
      console.log("Form data submitted:", uploadApi.data);
        return;
      }

      toast.success("Form submitted successfully!");
      
      
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to submit form");
    } finally {
      setLoading(false);
      setStep(1);
      setValue("title", "");
      setValue("abstract", "");
      setValue("keywords", "");
      setValue("contributors", [
        { fullName: "", email: "", contactNumber: "", affiliation: "" },
      ]);
      setValue("pocDetails", {
        fullName: "",
        email: "",
        contactNumber: "",
        affiliation: "",
      });
      setValue("file", null);
      setValue("coverLetter", null);
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
      isValid = await trigger(["file"]);
      // Allow moving to next step even if cover letter is not uploaded (optional field)
    } else if (step === 5) {
      isValid = await trigger(["coverLetter"]);
      isValid = isValid || true; // Allow moving to next step even if cover letter is not uploaded (optional field)
      // Allow moving to next step even if cover letter is not uploaded (optional field)
    }

    if (isValid) {
      setStep((s) => Math.min(s + 1, totalSteps));
    } else {
      toast.error("Please fill in all required fields for this step.");
    }
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <div className="w-full md:p-9 p-4 h-fit">
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="text-white">Loading...</div>
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
                {watchFile && (
                  <>
                    <p className="text-green-600 text-xs">
                      One file is selected already. If you upload another file,
                      the previous one will be replaced.
                    </p>
                    <FileUpload
                      onChange={(files) => setValue("file", files[0])}
                    />
                  </>
                )}

                {!watchFile && (
                  <FileUpload
                    onChange={(files) => setValue("file", files[0])}
                  />
                )}
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
                {watchCoverLetter && (
                  <>
                    <p className="text-green-600 text-xs">
                      One file is selected already. If you upload another file,
                      the previous one will be replaced.
                    </p>
                    <FileUpload
                      onChange={(files) => setValue("coverLetter", files[0])}
                    />
                  </>
                )}

                {!watchCoverLetter && (
                  <FileUpload
                    onChange={(files) => setValue("coverLetter", files[0])}
                  />
                )}
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
                        fileName: watchFile?.name,
                        coverLetterName: watchCoverLetter?.name,
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
            >
              Submit
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
