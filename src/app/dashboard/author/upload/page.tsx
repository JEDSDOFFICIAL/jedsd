"use client";
import React, { useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  CloudUpload,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trash2,
  UploadCloud,
  User,
  Users,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { FileUpload } from "@/components/ui/file-upload";
import { uploadFileToFirebase } from "@/lib/Firebase-Action";

/* -------------------------------------------------------------------------- */
/* Validation                                                                 */
/* -------------------------------------------------------------------------- */

const contributorSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  email: z.string().trim().email("Enter a valid email address"),
  contactNumber: z.string().trim().min(1, "Contact number is required"),
  affiliation: z.string().trim().min(1, "Affiliation is required"),
});

const formSchema = z.object({
  title: z
    .string()
    .trim()
    .min(20, "Title must contain at least 20 characters")
    .max(200, "Title must be less than 200 characters"),
  abstract: z
    .string()
    .trim()
    .min(350, "Abstract must contain at least 350 characters")
    .max(3000, "Abstract must be less than 3000 characters"),
  keywords: z.string().trim().min(1, "Add at least one keyword"),
  contributors: z
    .array(contributorSchema)
    .min(1, "At least one contributor is required"),
  pocDetails: contributorSchema,
  file: z
    .instanceof(File, { message: "Paper PDF is required" })
    .refine((file) => file.type === "application/pdf", "Only PDF files are allowed")
    .refine((file) => file.size <= 10 * 1024 * 1024, "PDF must be smaller than 10 MB"),
  coverLetter: z
    .instanceof(File, { message: "Invalid cover letter" })
    .refine((file) => file.type === "application/pdf", "Only PDF files are allowed")
    .refine((file) => file.size <= 10 * 1024 * 1024, "PDF must be smaller than 10 MB")
    .optional()
    .nullable(),
});

type FormValues = z.infer<typeof formSchema>;

