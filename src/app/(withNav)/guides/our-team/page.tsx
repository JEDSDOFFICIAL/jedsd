import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, GraduationCap, Building2, Users, ChevronLeft } from "lucide-react";
import {
  EDITOR_IN_CHIEF,
  EDITORIAL_BOARD,
  FACULTY_ADVISERS,
  JOURNAL,
  getPersonInitials,
  type Person,
} from "@/lib/journal-info";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: `Editorial Team | ${JOURNAL.shortName}`,
  description: `Meet the editorial team of ${JOURNAL.title}. Our distinguished board brings together leading researchers and academics committed to advancing embedded and digital system design.`,
  alternates: { canonical: `${SITE_URL}/guides/our-team` },
};

interface PersonCardProps {
  person: Person;
  isChief?: boolean;
}

function PersonCard({ person, isChief = false }: PersonCardProps) {
  return (
    <Card
      className={`h-full transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
        isChief ? "border-primary/50 bg-primary/5" : ""
      }`}
    >
      <CardContent className="p-6 h-full">
        <div className="flex flex-col items-center text-center space-y-4 h-full">
          {/* Avatar */}
          <Avatar className={`${isChief ? "h-24 w-24" : "h-20 w-20"} border-2 ${isChief ? "border-primary" : "border-muted"} flex-shrink-0`}>
            <AvatarFallback className={`${isChief ? "text-xl" : "text-lg"} font-semibold ${isChief ? "bg-primary text-primary-foreground" : ""}`}>
              {getPersonInitials(person.name)}
            </AvatarFallback>
          </Avatar>

          {/* Name */}
          <div className="space-y-1 flex-shrink-0">
            <h3 className={`${isChief ? "text-xl" : "text-lg"} font-semibold leading-tight`}>
              {person.name}
            </h3>
            {isChief && (
              <Badge variant="default" className="text-xs">
                {person.role}
              </Badge>
            )}
          </div>

          {/* Details */}
          <div className="space-y-2 text-sm text-muted-foreground w-full flex-1 min-h-0">
            {person.designation && (
              <div className="flex items-start justify-center gap-2">
                <GraduationCap className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span className="text-left break-words">
                  {person.designation}
                  {person.department && `, ${person.department}`}
                </span>
              </div>
            )}

            <div className="flex items-start justify-center gap-2">
              <Building2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span className="text-left break-words">
                {person.institution}
                {person.address && (
                  <span className="block text-xs mt-0.5 text-muted-foreground/80 break-words">
                    {person.address}
                  </span>
                )}
              </span>
            </div>

            {person.email && (
              <a
                href={`mailto:${person.email}`}
                className="flex items-center justify-center gap-2 text-primary hover:underline group break-all"
              >
                <Mail className="h-4 w-4 group-hover:scale-110 transition-transform flex-shrink-0" />
                <span className="text-xs">{person.email}</span>
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function OurTeamPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-primary">
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/guides" className="hover:text-primary">
                Guides
              </Link>
            </li>
            <li>/</li>
            <li className="text-foreground font-medium">Our Team</li>
          </ol>
        </nav>

        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Editorial Leadership
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Our distinguished editorial team brings together leading researchers
            and academics from renowned institutions, committed to advancing
            embedded and digital system design research.
          </p>
        </div>

        {/* Editor-in-Chief */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Editor-in-Chief</h2>
            <p className="text-muted-foreground">
              Leading the journal's vision and editorial direction
            </p>
          </div>
          <div className="max-w-md mx-auto">
            <PersonCard person={EDITOR_IN_CHIEF} isChief />
          </div>
        </section>

        {/* Editorial Board */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Editorial Board</h2>
            <p className="text-muted-foreground">
              Expert reviewers ensuring the quality and integrity of published research
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {EDITORIAL_BOARD.map((member) => (
              <PersonCard key={member.slug} person={member} />
            ))}
          </div>
        </section>

        {/* Faculty Advisers */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Faculty Advisers</h2>
            <p className="text-muted-foreground">
              Distinguished academics providing strategic guidance and expertise
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {FACULTY_ADVISERS.map((adviser) => (
              <PersonCard key={adviser.slug} person={adviser} />
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <Card className="mt-16 bg-muted/30 border-dashed">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-3">Join Our Community</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Interested in contributing to our journal as a reviewer or author?
              Learn more about our submission process and reviewer guidelines.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/guides">
                <Badge className="px-4 py-2 text-sm cursor-pointer hover:bg-primary/90">
                  View Author Guidelines
                </Badge>
              </Link>
              <Link href="/dashboard/author/upload">
                <Badge variant="outline" className="px-4 py-2 text-sm cursor-pointer hover:bg-muted">
                  Submit a Paper
                </Badge>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
