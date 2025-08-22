"use client";

import React from "react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

interface ReviewTurnaroundChartProps {
  reviews: any[];
}

export function ReviewTurnaroundChart({ reviews }: ReviewTurnaroundChartProps) {
  // Generate mock turnaround data for demonstration
  const data = [
    { day: 'Mon', time: 2.5 },
    { day: 'Tue', time: 3.2 },
    { day: 'Wed', time: 2.8 },
    { day: 'Thu', time: 4.1 },
    { day: 'Fri', time: 3.7 },
    { day: 'Sat', time: 2.9 },
    { day: 'Sun', time: 3.4 },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 shadow-lg rounded border">
          <p className="text-sm font-medium">{payload[0].payload.day}</p>
          <p className="text-sm text-gray-600">{payload[0].value} days avg</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={80}>
      <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <XAxis dataKey="day" hide />
        <YAxis hide />
        <Tooltip content={<CustomTooltip />} />
        <Area 
          type="monotone" 
          dataKey="time" 
          stroke="#6366F1" 
          fill="#6366F1" 
          fillOpacity={0.4}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
