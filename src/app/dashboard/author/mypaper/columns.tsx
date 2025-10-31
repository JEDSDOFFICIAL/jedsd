"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ResearchPaper } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Eye, Edit, Calendar, Star, FileText, MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ColumnsProps {
  onEditPaper: (paperId: string) => void;
  onViewPaper: (paperId: string) => void;
}

export const createColumns = ({ onEditPaper, onViewPaper }: ColumnsProps): ColumnDef<ResearchPaper>[] => [
    {
    accessorKey: "paperId",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          <FileText className="mr-2 h-4 w-4" />
          Paper ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const paperId = row.getValue("paperId") as string;
      return (
        <div className="text-sm font-mono">
          {paperId}
        </div>
      );
    },
  },
 
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const paper = row.original;
      return (
        <div className="max-w-[300px]">
          <div className="font-medium truncate">{paper.title}</div>
          <div className="text-sm text-muted-foreground truncate mt-1">
            {paper.abstract}
          </div>
        </div>
      );
    },
  },
   {
    accessorKey: "keywords",
    header: "Keywords",
    cell: ({ row }) => {
      const keywords = row.getValue("keywords") as string[];
      return (
        <div className="max-w-[200px]">
          <div className="flex flex-wrap gap-1">
            {keywords.slice(0, 2).map((keyword, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {keyword}
              </Badge>
            ))}
            {keywords.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{keywords.length - 2} more
              </Badge>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      
      const getStatusColor = (status: string) => {
        switch (status) {
          case "UPLOAD":
            return "bg-blue-100 text-blue-800";
          case "REVIEWER_ALLOCATION":
            return "bg-yellow-100 text-yellow-800";
          case "ON_REVIEW":
            return "bg-orange-100 text-orange-800";
          case "EDITOR_DECISION":
            return "bg-purple-100 text-purple-800";
          case "ACCEPTED":
            return "bg-green-100 text-green-800";
          case "REJECTED":
            return "bg-red-100 text-red-800";
          case "PUBLISH":
            return "bg-emerald-100 text-emerald-800";
          default:
            return "bg-gray-100 text-gray-800";
        }
      };

      const getStatusLabel = (status: string) => {
        switch (status) {
          case "UPLOAD":
            return "Uploaded";
          case "REVIEWER_ALLOCATION":
            return "Reviewer Allocation";
          case "ON_REVIEW":
            return "Under Review";
          case "EDITOR_DECISION":
            return "Editor Decision";
          case "ACCEPTED":
            return "Accepted";
          case "REJECTED":
            return "Rejected";
          case "PUBLISH":
            return "Published";
          default:
            return status;
        }
      };

      return (
        <Badge className={getStatusColor(status)}>
          {getStatusLabel(status)}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "submissionDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          <Calendar className="mr-2 h-4 w-4" />
          Submitted
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("submissionDate") as Date;
      return (
        <div className="text-sm">
          {format(new Date(date), "MMM dd, yyyy")}
        </div>
      );
    },
  },
  {
    accessorKey: "rating",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          <Star className="mr-2 h-4 w-4" />
          Rating
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const rating = row.getValue("rating") as number | null;
      return (
        <div className="text-sm">
          {rating ? (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{rating}/10</span>
            </div>
          ) : (
            <span className="text-muted-foreground">Not rated</span>
          )}
        </div>
      );
    },
  },
  
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const paper = row.original;
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onViewPaper(paper.paperId as string)}
              className="flex items-center"
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            {paper.status != "PUBLISH" && (
              <DropdownMenuItem 
                onClick={() => onEditPaper(paper.paperId as string)}
                className="flex items-center"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Paper
              </DropdownMenuItem>
            )}
            {/* <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive"
              onClick={() => {
                // Handle delete request logic here
                console.log("Delete request for paper:", paper.paperId);
                // You can add a confirmation dialog or call an API here
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Request
            </DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];