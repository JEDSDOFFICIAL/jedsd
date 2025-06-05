"use client";
import * as React from "react";
import DataTable from "@/lib/CommonTable";
import { useSession } from "next-auth/react";
import { ColumnDef } from "@tanstack/react-table";
import {
  AccessibilityIcon,
  ActivityIcon,
  ArrowUpDown,
  MoreHorizontal,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { ResearchPaper } from "@prisma/client";
import Link from "next/link";
import { fetchPapers, updatePaper, deletePapers } from "@/lib/paperActions";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { reviewerAcceptence } from "@/lib/AssignReviewer";

export default function ReviewerReqList() {
  const { data: session } = useSession();
  console.log("Session from PaperList:", session);
  const [data, setData] = React.useState<ResearchPaper[]>([]);
  const [loading, setLoading] = React.useState(false);

  // Fetch data function
  const fetchData = React.useCallback(async () => {
    setLoading(true);
    const papers = await fetchPapers({
      reviewerId: session?.user.id as string,
    });
    if (papers) setData(papers);
    setLoading(false);
  }, [session?.user.id]);

  const updateData = React.useCallback(
    async (paperId: string,type:string) => {
      if (type !== "ACCEPTED" && type !== "REJECTED") {
        toast.error("Invalid action type");
        return;
        
      }
      else if (type === "ACCEPTED") {
        setLoading(true);
        await reviewerAcceptence(paperId,"ACCEPT", fetchData);
        setLoading(false);
      }
      else{

        setLoading(true);
        await reviewerAcceptence(paperId,"REJECT", fetchData);
        setLoading(false);
      }
    },
    [fetchData]
  );

  // Define columns for UserDetails
  const columns: ColumnDef<ResearchPaper>[] = React.useMemo(
    () => [
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
        accessorKey: "reviewerStatus",
        header: () => <div className="text-left">Reviewer status</div>,
        cell: ({ row }) => (
          <div className="lowercase">
            {row.getValue("reviewerStatus") ? (
              row.getValue("reviewerStatus")
            ) : (
              <span className="text-gray-500">No Status</span>
            )}
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
          const paperId = row.getValue("id") as string;
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
                {/* Show Accept Paper if reviewerStatus is not 'Accepted' */}
                {row.getValue("reviewerStatus") !== "ACCEPTED" && (
                  <>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => updateData(paperId, "ACCEPTED")}
                    >
                      <AccessibilityIcon className="h-4 w-4" />
                      Accept Paper
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => updateData(paperId, "REJECTED")}
                    >
                      <AccessibilityIcon className="h-4 w-4" />
                      Reject Paper
                    </DropdownMenuItem>
                  </>
                )}
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
      <DataTable
        columns={columns}
        data={data}
        fetchData={fetchData}
        filterColumnAccessorKey="title"
        loading={loading}
      />
    </div>
  );
}
