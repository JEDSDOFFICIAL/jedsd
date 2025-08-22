"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

interface ReviewProgressChartProps {
  completed: number;
  pending: number;
}

export function ReviewProgressChart({ completed, pending }: ReviewProgressChartProps) {
  const data = [
    { name: 'Completed', value: completed, fill: '#10B981' },
    { name: 'Pending', value: pending, fill: '#F59E0B' },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 shadow-lg rounded border">
          <p className="text-sm font-medium">{payload[0].payload.name}</p>
          <p className="text-sm text-gray-600">{payload[0].value} items</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={80}>
      <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <XAxis dataKey="name" hide />
        <YAxis hide />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
