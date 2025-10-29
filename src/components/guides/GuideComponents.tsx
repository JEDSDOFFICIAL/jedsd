import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Clock, 
  Users, 
  BookOpen, 
  Star, 
  ArrowRight,
  CheckCircle,
  AlertCircle,
  InfoIcon
} from "lucide-react";


interface StepCardProps {
  step: number;
  title: string;
  description: string;
  children?: React.ReactNode;
  icon?: React.ElementType;
  isLast?: boolean;
}

export function StepCard({ step, title, description, children, icon: Icon, isLast }: StepCardProps) {
  return (
    <div className="relative">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
            {step}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <Card className="h-full border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                {Icon && <Icon className="w-5 h-5 text-primary" />}
                <CardTitle className="text-lg">{title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{description}</p>
              {children}
            </CardContent>
          </Card>
        </div>
      </div>
      {!isLast && (
        <div className="absolute left-6 top-16 w-0.5 h-8 bg-gray-200"></div>
      )}
    </div>
  );
}

interface InfoBoxProps {
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function InfoBox({ type, title, description, children }: InfoBoxProps) {
  const variants = {
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: InfoIcon,
      iconColor: "text-blue-600"
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-200", 
      icon: AlertCircle,
      iconColor: "text-yellow-600"
    },
    success: {
      bg: "bg-green-50",
      border: "border-green-200",
      icon: CheckCircle,
      iconColor: "text-green-600"
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      icon: AlertCircle,
      iconColor: "text-red-600"
    }
  };

  const variant = variants[type];
  const Icon = variant.icon;

  return (
    <div className={`${variant.bg} ${variant.border} border rounded-lg p-4 my-4`}>
      <div className="flex items-start space-x-3">
        <Icon className={`w-5 h-5 ${variant.iconColor} mt-0.5 flex-shrink-0`} />
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
          <div className="text-gray-700">{description || children}</div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  description?: string;
}

export function StatCard({ icon: Icon, label, value, description }: StatCardProps) {
  return (
    <Card className="text-center hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center space-y-2">
          <div className="p-3 bg-primary/10 rounded-full">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          <div className="text-sm font-medium text-gray-700">{label}</div>
          {description && (
            <div className="text-xs text-gray-500 mt-1">{description}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  features?: string[];
}

export function FeatureCard({ icon: Icon, title, description, features }: FeatureCardProps) {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">{description}</p>
        {features && features.length > 0 && (
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

interface TimelineItemProps {
  step?: number;
  title: string;
  description: string;
  duration?: string;
  isActive?: boolean;
  isCompleted?: boolean;
}

export function TimelineItem({ step, title, description, duration, isActive, isCompleted }: TimelineItemProps) {
  return (
    <div className="flex items-start space-x-4">
      <div className="flex-shrink-0 mt-1">
        {step ? (
          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
            isCompleted 
              ? 'bg-green-500 border-green-500 text-white' 
              : isActive 
                ? 'bg-primary border-primary text-white' 
                : 'bg-white border-gray-300 text-gray-600'
          }`}>
            {step}
          </div>
        ) : (
          <div className={`w-4 h-4 rounded-full border-2 ${
            isCompleted 
              ? 'bg-green-500 border-green-500' 
              : isActive 
                ? 'bg-primary border-primary' 
                : 'bg-white border-gray-300'
          }`}>
            {isCompleted && (
              <CheckCircle className="w-3 h-3 text-white" />
            )}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-gray-900'}`}>
            {title}
          </h4>
          {duration && (
            <Badge variant={isActive ? 'default' : 'outline'} className="text-xs">
              {duration}
            </Badge>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
    </div>
  );
}
