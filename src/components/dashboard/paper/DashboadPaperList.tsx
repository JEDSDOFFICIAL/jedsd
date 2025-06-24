"use client";
import * as React from "react";
import { useSession } from "next-auth/react";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, DeleteIcon, MoreHorizontal, Upload, UploadIcon } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { ResearchPaper } from "@prisma/client";
import Link from "next/link";
import { fetchPapers, updatePaper, deletePapers } from "@/lib/paperActions";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSearchParams } from "next/navigation";
import { DataTable } from "../data-table";
import data1 from './data.json'
 function DashboardPaper() {
  const { data: session } = useSession();
  console.log("Session from PaperList:", session);
  const [data, setData] = React.useState<ResearchPaper[]>([]);
  const [loading, setLoading] = React.useState(false);
  const params = useSearchParams()
  // Fetch data function
  const fetchData = React.useCallback(async () => {
    setLoading(true);
    const papers = await fetchPapers({
      authorId: session?.user.id as string,
      page: params.get("page") ? parseInt(params.get("page") as string) : 1
    });
    if (papers) setData(papers.papers);
    setLoading(false);
  }, [session?.user.id]);

  const deleteData = React.useCallback(
    async (emails: string | string[]) => {
      setLoading(true);
      await deletePapers(emails, fetchData);
      setLoading(false);
    },
    [fetchData]
  );

  // Define columns for UserDetails
  const columns: ColumnDef<ResearchPaper>[] = React.useMemo(
    () => [
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
              View Paper{" "}
            </a>
          </div>
        ),
      },

      {
        accessorKey: "coverLetterPath",
        header: () => <div className="text-left">cover Letter</div>,
        cell: ({ row }) => (
          <div className="lowercase">
            <a
              href={row.getValue("coverLetterPath")}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              View Paper{" "}
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
                href={`paper/${row.getValue("id")}`}
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
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const paper = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions on Row</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer">
                    <Link href={`dashboard/paper/${paper.id}`} className="flex items-center gap-2">
                     <UploadIcon/>
                     Update Paper
                     </Link>
                  </DropdownMenuItem>

                <DropdownMenuItem
                  className="cursor-pointer"
                 onClick={async ({}) => {
                    if (confirm("Are you sure you want to delete this item?")) {
                      try {
                        await deleteData(paper.id);
                        toast.success("Paper deleted successfully");
                      } catch (error) {
                        console.error("Error deleting paper:", error);
                        toast.error("Failed to delete paper");
                      }
                    }
                 }}
                >
                  <DeleteIcon className="h-4 w-4" />
                  Delete Item
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    []
  );

  React.useEffect(() => {
    fetchData();
  }, [fetchData]); // Initial data fetch

  return (
    <div className="max-w-full h-fit flex flex-col justify-between  items-center px-2 ">
      <p className="dark:text-white text-black text-xl font-bold  text-center w-full sm:text-3xl my-4">
        List of Papers
      </p>
     <DataTable />
    </div>
  );
}

export function DashboardPaperList(){
  return (
    <React.Suspense>
      <DashboardPaper />
    </React.Suspense>
  )
}
