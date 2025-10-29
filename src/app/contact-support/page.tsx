"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  PartyPopper, 
  Send, 
  MessageSquare,
  Bug,
  HelpCircle,
  Star,
  Mail,
  Phone,
  Clock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";

export default function ContactSupportPage() {
  const { data: session } = useSession();
  const [submitting, setSubmitting] = useState(false);
  
  const [supportData, setSupportData] = useState({
    subject: "",
    category: "",
    priority: "medium",
    message: "",
    email: session?.user?.email || "",
    name: session?.user?.name || "",
  });

  const handleSubmitSupport = async () => {
    if (!supportData.subject.trim()) {
      toast.error("Please provide a subject");
      return;
    }

    if (!supportData.category) {
      toast.error("Please select a category");
      return;
    }

    if (!supportData.message.trim()) {
      toast.error("Please describe your issue");
      return;
    }

    try {
      setSubmitting(true);
      
      const response = await axios.post("/api/support/contact", supportData);

      if (response.data.success) {
        toast.success("Support request submitted successfully! We'll get back to you soon.");
        setSupportData({
          subject: "",
          category: "",
          priority: "medium",
          message: "",
          email: session?.user?.email || "",
          name: session?.user?.name || "",
        });
      } else {
        toast.error(response.data.message || "Failed to submit support request");
      }
    } catch (err) {
      console.error("Error submitting support request:", err);
      toast.error("Failed to submit support request");
    } finally {
      setSubmitting(false);
    }
  };

  const categories = [
    { value: "technical", label: "Technical Issue", icon: Bug },
    { value: "account", label: "Account & Billing", icon: PartyPopper },
    { value: "paper", label: "Paper Submission", icon: MessageSquare },
    { value: "review", label: "Review Process", icon: Star },
    { value: "general", label: "General Inquiry", icon: HelpCircle },
  ];

  const priorities = [
    { value: "low", label: "Low", description: "General questions" },
    { value: "medium", label: "Medium", description: "Standard issues" },
    { value: "high", label: "High", description: "Urgent problems" },
    { value: "critical", label: "Critical", description: "System down/blocking" },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low": return "bg-green-100 text-green-800";
      case "medium": return "bg-blue-100 text-blue-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "critical": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <PartyPopper className="h-8 w-8" />
          Contact Support
        </h1>
        <p className="text-muted-foreground mt-2">
          Get help with any questions or issues you&apos;re experiencing
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Submit a Support Request</CardTitle>
              <CardDescription>
                Fill out the form below and we&apos;ll get back to you as soon as possible
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={supportData.name}
                    onChange={(e) => setSupportData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={supportData.email}
                    onChange={(e) => setSupportData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={supportData.subject}
                  onChange={(e) => setSupportData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Brief description of your issue"
                />
              </div>

              {/* Category */}
              <div>
                <Label className="text-base font-semibold">Category *</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Select the category that best describes your issue
                </p>
                <RadioGroup
                  value={supportData.category}
                  onValueChange={(value) => setSupportData(prev => ({ ...prev, category: value }))}
                  className="grid grid-cols-1 md:grid-cols-2 gap-3"
                >
                  {categories.map((category) => {
                    const IconComponent = category.icon;
                    return (
                      <div key={category.value} className="flex items-center space-x-2 border rounded-lg p-3">
                        <RadioGroupItem value={category.value} id={category.value} />
                        <Label htmlFor={category.value} className="flex items-center gap-2 cursor-pointer flex-1">
                          <IconComponent className="h-4 w-4" />
                          {category.label}
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </div>

              {/* Priority */}
              <div>
                <Label className="text-base font-semibold">Priority</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  How urgent is this issue?
                </p>
                <RadioGroup
                  value={supportData.priority}
                  onValueChange={(value) => setSupportData(prev => ({ ...prev, priority: value }))}
                  className="space-y-2"
                >
                  {priorities.map((priority) => (
                    <div key={priority.value} className="flex items-center space-x-2 border rounded-lg p-3">
                      <RadioGroupItem value={priority.value} id={`priority-${priority.value}`} />
                      <Label htmlFor={`priority-${priority.value}`} className="flex items-center justify-between cursor-pointer flex-1">
                        <div>
                          <span className="font-medium">{priority.label}</span>
                          <p className="text-sm text-muted-foreground">{priority.description}</p>
                        </div>
                        <Badge className={getPriorityColor(priority.value)}>
                          {priority.label}
                        </Badge>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Message */}
              <div>
                <Label htmlFor="message">Message *</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Please provide as much detail as possible about your issue
                </p>
                <Textarea
                  id="message"
                  value={supportData.message}
                  onChange={(e) => setSupportData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Describe your issue in detail. Include any error messages, steps to reproduce the problem, and what you expected to happen."
                  className="min-h-[120px]"
                />
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmitSupport}
                disabled={submitting}
                className="w-full"
                size="lg"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Support Request
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Support Information */}
        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Alternative ways to reach our support team
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Email Support</p>
                  <p className="text-sm text-muted-foreground">support@jedsd.com</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Phone Support</p>
                  <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Business Hours</p>
                  <p className="text-sm text-muted-foreground">
                    Mon-Fri: 9:00 AM - 6:00 PM EST
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Response Times */}
          <Card>
            <CardHeader>
              <CardTitle>Expected Response Times</CardTitle>
              <CardDescription>
                How quickly we typically respond to support requests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <Badge className="bg-red-100 text-red-800">Critical</Badge>
                <span className="text-sm">Within 1 hour</span>
              </div>
              <div className="flex justify-between items-center">
                <Badge className="bg-orange-100 text-orange-800">High</Badge>
                <span className="text-sm">Within 4 hours</span>
              </div>
              <div className="flex justify-between items-center">
                <Badge className="bg-blue-100 text-blue-800">Medium</Badge>
                <span className="text-sm">Within 24 hours</span>
              </div>
              <div className="flex justify-between items-center">
                <Badge className="bg-green-100 text-green-800">Low</Badge>
                <span className="text-sm">Within 48 hours</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Help */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Help</CardTitle>
              <CardDescription>
                Common solutions to frequent issues
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-medium text-sm">Password Reset</h4>
                <p className="text-xs text-muted-foreground">
                  Use the &quot;Forgot Password&quot; link on the login page
                </p>
              </div>
              <div>
                <h4 className="font-medium text-sm">Paper Upload Issues</h4>
                <p className="text-xs text-muted-foreground">
                  Ensure your file is PDF format and under 25MB
                </p>
              </div>
              <div>
                <h4 className="font-medium text-sm">Account Verification</h4>
                <p className="text-xs text-muted-foreground">
                  Check your email spam folder for verification link
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}