"use client";

import React from "react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";

interface UserTypeChartProps {
  users: any[];
}

export function UserTypeChart({ users }: UserTypeChartProps) {
  const userTypeCounts = users.reduce((acc, user) => {
    acc[user.userType] = (acc[user.userType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(userTypeCounts).map(([type, count]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: count,
  }));

  const COLORS = {
    'Author': '#3B82F6',
    'Reviewer': '#10B981',
    'Editor': '#F59E0B',
    'Admin': '#EF4444',
  };

  const getColor = (name: string) => COLORS[name as keyof typeof COLORS] || '#6B7280';

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const total = users.length;
      const percentage = ((payload[0].value / total) * 100).toFixed(1);
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-800">{payload[0].payload.name}</p>
          <p className="text-sm text-gray-600">{payload[0].value} users</p>
          <p className="text-xs text-gray-500">{percentage}% of all users</p>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p className="text-sm">No user data available</p>
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
          innerRadius={30}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
