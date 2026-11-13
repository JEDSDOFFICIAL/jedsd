import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, GraduationCap, Building2 } from "lucide-react";
import {
  EDITOR_IN_CHIEF,
  EDITORIAL_BOARD,
  FACULTY_ADVISERS,
  getPersonInitials,
  type Person,
} from "@/lib/journal-info";

interface PersonCardProps {
  person: Person;
  isChief?: boolean;
}

function PersonCard({ person, isChief = false }: PersonCardProps) {
  return (
    <Card
      className={`h-full transition-all duration-300 hover:shadow-lg  ${
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

export default function EditorialTeamSection() {
  return (
    <section className="w-full py-16 bg-gradient-to-b from-background to-muted/20">
      <div className="container  mx-auto px-4 max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Editorial Leadership
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our distinguished editorial team brings together leading researchers
            and academics committed to advancing embedded and digital system design.
          </p>
        </div>

        {/* Editor-in-Chief */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold mb-6 text-center">
            Editor-in-Chief
          </h3>
          <div className="max-w-md mx-auto">
            <PersonCard person={EDITOR_IN_CHIEF} isChief />
          </div>
        </div>

        {/* Editorial Board */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold mb-6 text-center">
            Editorial Board
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {EDITORIAL_BOARD.map((member) => (
              <PersonCard key={member.slug} person={member} />
            ))}
          </div>
        </div>

        {/* Faculty Advisers */}
        <div>
          <h3 className="text-2xl font-semibold mb-6 text-center">
            Faculty Advisers
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {FACULTY_ADVISERS.map((adviser) => (
              <PersonCard key={adviser.slug} person={adviser} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
