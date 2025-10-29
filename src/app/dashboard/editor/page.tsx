"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  CheckCheck,
  Award,
  ArrowRight,
  Users,
  UserCheck,
  FileSignature,
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";

export default function EditorPage() {
  const editorActions = [
    {
      title: "New Papers",
      description: "Review recently submitted manuscripts requiring editorial action",
      icon: FileText,
      href: "/dashboard/editor/new-papers",
      color: "bg-blue-50 border-blue-200",
      iconColor: "text-blue-600",
    },
    {
      title: "Allocated Papers",
      description: "Papers with allocated reviewers - view reviews and contact authors",
      icon: CheckCheck,
      href: "/dashboard/editor/allocated-papers",
      color: "bg-green-50 border-green-200",
      iconColor: "text-green-600",
    },
    {
      title: "Final Decision",
      description: "Accept, reject, update, or publish papers ready for final decision",
      icon: Award,
      href: "/dashboard/editor/final-decision",
      color: "bg-purple-50 border-purple-200",
      iconColor: "text-purple-600",
    },
    {
      title: "Reviewer Management",
      description: "Manage and assign reviewers to papers",
      icon: Users,
      href: "/dashboard/editor/reviewers",
      color: "bg-orange-50 border-orange-200",
      iconColor: "text-orange-600",
    },
    {
      title: "Read Reviews",
      description: "Read and analyze submitted reviews",
      icon: FileSignature,
      href: "/dashboard/editor/reviews",
      color: "bg-indigo-50 border-indigo-200",
      iconColor: "text-indigo-600",
    },
    {
      title: "Author Contact",
      description: "Communicate with paper authors",
      icon: UserCheck,
      href: "/dashboard/editor/authors",
      color: "bg-teal-50 border-teal-200",
      iconColor: "text-teal-600",
    },
    {
      title: "Paper Actions",
      description: "Perform various actions on papers",
      icon: LayoutDashboard,
      href: "/dashboard/editor/paper-action",
      color: "bg-gray-50 border-gray-200",
      iconColor: "text-gray-600",
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Editor Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage papers, reviews, and publications
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {editorActions.map((action, index) => (
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

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Quick Statistics</CardTitle>
            <CardDescription>
              Overview of your editorial workflow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">--</div>
                <div className="text-sm text-blue-600">New Submissions</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">--</div>
                <div className="text-sm text-green-600">Under Review</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">--</div>
                <div className="text-sm text-purple-600">Ready for Decision</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
