"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

interface UserActivityChartProps {
  papers: any[];
}

export function UserActivityChart({ papers }: UserActivityChartProps) {
  // Generate last 7 days data
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    return {
      day: format(date, 'EEE'),
      fullDate: format(date, 'MMM dd'),
      date: date,
    };
  });

  const data = days.map(({ day, fullDate, date }) => {
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    
    const activity = papers.filter(paper => {
      const paperDate = new Date(paper.submissionDate);
      return paperDate >= dayStart && paperDate <= dayEnd;
    }).length;

    return { day, fullDate, activity };
  });

  const maxActivity = Math.max(...data.map(d => d.activity));
  const totalActivity = data.reduce((sum, d) => sum + d.activity, 0);
  const avgActivity = totalActivity / data.length;

  const getBarColor = (value: number) => {
    if (value === 0) return "#E5E7EB";
    if (value === maxActivity && maxActivity > 0) return "#3B82F6";
    if (value > avgActivity) return "#60A5FA";
    return "#93C5FD";
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-800">{data.fullDate}</p>
          <p className="text-sm text-gray-600">{data.activity} submissions</p>
          {data.activity === maxActivity && maxActivity > 0 && (
            <p className="text-xs text-blue-600 font-medium">Peak activity day</p>
          )}
          {data.activity === 0 && (
            <p className="text-xs text-gray-500">No activity</p>
          )}
        </div>
      );
    }
    return null;
  };

  if (totalActivity === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p className="text-sm">No activity in the last 7 days</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <XAxis 
          dataKey="day" 
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
        <Bar dataKey="activity" radius={[2, 2, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getBarColor(entry.activity)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
