"use client";
import * as React from "react";
import { useSession } from "next-auth/react";
import { MoreHorizontal, Star } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import uploadFileToFirebase from "@/lib/uploadToFirebase";
import { useState } from "react";

// --- Zod Schema for form validation
const formSchema = z.object({
  reviewText: z.string().min(10, "Review must be at least 10 characters"),
  rating: z.coerce.number().min(1).max(5),
  file: z.instanceof(File).optional(),
  reviewerStatus: z
    .enum(["ACCEPTED_FOR_PUBLICATION", "REJECTED_FOR_PUBLICATION"])
    .optional(),
  editorStatus: z.enum(["ACCEPTED_FOR_EDIT", "REJECTED_FOR_EDIT"]).optional(),
});

type ReviewFormValues = z.infer<typeof formSchema>;

// --- Star Rating Component
type StarRatingProps = {
  value: number;
  onChange: (value: number) => void;
};

function StarRating({ value, onChange }: StarRatingProps) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-6 w-6 cursor-pointer transition-colors ${
            star <= value ? "text-yellow-500" : "text-gray-300"
          }`}
          onClick={() => onChange(star)}
        />
      ))}
    </div>
  );
}

// --- Main Review Dialog Component
export default function ReviewDialogCell({ paperId }: { paperId: string }) {
  const { data: session } = useSession();
  const [actingAs, setActingAs] = useState<"REVIEWER" | "EDITOR">("REVIEWER");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = session?.user?.userType === "ADMIN";
  const isReviewer = session?.user?.userType === "REVIEWER";
  const isEditor = session?.user?.userType === "EDITOR";

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reviewText: "",
      rating: 3,
      file: undefined,
      reviewerStatus: undefined,
      editorStatus: undefined,
    },
  });

  const onSubmit = async (data: ReviewFormValues) => {
    setIsSubmitting(true);
    let uploadedUrl: string | null = null;
    const toastId = toast.loading("Submitting review...");

    try {
      if (data.file) {
        uploadedUrl = await uploadFileToFirebase(
          data.file,
          `reviews/${paperId}`
        );
      }

      const payload: any = {
        paperId,
        reviewText: data.reviewText,
        rating: data.rating,
        correspondingFile: uploadedUrl,
      };

      if (isAdmin) {
        if (actingAs === "REVIEWER")
          payload.reviewerStatus = data.reviewerStatus;
        if (actingAs === "EDITOR") payload.editorStatus = data.editorStatus;
      } else if (isReviewer) {
        payload.reviewerStatus = data.reviewerStatus;
      } else if (isEditor) {
        payload.editorStatus = data.editorStatus;
      }

      const res = await axios.post("/api/paper/review", payload);

      if (res.status === 201) {
        toast.success("Review submitted!", { id: toastId });
        form.reset();
        setIsDialogOpen(false);
      } else {
        toast.error("Failed to submit review.", { id: toastId });
      }
    } catch (err) {
      console.error("Submission error:", err);
      toast.error("An unexpected error occurred.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Write Review</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="md:min-w-[90vw] min-w-[98vw] lg:min-w-[85vw] max-w-screen h-[70vh] flex flex-col absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-700/20 rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm border border-gray-100 shadow-2xl shadow-gray-900/50">
        <DialogHeader>
          <DialogTitle className="text-black text-2xl font-medium">
            Write Review
          </DialogTitle>
          <DialogDescription className="text-black text-lg font-normal">
            Provide your comprehensive feedback and decision for the paper.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <motion.form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 p-8 max-w-2xl mx-auto bg-white shadow-lg rounded-xl overflow-y-auto flex-grow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Acting as toggle for Admin */}
            {isAdmin && (
              <div className="bg-gray-50 p-4 rounded-lg border mb-6">
                <FormLabel>Acting as:</FormLabel>
                <ToggleGroup
                  type="single"
                  value={actingAs}
                  onValueChange={(value) => {
                    if (value) setActingAs(value as "REVIEWER" | "EDITOR");
                  }}
                  className="mt-2"
                >
                  <ToggleGroupItem value="REVIEWER">Reviewer</ToggleGroupItem>
                  <ToggleGroupItem value="EDITOR">Editor</ToggleGroupItem>
                </ToggleGroup>
                <FormDescription>
                  Toggle to switch between reviewer and editor roles.
                </FormDescription>
              </div>
            )}

            <div className="space-y-6">
              {/* Detailed Review */}
              <FormField
                control={form.control}
                name="reviewText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold">
                      Detailed Review
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Write a comprehensive review (min. 10 characters)..."
                        rows={7}
                        className="resize-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      />
                    </FormControl>
                    <FormDescription>
                      Provide clear and constructive feedback for the author.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Rating and File Upload */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold">
                        Overall Rating
                      </FormLabel>
                      <FormControl>
                        <StarRating
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormDescription>
                        Rate the paper&apos;s quality from 1 (poor) to 5 (excellent).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="file"
                  render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold">
                        Attach Supporting File
                      </FormLabel>
                      <FormControl>
                        <div className="flex items-center justify-center w-full">
                          <label
                            htmlFor="dropzone-file"
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                          >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <svg
                                className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 20 16"
                              >
                                <path
                                  stroke="currentColor"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                                />
                              </svg>
                              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                <span className="font-semibold">
                                  Click to upload
                                </span>{" "}
                                or drag and drop
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                PDF only (optional)
                              </p>
                            </div>
                            <Input
                              id="dropzone-file"
                              type="file"
                              className="hidden"
                              accept="application/pdf"
                              onChange={(e) => onChange(e.target.files?.[0])}
                              {...fieldProps}
                            />
                          </label>
                        </div>
                      </FormControl>
                      {form.watch("file") && (
                        <p className="text-sm text-gray-600 mt-2">
                          File selected: {form.watch("file")?.name}
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Reviewer and Editor Decisions */}
              {(isReviewer || (isAdmin && actingAs === "REVIEWER")) && (
                <FormField
                  control={form.control}
                  name="reviewerStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold">
                        Reviewer Decision
                      </FormLabel>
                      <FormControl>
                        <ToggleGroup
                          type="single"
                          value={field.value}
                          onValueChange={field.onChange}
                          className="mt-2"
                        >
                          <ToggleGroupItem
                            value="ACCEPTED_FOR_PUBLICATION"
                            className="flex-1 data-[state=on]:bg-green-100 data-[state=on]:border-green-500 data-[state=on]:text-green-800 border-2"
                          >
                            Accept for Publication
                          </ToggleGroupItem>
                          <ToggleGroupItem
                            value="REJECTED_FOR_PUBLICATION"
                            className="flex-1 data-[state=on]:bg-red-100 data-[state=on]:border-red-500 data-[state=on]:text-red-800 border-2"
                          >
                            Reject for Publication
                          </ToggleGroupItem>
                        </ToggleGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {(isEditor || (isAdmin && actingAs === "EDITOR")) && (
                <FormField
                  control={form.control}
                  name="editorStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold">
                        Editor Decision
                      </FormLabel>
                      <FormControl>
                        <ToggleGroup
                          type="single"
                          value={field.value}
                          onValueChange={field.onChange}
                          className="mt-2"
                        >
                          <ToggleGroupItem
                            value="ACCEPTED_FOR_EDIT"
                            className="flex-1 data-[state=on]:bg-green-100 data-[state=on]:border-green-500 data-[state=on]:text-green-800 border-2"
                          >
                            Accept for Edit
                          </ToggleGroupItem>
                          <ToggleGroupItem
                            value="REJECTED_FOR_EDIT"
                            className="flex-1 data-[state=on]:bg-red-100 data-[state=on]:border-red-500 data-[state=on]:text-red-800 border-2"
                          >
                            Reject for Edit
                          </ToggleGroupItem>
                        </ToggleGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end mt-8">
              <Button
                type="submit"
                className="w-full sm:w-auto py-3 text-lg font-bold"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </motion.form>
        </Form>

        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button
              variant="outline"
              onClick={() => {
                form.reset();
              }}
            >
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}