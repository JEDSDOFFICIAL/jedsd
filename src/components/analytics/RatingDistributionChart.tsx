"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";

interface RatingDistributionChartProps {
  reviews: any[];
}

export function RatingDistributionChart({ reviews }: RatingDistributionChartProps) {
  const ratingCounts = [1, 2, 3, 4, 5].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
  }));

  const COLORS = ['#EF4444', '#F59E0B', '#F59E0B', '#10B981', '#10B981'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 shadow-lg rounded border">
          <p className="text-sm font-medium">{payload[0].payload.rating} Stars</p>
          <p className="text-sm text-gray-600">{payload[0].value} reviews</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={80}>
      <BarChart data={ratingCounts} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <XAxis dataKey="rating" hide />
        <YAxis hide />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="count" radius={[2, 2, 0, 0]}>
          {ratingCounts.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
