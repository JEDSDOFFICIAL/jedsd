"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send,
  User,
  MessageSquare,
  Building,
  Globe,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";

interface ContactInfo {
  icon: React.ElementType;
  title: string;
  details: string[];
  primary?: boolean;
}

const contactInfo: ContactInfo[] = [
  {
    icon: User,
    title: "Editor-in-Chief",
    details: [
      "Dr. Shirshendu Roy",
      "Assistant Professor",
      "Department of Electronics and Communication",
      "Dayananda Sagar University"
    ],
    primary: true
  },
  {
    icon: Mail,
    title: "Email Addresses",
    details: [
      "shirshenduroy-ece@dsu.edu.in",
      "editorial@jedsd.com",
      "jedsdofficial@gmail.com"
    ]
  },
  {
    icon: Phone,
    title: "Contact Number",
    details: ["+91 9330324297"]
  },
  {
    icon: MapPin,
    title: "Official Address",
    details: [
      "Das Vila",
      "17 - Rajani Kanta Chowdhury Lane",
      "Shibpur, Howrah-711103",
      "West Bengal, India"
    ]
  }
];

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    affiliation: "",
    subject: "",
    category: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("Message sent successfully! We'll get back to you within 24-48 hours.");
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        affiliation: "",
        subject: "",
        category: "",
        message: ""
      });
    } catch (error) {
      toast.error("Failed to send message. Please try again or contact us directly via email.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Contact Information */}
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Get in Touch</h3>
          <p className="text-gray-600">
            Have questions about JEDSD? We&apos;re here to help with submissions, reviews, 
            and general inquiries.
          </p>
        </div>

        <div className="space-y-4">
          {contactInfo.map((info, index) => (
            <Card key={index} className={`${info.primary ? 'border-primary bg-primary/5' : ''}`}>
              <CardContent className="pt-4">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${info.primary ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}>
                    <info.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{info.title}</h4>
                    <div className="space-y-1">
                      {info.details.map((detail, idx) => (
                        <p key={idx} className="text-sm text-gray-600">
                          {detail.includes('@') ? (
                            <a href={`mailto:${detail}`} className="text-primary hover:underline">
                              {detail}
                            </a>
                          ) : detail.includes('+91') ? (
                            <a href={`tel:${detail}`} className="text-primary hover:underline">
                              {detail}
                            </a>
                          ) : (
                            detail
                          )}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Response Time Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <h4 className="font-semibold text-blue-900">Response Time</h4>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">General Inquiries:</span>
                <Badge variant="outline" className="text-blue-700 border-blue-300">24-48 hours</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Submission Support:</span>
                <Badge variant="outline" className="text-blue-700 border-blue-300">12-24 hours</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Urgent Issues:</span>
                <Badge variant="outline" className="text-blue-700 border-blue-300">6-12 hours</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>Send us a Message</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Dr. John Smith"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="john.smith@university.edu"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="affiliation">Institution/Affiliation</Label>
              <Input
                id="affiliation"
                value={formData.affiliation}
                onChange={(e) => handleChange('affiliation', e.target.value)}
                placeholder="University Name, Department"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Inquiry Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select inquiry type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="submission">Manuscript Submission</SelectItem>
                  <SelectItem value="review">Review Process</SelectItem>
                  <SelectItem value="editorial">Editorial Inquiry</SelectItem>
                  <SelectItem value="technical">Technical Support</SelectItem>
                  <SelectItem value="general">General Question</SelectItem>
                  <SelectItem value="collaboration">Collaboration</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
                placeholder="Brief subject line"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleChange('message', e.target.value)}
                placeholder="Please provide details about your inquiry..."
                rows={5}
                required
              />
            </div>

            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </div>
                )}
              </Button>
            </div>

            <div className="text-xs text-gray-500 text-center">
              By sending this message, you agree to our privacy policy and terms of service.
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