const STEPS = [
  {
    id: 1,
    label: "Manuscript",
    description: "Title, abstract & keywords",
    icon: BookOpen,
  },
  {
    id: 2,
    label: "Authors",
    description: "Research contributors",
    icon: Users,
  },
  {
    id: 3,
    label: "Contact",
    description: "Point of contact",
    icon: User,
  },
  {
    id: 4,
    label: "Manuscript PDF",
    description: "Required document",
    icon: FileText,
  },
  {
    id: 5,
    label: "Cover Letter",
    description: "Optional document",
    icon: Mail,
  },
  {
    id: 6,
    label: "Review",
    description: "Confirm & submit",
    icon: CheckCircle2,
  },
] as const;

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;

  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600 animate-in fade-in slide-in-from-top-1">
      <X className="h-3.5 w-3.5" />
      {children}
    </p>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  icon: Icon,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: React.ElementType;
}) {
  return (
    <div className="mb-7">
      <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 shadow-sm backdrop-blur">
        <Icon className="h-3.5 w-3.5 text-indigo-600" />
        {eyebrow}
      </div>
      <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
        {title}
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function FormField({
  label,
  required = true,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <Label className="text-sm font-semibold text-slate-800">
          {label}
          {required && <span className="ml-1 text-indigo-600">*</span>}
        </Label>
        {hint && <span className="text-[11px] text-slate-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function inputClass(hasError?: boolean) {
  return [
    "h-12 rounded-xl border bg-white/80 px-4 text-sm shadow-sm transition-all duration-200",
    "placeholder:text-slate-400 focus-visible:ring-4 focus-visible:ring-indigo-500/10",
    "hover:border-slate-300",
    hasError
      ? "border-red-300 focus-visible:border-red-500"
      : "border-slate-200 focus-visible:border-indigo-500",
  ].join(" ");
}

function formatFileSize(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/* -------------------------------------------------------------------------- */
/* Main component                                                             */
/* -------------------------------------------------------------------------- */

export default function MultiPagePaperUpload() {
  const router = useRouter();
  const { data: session } = useSession();

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    trigger,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onTouched",
    defaultValues: {
      title: "",
      abstract: "",
      keywords: "",
      contributors: [
        {
          fullName: "",
          email: "",
          contactNumber: "",
          affiliation: "",
        },
      ],
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

  const title = watch("title");
  const abstract = watch("abstract");
  const keywords = watch("keywords");
  const contributors = watch("contributors");
  const pocDetails = watch("pocDetails");
  const paperFile = watch("file");
  const coverLetter = watch("coverLetter");

  const progress = (step / STEPS.length) * 100;

  const keywordList = useMemo(
    () =>
      keywords
        .split(",")
        .map((keyword) => keyword.trim())
        .filter(Boolean),
    [keywords]
  );

  const currentStep = STEPS[step - 1];

  const onSubmit = async (data: FormValues) => {
    if (loading) return;

    setLoading(true);

    try {
      const filePath = await uploadFileToFirebase(data.file, "papers");

      if (!filePath) {
        toast.error("Could not upload the manuscript PDF.");
        return;
      }

      let coverLetterPath: string | null = null;

      if (data.coverLetter) {
        coverLetterPath = await uploadFileToFirebase(
          data.coverLetter,
          "cover-letters"
        );

        if (!coverLetterPath) {
          toast.error("Cover letter upload failed. Continuing without it.");
        }
      }

      const finalData = {
        title: data.title.trim(),
        abstract: data.abstract.trim(),
        keywords: data.keywords
          .split(",")
          .map((keyword) => keyword.trim())
          .filter(Boolean),
        contributors: data.contributors,
        pointOfContact: data.pocDetails,
        filePath,
        coverLetterPath,
        authorId: session?.user?.id || null,
      };

      const response = await axios.post("/api/paper", finalData);

      if (response.status === 201) {
        toast.success("Research paper submitted successfully!");
        reset();
        setStep(1);
        router.push("/dashboard");
      } else {
        toast.error(`Submission failed with status ${response.status}.`);
      }
    } catch (error) {
      console.error("Paper submission error:", error);

      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message ||
          error.message ||
          "Unable to submit your manuscript.";

        toast.error(message);
      } else {
        toast.error("An unexpected error occurred during submission.");
      }
    } finally {
      setLoading(false);
    }
  };

  const nextStep = async () => {
    let valid = false;

    if (step === 1) {
      valid = await trigger(["title", "abstract", "keywords"]);
    } else if (step === 2) {
      valid = await trigger("contributors");
    } else if (step === 3) {
      valid = await trigger("pocDetails");
    } else if (step === 4) {
      valid = await trigger("file");
    } else if (step === 5) {
      valid = true;
    }

    if (!valid) {
      toast.error("Please fix the highlighted fields before continuing.");
      return;
    }

    setStep((current) => Math.min(current + 1, STEPS.length));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const previousStep = () => {
    setStep((current) => Math.max(current - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#f7f8fc] text-slate-950">
      {/* Decorative background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-300/20 blur-3xl" />
        <div className="absolute -right-32 top-1/3 h-[30rem] w-[30rem] rounded-full bg-violet-300/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-blue-200/15 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(#475569 1px, transparent 1px), linear-gradient(90deg, #475569 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {loading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-6 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-white p-7 text-center shadow-2xl">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <CloudUpload className="h-8 w-8 animate-bounce" />
            </div>
            <h3 className="text-lg font-bold text-slate-950">
              Publishing your manuscript
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Uploading your documents and securely creating the submission.
            </p>
            <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-1/2 animate-[pulse_1.2s_ease-in-out_infinite] rounded-full bg-indigo-600" />
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        {/* Header */}
        <header className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Author submission portal
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Submit your research
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Complete the guided submission in six simple steps. Your progress
              stays organized from manuscript details to final review.
            </p>
          </div>

          <div className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-white/75 px-4 py-3 text-xs text-slate-500 shadow-sm backdrop-blur sm:flex">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Secure submission
          </div>
        </header>

        {/* Progress / step navigation */}
        <div className="mb-7 overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 p-3 shadow-xl shadow-slate-200/30 backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between px-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                Submission progress
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                Step {step} of {STEPS.length}
              </p>
            </div>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
              {Math.round(progress)}%
            </span>
          </div>

          <Progress value={progress} className="mb-4 h-1.5 bg-slate-100" />

          <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
            {STEPS.map((item) => {
              const Icon = item.icon;
              const active = item.id === step;
              const completed = item.id < step;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={async () => {
                    if (item.id < step) setStep(item.id);
                  }}
                  disabled={item.id > step}
                  className={[
                    "group relative rounded-2xl p-2.5 text-left transition-all duration-300",
                    active
                      ? "bg-slate-950 text-white shadow-lg shadow-slate-900/15"
                      : completed
                        ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                        : "cursor-default text-slate-400",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={[
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105",
                        active
                          ? "bg-white/10"
                          : completed
                            ? "bg-white"
                            : "bg-slate-100",
                      ].join(" ")}
                    >
                      {completed ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </span>

                    <span className="hidden min-w-0 md:block">
                      <span className="block truncate text-xs font-bold">
                        {item.label}
                      </span>
                      <span
                        className={[
                          "mt-0.5 block truncate text-[10px]",
                          active
                            ? "text-white/60"
                            : completed
                              ? "text-indigo-500"
                              : "text-slate-400",
                        ].join(" ")}
                      >
                        {item.description}
                      </span>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main workspace */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_290px]">
   <main className="relative overflow-visible rounded-[2rem] border
    border-slate-200/80 bg-white/90 shadow-2xl shadow-slate-200/40 
    backdrop-blur-xl">
            <div className="border-b border-slate-100 bg-gradient-to-r from-white via-white to-indigo-50/50 px-5 py-6 sm:px-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
                  <currentStep.icon className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
                    {currentStep.label}
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-slate-950 sm:text-2xl">
                    {step === 1 && "Tell us about your manuscript"}
                    {step === 2 && "Add your research contributors"}
                    {step === 3 && "Set the point of contact"}
                    {step === 4 && "Upload the manuscript PDF"}
                    {step === 5 && "Add a cover letter if you have one"}
                    {step === 6 && "Everything looks ready"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {currentStep.description}
                  </p>
                </div>
              </div>
            </div>

            <form
              id="paper-submission-form"
              onSubmit={handleSubmit(onSubmit)}
              className="p-5 sm:p-8"
            >
              {/* STEP 1 */}
              {step === 1 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <SectionHeading
                    eyebrow="Step 01"
                    title="Manuscript information"
                    description="Start with the core information reviewers will use to understand your research."
                    icon={BookOpen}
                  />

                  <div className="space-y-6">
                    <FormField
                      label="Paper title"
                      hint={`${title?.length || 0}/200`}
                    >
                      <Input
                        {...register("title")}
                        placeholder="Enter a clear, descriptive title"
                        className={inputClass(Boolean(errors.title))}
                        maxLength={200}
                      />
                      <FieldError>{errors.title?.message}</FieldError>
                    </FormField>

                    <FormField
                      label="Abstract"
                      hint={`${abstract?.length || 0}/3000`}
                    >
                      <Textarea
                        {...register("abstract")}
                        placeholder="Summarize the purpose, methodology, key findings and significance of your research..."
                        className={[
                          "min-h-[260px] resize-y rounded-2xl border bg-white/80 px-4 py-3 text-sm leading-6 shadow-sm transition-all duration-200",
                          "placeholder:text-slate-400 focus-visible:ring-4 focus-visible:ring-indigo-500/10",
                          errors.abstract
                            ? "border-red-300 focus-visible:border-red-500"
                            : "border-slate-200 focus-visible:border-indigo-500",
                        ].join(" ")}
                        maxLength={3000}
                      />
                      <FieldError>{errors.abstract?.message}</FieldError>
                    </FormField>

                    <FormField
                      label="Keywords"
                      hint="Separate with commas"
                    >
                      <Input
                        {...register("keywords")}
                        placeholder="e.g. machine learning, remote sensing, urban growth"
                        className={inputClass(Boolean(errors.keywords))}
                      />
                      <FieldError>{errors.keywords?.message}</FieldError>

                      {keywordList.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {keywordList.map((keyword, index) => (
                            <span
                              key={`${keyword}-${index}`}
                              className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 transition-transform duration-200 hover:-translate-y-0.5"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      )}
                    </FormField>
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <SectionHeading
                    eyebrow="Step 02"
                    title="Research contributors"
                    description="Add every author or contributor who should be associated with this manuscript."
                    icon={Users}
                  />

                  <div className="space-y-4">
                    {contributorFields.map((field, index) => {
                      const contributorError = errors.contributors?.[index];

                      return (
                        <div
                          key={field.id}
                          className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-50/60 p-5 transition-all duration-300 hover:border-indigo-200 hover:bg-white hover:shadow-lg hover:shadow-indigo-100/30 sm:p-6"
                        >
                          <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-indigo-100/40 blur-2xl transition-transform duration-500 group-hover:scale-150" />

                          <div className="relative mb-5 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200">
                                <span className="text-sm font-black">
                                  {index + 1}
                                </span>
                              </div>
                              <div>
                                <p className="font-bold text-slate-900">
                                  Contributor {index + 1}
                                </p>
                                <p className="text-xs text-slate-500">
                                  Author information
                                </p>
                              </div>
                            </div>

                            {contributorFields.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeContributor(index)}
                                className="rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2 className="mr-1.5 h-4 w-4" />
                                Remove
                              </Button>
                            )}
                          </div>

                          <div className="relative grid gap-5 md:grid-cols-2">
                            <FormField label="Full name">
                              <Input
                                {...register(`contributors.${index}.fullName`)}
                                placeholder="Full name"
                                className={inputClass(
                                  Boolean(contributorError?.fullName)
                                )}
                              />
                              <FieldError>
                                {contributorError?.fullName?.message}
                              </FieldError>
                            </FormField>

                            <FormField label="Email">
                              <Input
                                type="email"
                                {...register(`contributors.${index}.email`)}
                                placeholder="author@example.com"
                                className={inputClass(
                                  Boolean(contributorError?.email)
                                )}
                              />
                              <FieldError>
                                {contributorError?.email?.message}
                              </FieldError>
                            </FormField>

                            <FormField label="Contact number">
                              <Input
                                {...register(
                                  `contributors.${index}.contactNumber`
                                )}
                                placeholder="+91 XXXXX XXXXX"
                                className={inputClass(
                                  Boolean(contributorError?.contactNumber)
                                )}
                              />
                              <FieldError>
                                {contributorError?.contactNumber?.message}
                              </FieldError>
                            </FormField>

                            <FormField label="Affiliation">
                              <Input
                                {...register(
                                  `contributors.${index}.affiliation`
                                )}
                                placeholder="University / Institute / Organization"
                                className={inputClass(
                                  Boolean(contributorError?.affiliation)
                                )}
                              />
                              <FieldError>
                                {contributorError?.affiliation?.message}
                              </FieldError>
                            </FormField>
                          </div>
                        </div>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() =>
                        appendContributor({
                          fullName: "",
                          email: "",
                          contactNumber: "",
                          affiliation: "",
                        })
                      }
                      className="group flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/40 px-4 py-5 text-sm font-bold text-indigo-700 transition-all duration-300 hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-lg hover:shadow-indigo-100/30"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white shadow-sm transition-transform duration-300 group-hover:rotate-90">
                        <Plus className="h-4 w-4" />
                      </span>
                      Add another contributor
                    </button>

                    <FieldError>{errors.contributors?.message}</FieldError>
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <SectionHeading
                    eyebrow="Step 03"
                    title="Point of contact"
                    description="This person will be used as the primary contact for communication about the submission."
                    icon={User}
                  />

                  <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-white to-violet-50/50 p-5 sm:p-7">
                    <div className="mb-6 flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm ring-1 ring-indigo-100">
                        <GraduationCap className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">
                          Corresponding author
                        </h3>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Make sure these details are accurate so editorial
                          communication reaches the right person.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <FormField label="Full name">
                        <Input
                          {...register("pocDetails.fullName")}
                          placeholder="Full name"
                          className={inputClass(
                            Boolean(errors.pocDetails?.fullName)
                          )}
                        />
                        <FieldError>
                          {errors.pocDetails?.fullName?.message}
                        </FieldError>
                      </FormField>

                      <FormField label="Email">
                        <Input
                          type="email"
                          {...register("pocDetails.email")}
                          placeholder="corresponding.author@example.com"
                          className={inputClass(
                            Boolean(errors.pocDetails?.email)
                          )}
                        />
                        <FieldError>
                          {errors.pocDetails?.email?.message}
                        </FieldError>
                      </FormField>

                      <FormField label="Contact number">
                        <Input
                          {...register("pocDetails.contactNumber")}
                          placeholder="+91 XXXXX XXXXX"
                          className={inputClass(
                            Boolean(errors.pocDetails?.contactNumber)
                          )}
                        />
                        <FieldError>
                          {errors.pocDetails?.contactNumber?.message}
                        </FieldError>
                      </FormField>

                      <FormField label="Affiliation">
                        <Input
                          {...register("pocDetails.affiliation")}
                          placeholder="University / Institute / Organization"
                          className={inputClass(
                            Boolean(errors.pocDetails?.affiliation)
                          )}
                        />
                        <FieldError>
                          {errors.pocDetails?.affiliation?.message}
                        </FieldError>
                      </FormField>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4 */}
              {step === 4 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <SectionHeading
                    eyebrow="Step 04"
                    title="Upload your manuscript"
                    description="Upload the final manuscript as a PDF. The maximum supported file size is 10 MB."
                    icon={UploadCloud}
                  />

                  <div className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 sm:p-8">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">
                          Manuscript PDF
                        </p>
                        <p className="text-xs text-slate-500">
                          PDF only · maximum 10 MB
                        </p>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-dashed border-indigo-200 bg-indigo-50/30 p-3 transition-all duration-300 hover:border-indigo-400 hover:bg-indigo-50/60">
                      <FileUpload
                        onChange={(files) =>
                          setValue("file", files[0], {
                            shouldValidate: true,
                            shouldTouch: true,
                          })
                        }
                      />
                    </div>

                    {paperFile && (
                      <div className="mt-5 flex items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-slate-900">
                            {paperFile.name}
                          </p>
                          <p className="mt-0.5 text-xs text-emerald-700">
                            PDF attached · {formatFileSize(paperFile.size)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setValue("file", undefined as unknown as File, {
                              shouldValidate: true,
                            })
                          }
                          className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-white hover:text-red-500"
                          aria-label="Remove manuscript"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    <FieldError>{errors.file?.message}</FieldError>
                  </div>
                </div>
              )}

              {/* STEP 5 */}
              {step === 5 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <SectionHeading
                    eyebrow="Step 05"
                    title="Cover letter"
                    description="A cover letter can provide useful context for the editorial team, but it is optional."
                    icon={Mail}
                  />

                  <div className="rounded-[2rem] border border-violet-100 bg-gradient-to-br from-violet-50/70 via-white to-indigo-50/40 p-5 sm:p-8">
                    <div className="mb-6 flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-violet-600 shadow-sm ring-1 ring-violet-100">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-slate-900">
                            Optional cover letter
                          </h3>
                          <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-violet-700">
                            Optional
                          </span>
                        </div>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          PDF only · maximum 10 MB
                        </p>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-dashed border-violet-200 bg-white/60 p-3 transition-all duration-300 hover:border-violet-400">
                      <FileUpload
                        onChange={(files) =>
                          setValue("coverLetter", files[0] || null, {
                            shouldValidate: true,
                            shouldTouch: true,
                          })
                        }
                      />
                    </div>

                    {coverLetter && (
                      <div className="mt-5 flex items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-slate-900">
                            {coverLetter.name}
                          </p>
                          <p className="mt-0.5 text-xs text-emerald-700">
                            PDF attached · {formatFileSize(coverLetter.size)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setValue("coverLetter", null, {
                              shouldValidate: true,
                            })
                          }
                          className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-white hover:text-red-500"
                          aria-label="Remove cover letter"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    <FieldError>{errors.coverLetter?.message}</FieldError>

                    <div className="mt-6 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white/70 p-4">
                      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
                      <p className="text-xs leading-5 text-slate-500">
                        No cover letter? No problem. You can continue without
                        attaching one.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6 */}
              {step === 6 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <SectionHeading
                    eyebrow="Step 06"
                    title="Review your submission"
                    description="Take a final look before sending your manuscript to the editorial system."
                    icon={CheckCircle2}
                  />

                  <div className="space-y-5">
                    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                      <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-6 text-white sm:p-8">
                        <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-indigo-200">
                          <BookOpen className="h-4 w-4" />
                          Manuscript
                        </div>
                        <h3 className="text-xl font-bold leading-8 sm:text-2xl">
                          {title || "Untitled manuscript"}
                        </h3>
                      </div>

                      <div className="space-y-0">
                        <div className="border-b border-slate-100 p-6 sm:p-7">
                          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
                            Abstract
                          </p>
                          <p className="text-sm leading-7 text-slate-600">
                            {abstract || "No abstract provided."}
                          </p>
                        </div>

                        <div className="border-b border-slate-100 p-6 sm:p-7">
                          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
                            Keywords
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {keywordList.length ? (
                              keywordList.map((keyword, index) => (
                                <span
                                  key={`${keyword}-${index}`}
                                  className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700"
                                >
                                  {keyword}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm text-slate-400">
                                No keywords provided.
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-5 xl:grid-cols-2">
                      <div className="rounded-3xl border border-slate-200 bg-slate-50/60 p-6">
                        <div className="mb-5 flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                            <Users className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900">Authors</h3>
                            <p className="text-xs text-slate-500">
                              {contributors?.length || 0} contributor
                              {contributors?.length === 1 ? "" : "s"}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {contributors?.map((contributor, index) => (
                            <div
                              key={`${contributor.email}-${index}`}
                              className="rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-black text-indigo-700">
                                  {index + 1}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-slate-900">
                                    {contributor.fullName}
                                  </p>
                                  <p className="mt-1 truncate text-xs text-slate-500">
                                    {contributor.email}
                                  </p>
                                  <p className="mt-1 text-xs text-slate-500">
                                    {contributor.affiliation}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-5">
                        <div className="rounded-3xl border border-amber-100 bg-amber-50/60 p-6">
                          <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm">
                              <User className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900">
                                Point of contact
                              </h3>
                              <p className="text-xs text-slate-500">
                                Corresponding author
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2 rounded-2xl border border-amber-100 bg-white/80 p-4">
                            <p className="font-semibold text-slate-900">
                              {pocDetails?.fullName}
                            </p>
                            <p className="flex items-center gap-2 text-xs text-slate-500">
                              <Mail className="h-3.5 w-3.5" />
                              {pocDetails?.email}
                            </p>
                            <p className="flex items-center gap-2 text-xs text-slate-500">
                              <Phone className="h-3.5 w-3.5" />
                              {pocDetails?.contactNumber}
                            </p>
                            <p className="flex items-center gap-2 text-xs text-slate-500">
                              <MapPin className="h-3.5 w-3.5" />
                              {pocDetails?.affiliation}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-slate-50/60 p-6">
                          <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-red-600 shadow-sm">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900">
                                Documents
                              </h3>
                              <p className="text-xs text-slate-500">
                                Files attached to this submission
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3">
                              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-900">
                                  Manuscript PDF
                                </p>
                                <p className="truncate text-[11px] text-slate-500">
                                  {paperFile?.name || "Not attached"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3">
                              {coverLetter ? (
                                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                              ) : (
                                <Mail className="h-5 w-5 shrink-0 text-slate-400" />
                              )}
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-900">
                                  Cover letter
                                </p>
                                <p className="truncate text-[11px] text-slate-500">
                                  {coverLetter?.name || "Not attached · optional"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-3xl border border-emerald-200 bg-emerald-50/70 p-5">
                      <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                      <div>
                        <p className="text-sm font-bold text-emerald-900">
                          Ready to submit
                        </p>
                        <p className="mt-1 text-xs leading-5 text-emerald-700">
                          By submitting, the manuscript and provided contributor
                          information will be sent to the journal submission API.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </form>

            {/* Footer navigation */}
            {/* Footer navigation */}
<div className="sticky bottom-0 z-30 border-t border-slate-200 bg-white/95 p-4 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-5">
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    {/* Previous */}
    <Button
      type="button"
      variant="outline"
      onClick={previousStep}
      disabled={step === 1 || loading}
      className="h-12 rounded-xl border-slate-200 bg-white px-5 font-semibold shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300"
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      Previous
    </Button>

    {/* Step indicator */}
    <div className="order-first flex items-center justify-center gap-2 text-xs text-slate-400 sm:order-none">
      <span className="hidden sm:inline">Current stage</span>

      <span className="rounded-full bg-slate-100 px-3 py-1.5 font-bold text-slate-700">
        {step}/{STEPS.length}
      </span>
    </div>

    {/* Action */}
    {step < STEPS.length ? (
      <Button
        type="button"
        onClick={nextStep}
        disabled={loading}
        className="group h-12 rounded-xl bg-slate-950 px-6 font-bold text-white shadow-lg shadow-slate-900/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-indigo-700"
      >
        Continue
        <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </Button>
    ) : (
      <Button
        type="button"
        disabled={loading}
        onClick={async () => {
          const valid = await trigger();

          if (!valid) {
            toast.error(
              "Please review the highlighted fields before submitting."
            );
            return;
          }

          handleSubmit(onSubmit)();
        }}
        className="group h-12 w-full rounded-xl bg-indigo-600 px-7 font-bold text-white shadow-lg shadow-indigo-200 transition-all duration-300 hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-indigo-300 sm:w-auto"
      >
        {loading ? (
          <>
            <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            Submit manuscript
            <Check className="ml-2 h-4 w-4 transition-transform group-hover:scale-110" />
          </>
        )}
      </Button>
    )}
  </div>

  {/* Final step helper */}
  {step === STEPS.length && (
    <p className="mt-2 text-center text-[11px] text-slate-400">
      Please verify your manuscript details before submitting.
    </p>
  )}
</div>
          </main>

          {/* Desktop side panel */}
          <aside className="hidden lg:block">
            <div className="sticky top-6 space-y-4">
              <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/85 p-5 shadow-xl shadow-slate-200/30 backdrop-blur-xl">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Submission guide
                    </p>
                    <p className="text-xs text-slate-500">
                      You are on step {step}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {STEPS.map((item) => {
                    const Icon = item.icon;
                    const active = item.id === step;
                    const completed = item.id < step;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        disabled={item.id > step}
                        onClick={() => item.id < step && setStep(item.id)}
                        className={[
                          "flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-all duration-300",
                          active
                            ? "bg-slate-950 text-white shadow-lg"
                            : completed
                              ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                              : "text-slate-400",
                        ].join(" ")}
                      >
                        <span
                          className={[
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                            active
                              ? "bg-white/10"
                              : completed
                                ? "bg-white"
                                : "bg-slate-100",
                          ].join(" ")}
                        >
                          {completed ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Icon className="h-4 w-4" />
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-xs font-bold">
                            {item.label}
                          </span>
                          <span
                            className={[
                              "mt-0.5 block text-[10px]",
                              active
                                ? "text-white/60"
                                : completed
                                  ? "text-indigo-500"
                                  : "text-slate-400",
                            ].join(" ")}
                          >
                            {item.description}
                          </span>
                        </span>
                        {active && (
                          <ChevronRight className="ml-auto h-4 w-4 text-white/50" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-950 to-indigo-950 p-5 text-white shadow-xl shadow-slate-300/20">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <ShieldCheck className="h-5 w-5 text-indigo-200" />
                </div>
                <h3 className="font-bold">Before you submit</h3>
                <ul className="mt-3 space-y-2.5 text-xs leading-5 text-white/65">
                  <li>• Verify the manuscript title and abstract.</li>
                  <li>• Check every contributor's contact details.</li>
                  <li>• Make sure the manuscript PDF is the final version.</li>
                  <li>• Review everything carefully on the final step.</li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}