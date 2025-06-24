"use client";

import { TrendingUp } from "lucide-react";
import { Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ResearchPaper } from "@prisma/client";

export enum PaperStatus {
  UPLOAD = "UPLOAD",
  ON_REVIEW = "ON_REVIEW",
  PUBLISH = "PUBLISH",
  REJECTED = "REJECTED",
}

export const description = "A pie chart displaying research paper status";

export function ChartPieLabel({ paperData = [] }: { paperData?: ResearchPaper[] }) {
  console.log("Paper Data from graph:", paperData);

  const statusCounts = paperData.reduce((acc, paper) => {
    acc[paper.status] = (acc[paper.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const colors = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
  ];

  const chartData = Object.entries(statusCounts).map(([status, count], index) => ({
    status: status as PaperStatus,
    count,
    fill: colors[index % colors.length],
  }));

  const chartConfig: ChartConfig = {
    count: {
      label: "Number of Papers",
    },
    ...Object.values(PaperStatus).reduce((acc, status, index) => {
      acc[status] = {
        label: status.replace(/_/g, " "),
        color: colors[index % colors.length],
      };
      return acc;
    }, {} as Record<string, { label: string; color: string }>),
  };

  return (
    <Card className="flex flex-col h-full w-full @container/card">
      <CardHeader className="items-center pb-0">
        <CardTitle>Paper Status</CardTitle>
        <CardDescription>Distribution of research paper statuses</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square max-h-[250px] pb-0"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie data={chartData} dataKey="count" label nameKey="status" />
            <ChartLegend
              content={<ChartLegendContent nameKey="status" />}
              className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium">
          Total Papers: {paperData.length}
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing distribution of paper statuses.
        </div>
      </CardFooter>
    </Card>
  );
}
