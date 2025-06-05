"use client";

import DataTable from "@/lib/CommonTable";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox"; // Not currently used, but kept from original
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Not currently used, but kept from original
import { deletePapers, fetchPapers, updatePaper } from "@/lib/paperActions";
import { ResearchPaper } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Check } from "lucide-react"; // Added Check
import { useSession } from "next-auth/react";
import Link from "next/link";
import React from "react";

// Shadcn UI components for Popover and Command
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { cn } from "@/lib/utils"; // Assuming you have this utility for classnames

// Import reviewer related actions and types
import { fetchReviewers, assignReviewer, Reviewer } from "@/lib/AssignReviewer";

type ExtendedResearchPaper = ResearchPaper & {
  author: {
    name: string;
    email: string;
  };
  // Assuming reviewerId might be part of ResearchPaper from Prisma,
  // or you might need to extend it here if it's not directly in Prisma's ResearchPaper
  // reviewerId?: string | null; // Add this if not in Prisma model
};

const PaperWorkAdmin = () => {
  const { status } = useSession();
  const [data, setData] = React.useState<ExtendedResearchPaper[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [reviewers, setReviewers] = React.useState<Reviewer[]>([]); // State to store fetched reviewers

  // --- Fetching Papers ---
  const fetchData = React.useCallback(async () => {
    setLoading(true);
    const papers = await fetchPapers();
    if (papers) {
      setData(
        papers.map((paper: any) => ({
          ...paper,
          author: paper.author
            ? paper.author
            : { name: "Unknown Author", email: "Unknown Email" },
          // Ensure reviewerId is present, default to null if not
          reviewerId: paper.reviewerId || null,
        }))
      );
    }
    setLoading(false);
  }, []);

  // --- Fetching Reviewers ---
  const fetchReviewersData = React.useCallback(async () => {
    const fetchedReviewers = await fetchReviewers();
    if (fetchedReviewers) {
      setReviewers(fetchedReviewers);
    }
  }, []);



  const handleAssignReviewer = React.useCallback(
    async (paperId: string, reviewerId: string) => {
      setLoading(true);
      await assignReviewer(
        paperId,
        reviewerId,
        "REVIEWER_ALLOCATION",
        () => {
          fetchData(); // Refetch papers to update the table with the new reviewer assignment
        }
      );
      setLoading(false);
    },
    [fetchData]
  );

  // --- Columns Definition for DataTable ---
  const columns: ColumnDef<ExtendedResearchPaper>[] = React.useMemo(
    () => [
      // Checkbox column for selection (if you're using it in DataTable)
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "title",
        header: () => <div className="text-left">Title</div>,
        cell: ({ row }) => (
          <div className="lowercase">
            {(row.getValue("title") as string).length > 30
              ? (row.getValue("title") as string).slice(0, 30) + "..."
              : (row.getValue("title") as string)}
          </div>
        ),
      },
      {
        accessorKey: "reviewerStatus",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="text-left "
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Reviewer Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="lowercase">{row.getValue("reviewerStatus")}</div>
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="text-left "
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="lowercase">{row.getValue("status")}</div>
        ),
      },
      {
        accessorKey: "reviewer",
        header: () => <div className="text-left"> Reviewer</div>,
        cell: ({ row }) => {
          const reviewer = row.getValue("reviewer") as { email?: string };
          console.log("Reviewer data:", reviewer);
          return <div className="lowercase">{reviewer?.email || "++"}</div>;
        },
      },
      {
        accessorKey: "keywords",
        header: () => <div className="text-left">Keywords</div>,
        cell: ({ row }) => (
          <div className="lowercase">
            {Array.isArray(row.getValue("keywords"))
              ? (row.getValue("keywords") as string[]).join(", ")
              : typeof row.getValue("keywords") === "string"
                ? (row.getValue("keywords") as string)
                : ""}
          </div>
        ),
      },
      {
        accessorKey: "filePath",
        header: () => <div className="text-left">Paper Link</div>,
        cell: ({ row }) => (
          <div className="lowercase">
            <a
              href={row.getValue("filePath")}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              View Paper
            </a>
          </div>
        ),
      },
      {
        accessorKey: "coverLetterPath",
        header: () => <div className="text-left">Cover Letter</div>,
        cell: ({ row }) => (
          <div className="lowercase">
            <a
              href={row.getValue("coverLetterPath")}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              View Cover Letter
            </a>
          </div>
        ),
      },
      {
        accessorKey: "submissionDate",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="text-left "
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Submission Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="lowercase">
            {(() => {
              const value = row.getValue("submissionDate");
              const date = value ? new Date(value as string) : null;
              return date ? date.toLocaleString() : "";
            })()}
          </div>
        ),
      },
      {
        accessorKey: "id",
        header: () => <div className="text-left">Read Full Paper</div>,
        cell: ({ row }) => (
          <div className="lowercase">
            {row.getValue("id") ? (
              <Link
                href={`/paper/${row.getValue("id")}`}
                className="text-blue-500 hover:underline"
              >
                View Details
              </Link>
            ) : (
              <span className="text-gray-500">No Paper ID</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "author.name",
        header: () => <div className="text-left">Author Name</div>,
        cell: ({ row }) => {
          const author = row.original.author;
          return (
            <div className="lowercase">
              {author ? author.name : "Unknown Author"}
            </div>
          );
        },
      },
      {
        accessorKey: "author.email",
        header: () => <div className="text-left">Author Email</div>,
        cell: ({ row }) => {
          const author = row.original.author;
          return (
            <div className="lowercase">
              {author ? author.email : "Unknown Email"}
            </div>
          );
        },
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const paper = row.original;
          const [open, setOpen] = React.useState(false);
          const [selectedReviewer, setSelectedReviewer] =
            React.useState<Reviewer | null>(
              reviewers.find((r) => r.id === paper.reviewerId) || null
            );

          // Effect to update selectedReviewer state when paper.reviewerId changes
          React.useEffect(() => {
            setSelectedReviewer(
              reviewers.find((r) => r.id === paper.reviewerId) || null
            );
          }, [paper.reviewerId, reviewers]);

          return (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Search reviewer..." />
                  <CommandEmpty>No reviewer found.</CommandEmpty>
                  <CommandGroup>
                    {reviewers.length > 0 ? (
                      reviewers.map((reviewer) => (
                        <CommandItem
                          key={reviewer.id}
                          value={reviewer.name}
                          onSelect={() => {
                            // Call the `handleAssignReviewer` function from the parent scope
                            handleAssignReviewer(paper.id, reviewer.id);
                            setSelectedReviewer(reviewer); // Update local state for immediate feedback
                            setOpen(false); // Close the popover
                          }}
                          className="cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedReviewer?.id === reviewer.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {reviewer.name}
                        </CommandItem>
                      ))
                    ) : (
                      <CommandItem disabled>No reviewers available</CommandItem>
                    )}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          );
        },
      },
    ],
    // IMPORTANT: Add `reviewers` and `handleAssignReviewer` to dependencies
    // This ensures the `actions` column re-renders when reviewers are fetched or the assign function changes.
    [reviewers, handleAssignReviewer]
  );

  // --- useEffect for Initial Data Fetching ---
  React.useEffect(() => {
    if (status !== "loading") {
      fetchData();
      fetchReviewersData(); // Fetch reviewers when component mounts
    }
  }, [status, fetchData, fetchReviewersData]); // Add fetchReviewersData to dependencies

  // --- Optional: Console log data for debugging ---
  React.useEffect(() => {
    console.log("Data fetched from paperworkadmin:", data);
    console.log("Reviewers fetched:", reviewers); // Log reviewers as well
  }, [data, reviewers]);

  // --- Component Render ---
  return (
    <div className="container mx-auto py-10">
      {loading ? (
        <p className="text-center text-lg">
          Loading all papers and reviewers...
        </p>
      ) : (
        <DataTable
          columns={columns}
          data={data}
          fetchData={fetchData} // Pass fetchData for refresh if needed by DataTable
          filterColumnAccessorKey="title"
          loading={loading} // Pass loading state
        />
      )}
    </div>
  );
};

export default PaperWorkAdmin;
