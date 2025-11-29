"use client";

import { User, Mail, Building, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Contributor {
  fullName: string;
  email?: string;
  affiliation?: string;
}

interface AuthorBadgesProps {
  contributors: Contributor[];
}

export default function AuthorBadges({ contributors }: AuthorBadgesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <User className="h-4 w-4" />
          Authors
        </CardTitle>
      </CardHeader>
      <CardContent className="-mt-3">
        <div className="flex flex-wrap gap-2">
          {contributors.map((contributor, index) => (
            <DropdownMenu key={index}>
              <DropdownMenuTrigger asChild>
                <Badge
                  variant="secondary"
                  className="text-sm px-3 py-2 cursor-pointer hover:bg-secondary/80 transition-colors flex items-center gap-2"
                >
                  <span className="font-medium">{contributor.fullName}</span>
                  {(contributor.email || contributor.affiliation) && (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </Badge>
              </DropdownMenuTrigger>
              {(contributor.email || contributor.affiliation) && (
                <DropdownMenuContent align="start" className="min-w-[250px] max-w-[350px]">
                  <DropdownMenuLabel>{contributor.fullName}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {contributor.email && (
                    <DropdownMenuItem className="flex items-center gap-2">
                      <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <a
                        href={`mailto:${contributor.email}`}
                        className="hover:text-primary hover:underline break-all flex-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {contributor.email}
                      </a>
                    </DropdownMenuItem>
                  )}
                  {contributor.affiliation && (
                    <DropdownMenuItem className="flex items-start gap-2">
                      <Building className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground break-words flex-1">
                        {contributor.affiliation}
                      </span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              )}
            </DropdownMenu>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
