"use client";
import * as React from "react";
import DataTable from "@/lib/CommonTable";
import UserType_add_input from "@/components/dashboard/UserType_add_input";
import { useSession } from "next-auth/react";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { UserDetails } from "@prisma/client";

function FacultyList() {
  const { data: session } = useSession();
  console.log("Session from FacultyList:", session);
  const [data, setData] = React.useState<UserDetails[]>([]);
  const [loading, setLoading] = React.useState(false);

  // Fetch data function
  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/user/reviewer");
      setData(res.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete data function
  const deleteData = React.useCallback(
    async (emails: string | string[]) => {
      setLoading(true);
      try {
        // Ensure emails is always an array for the API call
        const emailsToDelete = Array.isArray(emails) ? emails : [emails];
        await axios.delete("/api/user/reviewer", {
          data: { emails: emailsToDelete },
        });
        toast.success("Deleted successfully!");
      } catch (error) {
        console.error("Failed to delete data:", error);
        toast.error("Failed to delete data.");
      } finally {
        fetchData(); // Refresh data after deletion
        setLoading(false);
      }
    },
    [fetchData]
  );

  // Update data function
  const updateData = React.useCallback(
    async (email: string, userType: string) => {
      setLoading(true);
      try {
        await axios.put(
          "/api/user/reviewer",
          { email, userType },
          { headers: { "Content-Type": "application/json" } }
        );
        toast.success("Updated successfully!");
      } catch (error) {
        console.error("Failed to update data:", error);
        toast.error("Failed to update data.");
      } finally {
        fetchData(); // Refresh data after update
        setLoading(false);
      }
    },
    [fetchData]
  );

  // Define columns for UserDetails
  const columns: ColumnDef<UserDetails>[] = React.useMemo(
    () => [
      {
        accessorKey: "id",
        header: () => <div className="text-left">ID</div>,
        cell: ({ row }) => (
          <div className="lowercase">{row.getValue("id")}</div>
        ),
      },
      {
        accessorKey: "name",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Name
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="lowercase">{row.getValue("name")}</div>
        ),
      },
      {
        accessorKey: "email",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Email
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="lowercase">{row.getValue("email")}</div>
        ),
      },
      {
        accessorKey: "userType",
        header: () => <div className="text-right">UserType</div>,
        cell: ({ row }) => {
          return (
            <div className="text-right font-medium uppercase">
              {row.getValue("userType")}
            </div>
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
    <div className="w-full h-full flex flex-col gap-4 justify-around items-center overflow-hidden md:px-10 px-2 ">
      <p className="dark:text-white text-black text-xl font-bold border-b border-black dark:border-white py-3 text-center w-full sm:text-2xl">
        Add Special UserType and their email
      </p>
      <UserType_add_input />
      <p className="dark:text-white text-black text-xl font-bold  py-3 text-center w-full sm:text-2xl">
        List of Reviewer and Admin
      </p>
      <DataTable
        columns={columns}
        data={data}
        fetchData={fetchData}
        deleteData={deleteData}
        updateData={updateData}
        filterColumnAccessorKey="email" // Specify the column to filter by
        hasActions={true} // Enable select and action columns
        loading={loading} // Pass the loading state
      />
    </div>
  );
}

export default FacultyList;
