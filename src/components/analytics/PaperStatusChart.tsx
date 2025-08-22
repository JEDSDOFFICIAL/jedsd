"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface PaperStatusChartProps {
  papers: any[];
}

export function PaperStatusChart({ papers }: PaperStatusChartProps) {
  const statusCounts = papers.reduce((acc, paper) => {
    acc[paper.status] = (acc[paper.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(statusCounts).map(([status, count]) => ({
    name: status.replace(/_/g, ' '),
    value: count as number,
    percentage: papers.length > 0 ? (((count as number) / papers.length) * 100).toFixed(1) : '0',
  }));

  const COLORS = {
    'UPLOAD': '#3B82F6',
    'ON REVIEW': '#F59E0B',
    'ACCEPTED': '#10B981',
    'REJECTED': '#EF4444',
    'PUBLISH': '#8B5CF6',
    'REVIEWER ALLOCATION': '#06B6D4',
    'EDITOR ALLOCATION': '#F97316',
    'ON EDIT': '#84CC16',
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-800">{data.name}</p>
          <p className="text-sm text-gray-600">{data.value} papers ({data.percentage}%)</p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, index }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {value > 0 ? value : ''}
      </text>
    );
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p className="text-sm">No data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={CustomLabel}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[entry.name as keyof typeof COLORS] || '#6B7280'} 
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          formatter={(value, entry) => `${value} (${entry.payload?.value || 0})`}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
