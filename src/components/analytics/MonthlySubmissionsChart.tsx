"use client";

import React from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Area, AreaChart } from "recharts";
import { format, subMonths } from "date-fns";

interface MonthlySubmissionsChartProps {
  papers: any[];
}

export function MonthlySubmissionsChart({ papers }: MonthlySubmissionsChartProps) {
  // Generate last 6 months data
  const months = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5 - i);
    return {
      month: format(date, 'MMM'),
      fullMonth: format(date, 'MMMM yyyy'),
      fullDate: date,
    };
  });

  const data = months.map(({ month, fullMonth, fullDate }) => {
    const count = papers.filter(paper => {
      const paperDate = new Date(paper.submissionDate);
      return paperDate.getMonth() === fullDate.getMonth() && 
             paperDate.getFullYear() === fullDate.getFullYear();
    }).length;

    return { month, fullMonth, submissions: count };
  });

  const maxSubmissions = Math.max(...data.map(d => d.submissions));
  const avgSubmissions = data.reduce((sum, d) => sum + d.submissions, 0) / data.length;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-800">{data.fullMonth}</p>
          <p className="text-sm text-gray-600">{data.submissions} submissions</p>
          <p className="text-xs text-gray-500">
            {data.submissions > avgSubmissions ? 'Above' : 'Below'} average ({avgSubmissions.toFixed(1)})
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload.submissions === maxSubmissions && maxSubmissions > 0) {
      return (
        <circle 
          cx={cx} 
          cy={cy} 
          r={4} 
          fill="#8B5CF6" 
          stroke="#ffffff" 
          strokeWidth={2}
        />
      );
    }
    return (
      <circle 
        cx={cx} 
        cy={cy} 
        r={2} 
        fill="#8B5CF6" 
        stroke="#ffffff" 
        strokeWidth={1}
      />
    );
  };

  if (data.every(d => d.submissions === 0)) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p className="text-sm">No submissions in the last 6 months</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="submissionGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="month" 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#6B7280' }}
        />
        <YAxis 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#6B7280' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="submissions"
          stroke="#8B5CF6"
          fillOpacity={1}
          fill="url(#submissionGradient)"
          strokeWidth={2}
        />
        <Line 
          type="monotone" 
          dataKey="submissions" 
          stroke="#8B5CF6" 
          strokeWidth={2}
          dot={<CustomDot />}
          activeDot={{ r: 5, stroke: '#8B5CF6', strokeWidth: 2, fill: '#ffffff' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
