"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Users,
  UserCog,
  Settings,
  ArrowRight,
  ShieldCheck,
  LayoutDashboard,
  Database,
  Activity,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  const adminActions = [
    {
      title: "User Management",
      description: "Manage user accounts, roles, and permissions across the platform",
      icon: Users,
      href: "/dashboard/admin/users",
      color: "bg-blue-50 border-blue-200",
      iconColor: "text-blue-600",
    },
    {
      title: "Role Management",
      description: "Configure and manage user roles, access levels, and role assignments",
      icon: UserCog,
      href: "/dashboard/admin/roles",
      color: "bg-purple-50 border-purple-200",
      iconColor: "text-purple-600",
    },
    {
      title: "Paper Management",
      description: "Oversee all papers, monitor workflows, and manage submissions",
      icon: FileText,
      href: "/dashboard/admin/papers",
      color: "bg-green-50 border-green-200",
      iconColor: "text-green-600",
    },
    {
      title: "System Settings",
      description: "Configure system-wide settings, preferences, and configurations",
      icon: Settings,
      href: "/dashboard/admin/settings",
      color: "bg-orange-50 border-orange-200",
      iconColor: "text-orange-600",
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center text-white">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage users, papers, and system configurations
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {adminActions.map((action, index) => (
          <Card key={index} className={`${action.color} hover:shadow-md transition-shadow cursor-pointer`}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-white`}>
                  <action.icon className={`h-6 w-6 ${action.iconColor}`} />
                </div>
                <CardTitle className="text-lg">{action.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-sm mb-4 leading-relaxed">
                {action.description}
              </CardDescription>
              <Link href={action.href}>
                <Button className="w-full" variant="outline">
                  <span>Go to {action.title}</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Overview
            </CardTitle>
            <CardDescription>
              Real-time system statistics and activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <div className="text-2xl font-bold text-blue-600">--</div>
                </div>
                <div className="text-sm text-blue-600">Total Users</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-green-600" />
                  <div className="text-2xl font-bold text-green-600">--</div>
                </div>
                <div className="text-sm text-green-600">Total Papers</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  <div className="text-2xl font-bold text-purple-600">--</div>
                </div>
                <div className="text-sm text-purple-600">Active Reviews</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-orange-600" />
                  <div className="text-2xl font-bold text-orange-600">--</div>
                </div>
                <div className="text-sm text-orange-600">Published</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Frequently used admin functions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/admin/users">
              <Button variant="outline" className="w-full justify-start" size="lg">
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Button>
            </Link>
            
            <Link href="/dashboard/admin/papers">
              <Button variant="outline" className="w-full justify-start" size="lg">
                <FileText className="h-4 w-4 mr-2" />
                View All Papers
              </Button>
            </Link>

            <Link href="/dashboard/admin/roles">
              <Button variant="outline" className="w-full justify-start" size="lg">
                <UserCog className="h-4 w-4 mr-2" />
                Role Management
              </Button>
            </Link>

            <Link href="/dashboard/admin/settings">
              <Button variant="outline" className="w-full justify-start" size="lg">
                <Settings className="h-4 w-4 mr-2" />
                System Settings
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Database className="h-5 w-5" />
            System Health
          </CardTitle>
          <CardDescription>
            Monitor system performance and health metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Database Status</span>
              <span className="text-sm text-green-600 font-medium">● Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">API Response Time</span>
              <span className="text-sm text-green-600 font-medium">● Good</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Storage Usage</span>
              <span className="text-sm text-blue-600 font-medium">Normal</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">System Uptime</span>
              <span className="text-sm text-green-600 font-medium">99.9%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
