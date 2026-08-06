
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  StepCard, 
  InfoBox, 
  StatCard, 
  FeatureCard, 
  TimelineItem 
} from "@/components/guides/GuideComponents";
import { ContactForm } from "@/components/guides/ContactForm";
import Link from "next/link";
import React from "react";
import {
  FileText,
  Users,
  Target,
  CheckCircle,
  Clock,
  Search,
  BookOpen,
  Shield,
  Globe,
  Award,
  TrendingUp,
  Download,
  Upload,
  Eye,
  MessageCircle,
  AlertTriangle,
  Info,
  Star,
  Lightbulb,
  Zap,
  Settings,
  Mail,
  User
} from "lucide-react";

interface GuideData {
  title: string;
  content: React.ReactNode;
}

const members = [
  {
    role: "Editor-in-Chief",
    name: "Dr. Shirshendu Roy",
    position: "Assistant Professor, Dayananda Sagar University",
    email: "shirshenduroy-ece@dsu.edu.in",
  },
  {
    role: "Editorial Member",
    name: "Dr. Ardhendu Sarkar",
    position: "Director, Addauto Technology Pvt. Ltd.",
  },
  {
    role: "Editorial Member",
    name: "Dr. Avik K Das",
    position: "Assistant Professor, UEM Kolkata",
  },
  {
    role: "Editorial Member",
    name: "Dr. Priyajit Biswas",
    position: "Assistant Professor, NSEC, Kolkata",
  },
  {
    role: "Faculty Advisor",
    name: "Dr. Jisy N K",
    position: "Assistant Professor, Dayananda Sagar University",
  },
  {
    role: "Faculty Advisor",
    name: "Dr. Abhinav Karan",
    position: "Assistant Professor, Dayananda Sagar University",
  },
  {
    role: "Professor",
    name: "Dr. Debiprasad Priyabrata Acharya",
    position: "Professor, NIT Rourkela",
  },
  {
    role: "Associate Professor",
    name: "Dr. Priyadarsan Parida",
    position: "Associate Professor, GIET University",
  },
  {
    role: "Assistant Professor",
    name: "Dr. Shasanka Sekhar Rout",
    position: "Assistant Professor, GLA University",
  },
  {
    role: "Assistant Professor",
    name: "Dr. Suraj Prakash Sahoo",
    position: "Assistant Professor, VIT Vellore",
  },
];
export const data: GuideData[] = [
  {
    title: "about-us",
    content: (
      <div className="w-full space-y-0">

        {/* ── Hero Banner ── */}
        <div className=" overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 px-4 py-7 md:py-10">
          {/* Decorative circles */}
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-2xl" />
          <div className="relative max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5">
              <BookOpen className="w-3.5 h-3.5" /> Journal of Embedded & Digital System Design
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
              About <span className="text-blue-400">JEDSD</span>
            </h1>
            <p className="text-blue-100/80 text-base md:text-lg leading-relaxed max-w-2xl text-justify">
              Advancing embedded and digital system design through rigorous, open-access research publication — empowering engineers and researchers worldwide.
            </p>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="bg-white border-b border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
            {[
              { icon: BookOpen, value: '2024', label: 'Established' },
              { icon: Globe, value: 'Open Access', label: 'Publication Model' },
              { icon: Shield, value: 'Double-Blind', label: 'Peer Review' },
              { icon: Award, value: 'DOI + ISSN', label: 'Every Article' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex flex-col items-center justify-center py-6 px-4 text-center">
                <Icon className="w-5 h-5 text-blue-600 mb-2" />
                <div className="text-lg font-bold text-gray-900">{value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Content Area ── */}
        <div className="px-2 py-6 mx-auto space-y-12">

          {/* Our Story */}
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Our Foundation</h2>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
              <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                A nation&apos;s dream is to build a ubiquitous digital infrastructure that ensures ease of living for its people.
                The growth in digital infrastructure relies entirely on the development of secure, fast, and reliable digital
                hardware platforms. Innovative techniques must be adopted to develop cheaper yet high-performing embedded or digital systems.
              </p>
            </div>
          </section>

          {/* What is JEDSD */}
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-4 h-4 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Our Platform</h2>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-xl p-6">
              <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                The <strong>Journal of Embedded and Digital System Design (JEDSD)</strong> is a platform where researchers can publish
                emerging techniques for the design of embedded or digital systems. JEDSD is an open-access journal that aims to publish
                full-length manuscripts on emerging design techniques for embedded and digital systems, covering a broad spectrum of this domain.
              </p>
            </div>
          </section>

          {/* Our Objective */}
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Target className="w-4 h-4 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Our Objective</h2>
            </div>
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-6">
              <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                The objective of this journal is to motivate students right from graduation to focus on developing innovative designs,
                to inspire researchers to propose novel ideas in digital hardware development, and to provide researchers with a
                platform through which their research can reach the global scientific community.
              </p>
            </div>
          </section>

          {/* Why JEDSD */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Why Choose JEDSD?</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-100', title: 'Innovation Focus', items: ['Emerging design techniques', 'Novel hardware platforms', 'Innovative system architectures', 'Advanced optimization methods'] },
                { icon: Shield, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', title: 'Quality Assurance', items: ['Expert reviewer network', 'Ethical publication standards', 'Open access model', 'Global research impact'] },
                { icon: Globe, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100', title: 'Global Reach', items: ['Worldwide author community', 'International editorial board', 'Indexed and discoverable', 'Free-to-access articles'] },
                { icon: Award, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', title: 'Credibility', items: ['DOI assigned per article', 'ISSN registered journal', 'Double-blind review', 'Transparent process'] },
              ].map(({ icon: Icon, color, bg, border, title, items }) => (
                <div key={title} className={`${bg} ${border} border rounded-xl p-5`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm`}>
                      <Icon className={`w-4 h-4 ${color}`} />
                    </div>
                    <h3 className="font-semibold text-gray-900">{title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {items.map(item => (
                      <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-2">Ready to publish with JEDSD?</h2>
            <p className="text-blue-100 mb-6 text-sm">Submit your manuscript and join our growing community of researchers.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/guides/submission-guidelines" className="bg-white text-blue-700 font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-blue-50 transition-colors inline-block">
                Submission Guidelines
              </Link>
              <Link href="/guides/contact-us" className="bg-white/10 border border-white/30 text-white font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-white/20 transition-colors inline-block">
                Contact Us
              </Link>
            </div>
          </section>

        </div>
      </div>
    ),
  },
  {
    title: "mission-vision",
    content: (
      <div className="md:p-4">
        <div className="space-y-6 md:space-y-8">
          <div className="text-center">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">Our Mission and Vision</h2>
            <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
              Driving innovation in embedded and digital system design through 
              world-class research publication and academic excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {/* Vision Section */}
            <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-blue-100/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-3 text-blue-900 text-lg md:text-xl">
                  <Target className="w-5 h-5 md:w-6 md:h-6" />
                  <span>Vision Statement</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                  The vision of the <strong>Journal of Embedded and Digital System Design (JEDSD)</strong> is to:
                </p>
                
                <div className="space-y-4">
                  <div className="bg-white/50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <h4 className="font-semibold text-sm md:text-base">Research Leadership</h4>
                    </div>
                    <ul className="space-y-1 text-xs md:text-sm text-gray-700">
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Advance algorithm development and optimization</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Promote best design metrics practices</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Foster innovative research methodologies</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center bg-white/50 rounded-lg p-3">
                      <div className="flex justify-center mb-2">
                        <Award className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="text-lg md:text-xl font-bold text-gray-900">Q4</div>
                      <div className="text-xs text-gray-600">Target Quartile</div>
                    </div>
                    <div className="text-center bg-white/50 rounded-lg p-3">
                      <div className="flex justify-center mb-2">
                        <Globe className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="text-lg md:text-xl font-bold text-gray-900">SCOPUS</div>
                      <div className="text-xs text-gray-600">Indexing Goal</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mission Section */}
            <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-green-100/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-3 text-green-900 text-lg md:text-xl">
                  <Lightbulb className="w-5 h-5 md:w-6 md:h-6" />
                  <span>Mission Statement</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                  In achieving our vision, our mission focuses on:
                </p>
                
                <div className="bg-white/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-green-600" />
                    <h4 className="font-semibold text-sm md:text-base">Publication Excellence</h4>
                  </div>
                  <ul className="space-y-1 text-xs md:text-sm text-gray-700">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Publish quality original manuscripts periodically</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Maintain author trust through ethical practices</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Focus on research novelty and significance</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Ensure global research accessibility</span>
                    </li>
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center bg-white/50 rounded-lg p-3">
                    <div className="flex justify-center mb-2">
                      <Shield className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-lg md:text-xl font-bold text-gray-900">DOI</div>
                    <div className="text-xs text-gray-600">For each article</div>
                  </div>
                  <div className="text-center bg-white/50 rounded-lg p-3">
                    <div className="flex justify-center mb-2">
                      <Star className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-lg md:text-xl font-bold text-gray-900">ISSN</div>
                    <div className="text-xs text-gray-600">Serial Number</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          <div className="space-y-6">
            <h3 className="text-xl md:text-2xl font-bold text-center text-gray-900">Our Strategic Goals</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="p-3 md:p-4 bg-blue-100 rounded-full">
                      <Zap className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
                    </div>
                    <h4 className="font-bold text-base md:text-lg">Innovation Focus</h4>
                    <p className="text-gray-600 text-sm">
                      Promote cutting-edge research in embedded systems, IoT, and digital design
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="p-3 md:p-4 bg-green-100 rounded-full">
                      <Globe className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
                    </div>
                    <h4 className="font-bold text-base md:text-lg">Global Reach</h4>
                    <p className="text-gray-600 text-sm">
                      Connect researchers worldwide and become the first choice for publication
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow md:col-span-1 col-span-1 mx-auto md:mx-0 max-w-sm md:max-w-none">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="p-3 md:p-4 bg-purple-100 rounded-full">
                      <Award className="w-6 h-6 md:w-8 md:h-8 text-purple-600" />
                    </div>
                    <h4 className="font-bold text-base md:text-lg">Quality First</h4>
                    <p className="text-gray-600 text-sm">
                      Prioritize quality over quantity for better citation index and recognition
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <InfoBox type="info" title="Future Vision">
            We aim to establish JEDSD as a leading journal in embedded and digital system design, 
            indexed in major databases, and recognized globally for advancing technological innovation 
            in digital infrastructure development.
          </InfoBox>
        </div>
      </div>
    ),
  },
  {
    title: "our-team",
    content: (
      <div className="md:p-4">
        <div className="space-y-6 md:space-y-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Editorial Board</h2>
            <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
              Meet our distinguished editorial team committed to advancing research in embedded and digital system design
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <StatCard
              icon={Users}
              value={members.length.toString()}
              label="Board Members"
              description="Expert researchers"
            />
            <StatCard
              icon={Globe}
              value="Global"
              label="Expertise"
              description="International network"
            />
            <StatCard
              icon={Award}
              value="PhD+"
              label="Qualifications"
              description="Advanced degrees"
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {members.map((member, index) => (
              <div key={index}>
                <Card className={`h-full transition-all duration-300 hover:shadow-lg ${
                  member.role === "Editor-in-Chief" 
                    ? "border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100/50" 
                    : "bg-white hover:bg-gray-50"
                }`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2 mb-2">
                      {member.role === "Editor-in-Chief" ? (
                        <Award className="w-5 h-5 text-blue-600" />
                      ) : member.role.includes("Editorial") ? (
                        <Users className="w-5 h-5 text-green-600" />
                      ) : member.role.includes("Faculty") ? (
                        <BookOpen className="w-5 h-5 text-purple-600" />
                      ) : (
                        <User className="w-5 h-5 text-gray-600" />
                      )}
                      <Badge 
                        variant={member.role === "Editor-in-Chief" ? "default" : "outline"}
                        className="text-xs"
                      >
                        {member.role}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg font-bold text-gray-900 leading-tight">
                      {member.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-700 font-medium">
                        {member.position}
                      </p>
                      {member.email && (
                        <div className="pt-2 border-t border-gray-100">
                          <Link 
                            href={`mailto:${member.email}`}
                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                          >
                            <Mail className="w-3 h-3" />
                            <span className="truncate">{member.email}</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg p-6">
            <h3 className="text-xl md:text-2xl font-bold text-center mb-4 text-gray-900">Join Our Editorial Network</h3>
            <p className="text-center text-gray-600 mb-6">
              We&apos;re always looking for qualified researchers to join our editorial board and reviewer network.
            </p>
            <div className="flex justify-center">
              <Link href="/guides/contact-us">
                <Button>
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Editorial Office
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "contact-us",
    content: (
      <div className="md:p-4 ">
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 text-gray-900">Contact Us</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We&apos;re here to support authors, reviewers, and the research community. 
              Get in touch with any questions about submissions, peer review, or our journal.
            </p>
          </div>
          
          <ContactForm />
          
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="grid md:grid-cols-3 gap-6">
              <StatCard
                icon={Clock}
                value="24-48h"
                label="Response Time"
                description="Average response to inquiries"
              />
              <StatCard
                icon={Users}
                value="150+"
                label="Authors Helped"
                description="Researchers we've assisted"
              />
              <StatCard
                icon={Globe}
                value="24/7"
                label="Global Access"
                description="Available worldwide"
              />
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "submission-guidelines",
    content: (
      <div className=" md:p-4">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 text-gray-900">Submission Guidelines</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Follow our comprehensive guidelines to ensure your manuscript meets JEDSD standards 
              and has the best chance of successful review and publication.
            </p>
          </div>

          <InfoBox type="info" title="Quick Start">
            The Journal of Embedded and Digital System Design (JEDSD) accepts regular original manuscripts, 
            review papers, and tutorials. All submissions must go through our online portal with proper 
            formatting and ethical compliance.
          </InfoBox>

          <div className="grid md:grid-cols-3 gap-6 my-8">
            <StatCard
              icon={FileText}
              value="PDF"
              label="Format Required"
              description="All submissions in PDF"
            />
            <StatCard
              icon={Clock}
              value="4-6 weeks"
              label="Review Time"
              description="Average review period"
            />
            <StatCard
              icon={CheckCircle}
              value="3+"
              label="Reviewers"
              description="Expert peer reviewers"
            />
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Submission Process</h2>
              <div className="space-y-6">
                <StepCard
                  step={1}
                  title="Access Online Portal"
                  description="Visit our submission portal and create an account or log in with existing credentials."
                  icon={Globe}
                />
                <StepCard
                  step={2}
                  title="Prepare Your Manuscript"
                  description="Ensure your manuscript follows our formatting guidelines and includes all required sections."
                  icon={FileText}
                />
                <StepCard
                  step={3}
                  title="Complete Submission Form"
                  description="Fill in manuscript details including title, abstract, keywords, and author information."
                  icon={Settings}
                />
                <StepCard
                  step={4}
                  title="Upload Files"
                  description="Submit your manuscript PDF, cover letter, and any supplementary materials."
                  icon={Upload}
                  isLast
                />
              </div>
            </div>

            <Separator />

            <div className="grid md:grid-cols-2 gap-8">
              <FeatureCard
                icon={CheckCircle}
                title="Submission Checklist"
                description="Essential items required for submission"
                features={[
                  "Full manuscript in PDF format",
                  "Cover letter (PDF format)",
                  "Abstract (200-250 words)",
                  "4-5 relevant keywords",
                  "Complete author details and affiliations",
                  "Ethics compliance declaration",
                  "Conflict of interest statement"
                ]}
              />
              
              <FeatureCard
                icon={Shield}
                title="Quality Standards"
                description="What we look for in submissions"
                features={[
                  "Original research contribution",
                  "Clear methodology and results",
                  "Proper citation and references",
                  "High-quality figures and tables",
                  "Adherence to ethical guidelines",
                  "Relevance to journal scope",
                  "Professional presentation"
                ]}
              />
            </div>

            <InfoBox type="warning" title="Important Notice">
              Manuscripts that do not follow our guidelines will face automatic rejection during 
              initial screening. Please review all requirements carefully before submission.
            </InfoBox>

            <div className="text-center">
              <Link href="/dashboard">
                <Button size="lg" className="px-8">
                  <Upload className="w-5 h-5 mr-2" />
                  Submit Your Manuscript
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "author-guidelines",
    content: (
      <div className=" md:p-4">
        <div className="space-y-6 md:space-y-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Author Guidelines</h2>
            <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
              Comprehensive guidelines for preparing and submitting your research to the Journal of Embedded and Digital System Design (JEDSD)
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <StatCard
              icon={FileText}
              value="IEEE Style"
              label="Citation Format"
              description="Standard academic format"
            />
            <StatCard
              icon={CheckCircle}
              value="Quality"
              label="Standards"
              description="High publication standards"
            />
            <StatCard
              icon={Clock}
              value="Fast"
              label="Review"
              description="Efficient peer review"
            />
          </div>

          <InfoBox 
            type="warning"
            title="Important Notice"
            description="Manuscripts that have not followed the journal guidelines will face automatic rejection. Authors should carefully review all guidelines before submission."
          />

          <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <StepCard
                step={1}
                title="Subject Area & Title"
                description="Choose the right category and craft an effective title"
              >
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <Target className="w-4 h-4 mr-2 text-blue-600" />
                      Subject Area
                    </h4>
                    <p className="text-sm text-gray-600">
                      Identify the sub-domain or article type that best matches your manuscript for proper categorization.
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-blue-600" />
                      Title Guidelines
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li className="flex items-start">
                        <CheckCircle className="w-3 h-3 mr-2 text-green-600 mt-1 flex-shrink-0" />
                        Concise and informative
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-3 h-3 mr-2 text-green-600 mt-1 flex-shrink-0" />
                        Include key invention and methodology
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-3 h-3 mr-2 text-green-600 mt-1 flex-shrink-0" />
                        Avoid abbreviations and formulae
                      </li>
                    </ul>
                  </div>
                </div>
              </StepCard>

              <StepCard
                step={2}
                title="Abstract & Keywords"
                description="Create compelling abstracts and strategic keywords"
              >
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Abstract Requirements</h4>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-700">Word Count</span>
                      <Badge variant="outline">200-250 words</Badge>
                    </div>
                    <p className="text-xs text-gray-600">
                      Summarize research question, methodology, results, and conclusion
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Keywords Strategy</h4>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-700">Recommended Count</span>
                      <Badge variant="outline">4-5 keywords</Badge>
                    </div>
                    <p className="text-xs text-gray-600">
                      Choose carefully to increase research visibility and indexing
                    </p>
                  </div>
                </div>
              </StepCard>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Manuscript Structure</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FeatureCard
                  icon={BookOpen}
                  title="Introduction"
                  description="Context, objectives, and significance. Strong literature survey with prior works discussion."
                />
                <FeatureCard
                  icon={Lightbulb}
                  title="Background Work"
                  description="Brief theory, detailed methodology, procedures, and analysis techniques with citations."
                />
                <FeatureCard
                  icon={Zap}
                  title="Proposed Work"
                  description="Detailed discussion with images, figures, and tables supporting the methodology."
                />
                <FeatureCard
                  icon={TrendingUp}
                  title="Results & Comparison"
                  description="Clear findings presentation with appropriate tables, figures, and state-of-art comparison."
                />
                <FeatureCard
                  icon={MessageCircle}
                  title="Discussion"
                  description="Interpretation of results, implications, limitations, and future directions."
                />
                <FeatureCard
                  icon={CheckCircle}
                  title="Conclusion"
                  description="Summary of findings and their significance to the research community."
                />
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 text-center">Technical Guidelines</h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                    References (IEEE Style)
                  </h4>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Follow IEEE citation style. No minimum/maximum limits but cite relevant works appropriately.
                    </p>
                    <InfoBox 
                      type="warning"
                      title="Citation Ethics"
                      description="JEDSD highly discourages improper self-citation. Cite all tables, images, and datasets properly."
                    />
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Eye className="w-5 h-5 mr-2 text-blue-600" />
                    Figures & Images
                  </h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <Badge variant="outline">JPG</Badge>
                      <Badge variant="outline">JPEG</Badge>
                      <Badge variant="outline">PNG</Badge>
                      <Badge variant="outline">PDF</Badge>
                    </div>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li className="flex items-start">
                        <CheckCircle className="w-3 h-3 mr-2 text-green-600 mt-1 flex-shrink-0" />
                        High-quality images required
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-3 h-3 mr-2 text-green-600 mt-1 flex-shrink-0" />
                        Proper legends, labels, and titles
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-3 h-3 mr-2 text-green-600 mt-1 flex-shrink-0" />
                        Captions below images in sentence case
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-blue-600" />
                    Tables & Data
                  </h4>
                  <div className="space-y-3">
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li className="flex items-start">
                        <CheckCircle className="w-3 h-3 mr-2 text-green-600 mt-1 flex-shrink-0" />
                        Tables must be editable (not images)
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-3 h-3 mr-2 text-green-600 mt-1 flex-shrink-0" />
                        Captions above tables in sentence case
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-3 h-3 mr-2 text-green-600 mt-1 flex-shrink-0" />
                        Content fits within text width
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Award className="w-5 h-5 mr-2 text-blue-600" />
                    Mathematical Content
                  </h4>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Equations</span>
                        <Badge variant="secondary">Numbered & Editable</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Algorithms</span>
                        <Badge variant="secondary">Numbered & Written</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600">
                      No images for equations or algorithms - must be written text
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4 text-center">Reference Format Guide</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="bg-white rounded p-4">
                  <strong className="text-blue-600">Figures:</strong> Fig. 4
                </div>
                <div className="bg-white rounded p-4">
                  <strong className="text-green-600">Tables:</strong> Table IV
                </div>
                <div className="bg-white rounded p-4">
                  <strong className="text-purple-600">Algorithms:</strong> Algorithm 4
                </div>
                <div className="bg-white rounded p-4">
                  <strong className="text-orange-600">Equations:</strong> equation (1)
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 text-center">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Ready to Submit Your Manuscript?</h3>
              <p className="text-gray-600 mb-6">
                Ensure your manuscript follows all guidelines for the best chance of acceptance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button>
                  <Download className="w-4 h-4 mr-2" />
                  Download Guidelines PDF
                </Button>
                <Button variant="outline">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Submission Checklist
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "ethical-guidelines",
    content: (
      <div className=" md:p-4">
        <div className="space-y-6 md:space-y-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Ethical Guidelines</h2>
            <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
              Comprehensive ethical standards ensuring research integrity and publication ethics
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <StatCard
              icon={Shield}
              value="< 10%"
              label="Plagiarism Limit"
              description="Excluding references"
            />
            <StatCard
              icon={CheckCircle}
              value="Original"
              label="Work Required"
              description="No prior publication"
            />
            <StatCard
              icon={Users}
              value="All Authors"
              label="Contributions"
              description="Significant involvement"
            />
          </div>

          <InfoBox 
            type="warning"
            title="Mandatory Compliance"
            description="All manuscripts undergo originality checks before review. Non-compliance with ethical guidelines results in immediate rejection and potential submission ban."
          />

          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Core Ethical Principles</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <StepCard
                  step={1}
                  title="Originality & Plagiarism"
                  description="Maintain research integrity and avoid academic misconduct"
                >
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-4 border-l-4 border-red-500">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-2 text-red-600" />
                        Strict Requirements
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start">
                          <CheckCircle className="w-3 h-3 mr-2 text-green-600 mt-1 flex-shrink-0" />
                          Must be original, unpublished work
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-3 h-3 mr-2 text-green-600 mt-1 flex-shrink-0" />
                          Not under consideration elsewhere
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-3 h-3 mr-2 text-green-600 mt-1 flex-shrink-0" />
                          Similarity ≤10% (excluding references)
                        </li>
                      </ul>
                    </div>
                    
                    <InfoBox 
                      type="error"
                      title="Multiple Submission Ban"
                      description="Authors found submitting to multiple journals simultaneously will be permanently barred from future submissions."
                    />
                  </div>
                </StepCard>

                <StepCard
                  step={2}
                  title="Authorship Standards"
                  description="Ensure fair and accurate author representation"
                >
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <Users className="w-4 h-4 mr-2 text-blue-600" />
                        Contribution Requirements
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start">
                          <CheckCircle className="w-3 h-3 mr-2 text-green-600 mt-1 flex-shrink-0" />
                          Significant contribution to research
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-3 h-3 mr-2 text-green-600 mt-1 flex-shrink-0" />
                          Involvement in manuscript preparation
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-3 h-3 mr-2 text-green-600 mt-1 flex-shrink-0" />
                          No ghost or honorary authors
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Corresponding Author</h4>
                      <p className="text-sm text-gray-600">
                        Designated point of contact responsible for all journal communications. Changes require editor-in-chief approval.
                      </p>
                    </div>
                  </div>
                </StepCard>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Data Integrity & Research Ethics</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <StepCard
                  step={3}
                  title="Data Fabrication & Falsification"
                  description="Maintain absolute data integrity throughout research"
                >
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 border-l-4 border-purple-500">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <Shield className="w-4 h-4 mr-2 text-purple-600" />
                        Data Standards
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start">
                          <CheckCircle className="w-3 h-3 mr-2 text-green-600 mt-1 flex-shrink-0" />
                          All data must be accurate and unmanipulated
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-3 h-3 mr-2 text-green-600 mt-1 flex-shrink-0" />
                          No fabrication or falsification
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-3 h-3 mr-2 text-green-600 mt-1 flex-shrink-0" />
                          Raw data available for verification
                        </li>
                      </ul>
                    </div>
                    
                    <InfoBox 
                      type="warning"
                      title="Verification Process"
                      description="Authors may be required to provide raw data for verification purposes to ensure research integrity."
                    />
                  </div>
                </StepCard>

                <StepCard
                  step={4}
                  title="Publication Ethics"
                  description="Adhere to international publication standards"
                >
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <FeatureCard
                        icon={FileText}
                        title="Proper Citation"
                        description="Acknowledge all sources and avoid improper self-citation practices"
                      />
                      <FeatureCard
                        icon={Globe}
                        title="International Standards"
                        description="Follow COPE guidelines and international research ethics"
                      />
                      <FeatureCard
                        icon={Award}
                        title="Quality Assurance"
                        description="Maintain high standards in research methodology and reporting"
                      />
                    </div>
                  </div>
                </StepCard>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6">
              <h3 className="text-xl md:text-2xl font-bold text-center mb-4 text-gray-900">Plagiarism Detection Process</h3>
              <div className="grid md:grid-cols-4 gap-4 text-center">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Upload className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-sm text-gray-900">1. Submission</h4>
                  <p className="text-xs text-gray-600">Author submits manuscript</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Search className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-sm text-gray-900">2. Screening</h4>
                  <p className="text-xs text-gray-600">Automated plagiarism check</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Eye className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-sm text-gray-900">3. Review</h4>
                  <p className="text-xs text-gray-600">Editorial assessment</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="w-6 h-6 text-orange-600" />
                  </div>
                  <h4 className="font-semibold text-sm text-gray-900">4. Decision</h4>
                  <p className="text-xs text-gray-600">Accept or reject</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-6 border-l-4 border-red-500">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                Consequences of Ethical Violations
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Immediate Actions</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Manuscript rejection
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Author notification
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Documentation of violation
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Long-term Consequences</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Submission ban (severe cases)
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Institution notification
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Professional reputation impact
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "conflict-of-interest",
    content: (
      <div className="md:p-4">
        <div className="space-y-6 md:space-y-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Conflict of Interest Policy</h2>
            <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
              Ensuring transparency and integrity in the publication process through comprehensive conflict disclosure
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <StatCard
              icon={Shield}
              value="100%"
              label="Transparency"
              description="Full disclosure required"
            />
            <StatCard
              icon={Eye}
              value="All Parties"
              label="Coverage"
              description="Authors, reviewers, editors"
            />
            <StatCard
              icon={CheckCircle}
              value="Mandatory"
              label="Declaration"
              description="Required for all submissions"
            />
          </div>

          <InfoBox 
            type="info"
            title="Comprehensive Review"
            description="The editorial board checks for conflicts of interest during initial review and throughout the entire publication process. Authors must proactively declare any potential conflicts."
          />

          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Understanding Conflicts of Interest</h3>
              
              <StepCard
                step={1}
                title="Definition & Scope"
                description="Understanding what constitutes a conflict of interest"
              >
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border-l-4 border-blue-500">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <Info className="w-4 h-4 mr-2 text-blue-600" />
                      Conflict Definition
                    </h4>
                    <p className="text-sm text-gray-700">
                      A conflict of interest occurs when financial, personal, or professional affiliations could influence research conduct, interpretation of results, or publication decisions.
                    </p>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <FeatureCard
                      icon={TrendingUp}
                      title="Financial"
                      description="Funding, employment, consultancies, stock ownership, honoraria"
                    />
                    <FeatureCard
                      icon={Users}
                      title="Personal"
                      description="Family relationships, personal friendships, rivalries"
                    />
                    <FeatureCard
                      icon={Award}
                      title="Professional"
                      description="Institutional affiliations, academic collaborations"
                    />
                  </div>
                </div>
              </StepCard>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Disclosure Requirements by Role</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <StepCard
                  step={2}
                  title="Author Responsibilities"
                  description="Comprehensive disclosure requirements for all contributing authors"
                >
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Users className="w-4 h-4 mr-2 text-green-600" />
                        Required Disclosures
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start">
                          <CheckCircle className="w-3 h-3 mr-2 text-green-600 mt-1 flex-shrink-0" />
                          Financial support and funding sources
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-3 h-3 mr-2 text-green-600 mt-1 flex-shrink-0" />
                          Employment relationships
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-3 h-3 mr-2 text-green-600 mt-1 flex-shrink-0" />
                          Consultancy agreements
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-3 h-3 mr-2 text-green-600 mt-1 flex-shrink-0" />
                          Stock ownership and financial interests
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-3 h-3 mr-2 text-green-600 mt-1 flex-shrink-0" />
                          Paid expert testimony
                        </li>
                      </ul>
                    </div>
                    
                    <InfoBox 
                      type="warning"
                      title="Additional Requirements"
                      description="Authors must obtain permission from funding organizations for funded project publications and secure rights for all images, tables, and figures used."
                    />
                  </div>
                </StepCard>

                <StepCard
                  step={3}
                  title="Reviewer & Editor Standards"
                  description="Conflict identification and management for review process"
                >
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Eye className="w-4 h-4 mr-2 text-purple-600" />
                        Reviewer Obligations
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start">
                          <CheckCircle className="w-3 h-3 mr-2 text-green-600 mt-1 flex-shrink-0" />
                          Pre-review conflict assessment
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-3 h-3 mr-2 text-green-600 mt-1 flex-shrink-0" />
                          Immediate disclosure of conflicts
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-3 h-3 mr-2 text-green-600 mt-1 flex-shrink-0" />
                          Recusal when conflicts exist
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Award className="w-4 h-4 mr-2 text-orange-600" />
                        Editorial Board
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start">
                          <CheckCircle className="w-3 h-3 mr-2 text-green-600 mt-1 flex-shrink-0" />
                          Transparent conflict disclosure
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-3 h-3 mr-2 text-green-600 mt-1 flex-shrink-0" />
                          Recusal from conflicted manuscripts
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-3 h-3 mr-2 text-green-600 mt-1 flex-shrink-0" />
                          Alternative handling arrangements
                        </li>
                      </ul>
                    </div>
                  </div>
                </StepCard>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6">
              <h3 className="text-xl md:text-2xl font-bold text-center mb-6 text-gray-900">Conflict Management Process</h3>
              <div className="grid md:grid-cols-4 gap-4">
                <TimelineItem
                  step={1}
                  title="Declaration"
                  description="Authors submit conflict disclosure forms"
                  isActive={true}
                />
                <TimelineItem
                  step={2}
                  title="Assessment"
                  description="Editorial board reviews potential conflicts"
                  isActive={false}
                />
                <TimelineItem
                  step={3}
                  title="Management"
                  description="Implement appropriate conflict mitigation"
                  isActive={false}
                />
                <TimelineItem
                  step={4}
                  title="Documentation"
                  description="Record conflict handling decisions"
                  isActive={false}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-blue-600" />
                  Common Conflict Types
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">Financial Sponsorship</span>
                    <Badge variant="outline">High Risk</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">Institutional Affiliation</span>
                    <Badge variant="outline">Medium Risk</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">Personal Relationships</span>
                    <Badge variant="outline">Variable Risk</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">Previous Collaboration</span>
                    <Badge variant="outline">Low-Medium Risk</Badge>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-green-600" />
                  Mitigation Strategies
                </h4>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded border-l-4 border-green-500">
                    <h5 className="font-medium text-gray-900">Transparency</h5>
                    <p className="text-xs text-gray-600">Full disclosure in published articles</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                    <h5 className="font-medium text-gray-900">Recusal</h5>
                    <p className="text-xs text-gray-600">Remove conflicted parties from process</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded border-l-4 border-purple-500">
                    <h5 className="font-medium text-gray-900">Independent Review</h5>
                    <p className="text-xs text-gray-600">Additional oversight mechanisms</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded border-l-4 border-orange-500">
                    <h5 className="font-medium text-gray-900">Documentation</h5>
                    <p className="text-xs text-gray-600">Detailed record keeping</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 text-center">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Questions About Conflicts?</h3>
              <p className="text-gray-600 mb-6">
                When in doubt, disclose. Our editorial team is available to help assess potential conflicts of interest.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button>
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Editorial Office
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Disclosure Form
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "publishing-model",
    content: (
      <div className="md:p-4">
        <div className="space-y-6 md:space-y-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Publishing Model</h2>
            <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
              A comprehensive approach to scholarly publishing in embedded and digital system design
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={Target}
              value="New"
              label="Platform"
              description="Fresh innovative approach"
            />
            <StatCard
              icon={Users}
              value="Expert"
              label="Reviewers"
              description="Reputed university faculty"
            />
            <StatCard
              icon={Award}
              value="Quality"
              label="Focus"
              description="High-impact research"
            />
            <StatCard
              icon={TrendingUp}
              value="0 APC"
              label="Current Fee"
              description="No processing charges"
            />
          </div>

          <div className="space-y-8">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Journal Vision & Mission</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Lightbulb className="w-5 h-5 mr-2 text-blue-600" />
                    Our Vision
                  </h4>
                  <p className="text-gray-700 text-sm">
                    To become one of the premier quality journals globally in embedded and digital system design, 
                    focusing on a specific domain of prime importance and emerging technologies.
                  </p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-green-600" />
                    Our Mission
                  </h4>
                  <p className="text-gray-700 text-sm">
                    To provide a platform for researchers to publish high-quality, peer-reviewed manuscripts 
                    that advance the field of embedded and digital system design.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Publication Framework</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <StepCard
                  step={1}
                  title="Quality-Focused Approach"
                  description="Emphasis on research excellence and innovation"
                >
                  <div className="space-y-4">
                    <FeatureCard
                      icon={BookOpen}
                      title="Rigorous Peer Review"
                      description="Manuscripts reviewed by esteemed experts from reputed universities worldwide"
                    />
                    <FeatureCard
                      icon={TrendingUp}
                      title="Continuous Improvement"
                      description="Manuscripts enhanced based on comprehensive reviewer feedback"
                    />
                    <FeatureCard
                      icon={Award}
                      title="Excellence Standards"
                      description="Maintaining high publication standards for maximum research impact"
                    />
                  </div>
                </StepCard>

                <StepCard
                  step={2}
                  title="Indexing & Recognition Strategy"
                  description="Building academic credibility and visibility"
                >
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <Globe className="w-4 h-4 mr-2 text-green-600" />
                        Current Status
                      </h4>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li className="flex items-start">
                          <CheckCircle className="w-3 h-3 mr-2 text-green-600 mt-1 flex-shrink-0" />
                          Applying for ISSN number
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-3 h-3 mr-2 text-green-600 mt-1 flex-shrink-0" />
                          Planning for index systems
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-3 h-3 mr-2 text-green-600 mt-1 flex-shrink-0" />
                          Building citation impact
                        </li>
                      </ul>
                    </div>
                    
                    <InfoBox 
                      type="info"
                      title="Progressive Indexing"
                      description="Gradual application to different indexing systems to build journal credibility and academic recognition."
                    />
                  </div>
                </StepCard>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Publication Timeline & Process</h3>
              <div className="grid md:grid-cols-4 gap-4">
                <TimelineItem
                  step={1}
                  title="Submission"
                  description="Authors submit manuscripts via online system"
                  isActive={true}
                />
                <TimelineItem
                  step={2}
                  title="Peer Review"
                  description="Expert reviewers assess quality and significance"
                  isActive={false}
                />
                <TimelineItem
                  step={3}
                  title="Revision"
                  description="Authors address reviewer comments and suggestions"
                  isActive={false}
                />
                <TimelineItem
                  step={4}
                  title="Publication"
                  description="Accepted manuscripts published with full indexing"
                  isActive={false}
                />
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Financial Model & Accessibility</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 border-l-4 border-green-500">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                    No Article Processing Charges (APC)
                  </h4>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-700">
                      Currently, no APC charges are applied to encourage quality research submissions and support emerging researchers.
                    </p>
                    <div className="bg-white rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-800">Current Processing Fee</span>
                        <Badge className="bg-green-100 text-green-800">$0 USD</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 border-l-4 border-blue-500">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-blue-600" />
                    Supporting Research Community
                  </h4>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-700">
                      The waiver of APC charges motivates researchers to publish quality manuscripts and removes financial barriers to publication.
                    </p>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li className="flex items-start">
                        <CheckCircle className="w-3 h-3 mr-2 text-green-600 mt-1 flex-shrink-0" />
                        Open access to quality research
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-3 h-3 mr-2 text-green-600 mt-1 flex-shrink-0" />
                        Support for early-career researchers
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-3 h-3 mr-2 text-green-600 mt-1 flex-shrink-0" />
                        Global accessibility
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6">
              <h3 className="text-xl font-bold text-center mb-4 text-gray-900">Growth Metrics & Projections</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Annual Publications</h4>
                  <p className="text-2xl font-bold text-blue-600">Targeted Growth</p>
                  <p className="text-xs text-gray-600">Quality over quantity approach</p>
                </div>
                <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Star className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Impact Factor</h4>
                  <p className="text-2xl font-bold text-purple-600">Building</p>
                  <p className="text-xs text-gray-600">Through quality citations</p>
                </div>
                <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Globe className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Global Reach</h4>
                  <p className="text-2xl font-bold text-green-600">Expanding</p>
                  <p className="text-xs text-gray-600">International indexing plans</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 text-center">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Join Our Growing Community</h3>
              <p className="text-gray-600 mb-6">
                Be part of a journal that prioritizes quality research and supports the global research community in embedded and digital systems.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button>
                  <Upload className="w-4 h-4 mr-2" />
                  Submit Manuscript
                </Button>
                <Button variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Join Review Board
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "call-for-papers",
    content: (
      <div className="md:p-4">
        <div className="space-y-8">
          <div className="text-center">
            <Badge className="mb-4 bg-green-100 text-green-800 px-4 py-2">
              <span className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span>SUBMISSIONS OPEN</span>
              </span>
            </Badge>
            <h1 className="text-4xl font-bold mb-4 text-gray-900">Call For Papers</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We invite original, high-quality research manuscripts that advance the field of 
              embedded and digital system design. Join our community of innovative researchers.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <StatCard
              icon={Clock}
              value="Year-Round"
              label="Submission Window"
              description="Always accepting papers"
            />
            <StatCard
              icon={BookOpen}
              value="7 Domains"
              label="Research Areas"
              description="Core focus areas"
            />
            <StatCard
              icon={Users}
              value="Global"
              label="Author Base"
              description="Worldwide submissions"
            />
          </div>

          <InfoBox type="success" title="Open Submission Policy">
            Authors can submit their manuscripts throughout the year through our online portal. 
            We welcome both theoretical contributions and practical implementations.
          </InfoBox>

          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Research Scope & Domains</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <FeatureCard
                  icon={Settings}
                  title="FPGA Implementation"
                  description="Reconfigurable hardware for digital systems"
                  features={[
                    "Signal processing algorithms",
                    "Image and video processing",
                    "Machine learning implementations",
                    "Neural network accelerators",
                    "Digital signal processing"
                  ]}
                />

                <FeatureCard
                  icon={Zap}
                  title="VLSI & ASIC Design"
                  description="Custom silicon implementations"
                  features={[
                    "Application-specific designs",
                    "Low-power implementations",
                    "High-performance computing",
                    "Custom processor designs",
                    "System-on-chip solutions"
                  ]}
                />

                <FeatureCard
                  icon={Globe}
                  title="Processor-Based Systems"
                  description="CPU, GPU, and DSP implementations"
                  features={[
                    "Embedded processor design",
                    "Parallel processing systems",
                    "Real-time implementations",
                    "Multi-core architectures",
                    "Hardware-software co-design"
                  ]}
                />

                <FeatureCard
                  icon={Target}
                  title="Embedded Systems"
                  description="Complete system implementations"
                  features={[
                    "IoT device development",
                    "Sensor integration",
                    "Control system design",
                    "Automotive electronics",
                    "Medical device systems"
                  ]}
                />

                <FeatureCard
                  icon={Shield}
                  title="IoT & Industrial IoT"
                  description="Connected system innovations"
                  features={[
                    "Communication protocols",
                    "Edge computing solutions",
                    "Industrial automation",
                    "Smart city applications",
                    "Healthcare IoT systems"
                  ]}
                />

                <FeatureCard
                  icon={Lightbulb}
                  title="Theoretical Development"
                  description="Algorithm and technique innovation"
                  features={[
                    "Novel algorithms",
                    "Optimization techniques",
                    "Design methodologies",
                    "Performance analysis",
                    "Security frameworks"
                  ]}
                />
              </div>
            </div>

            <Separator />

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8">
              <h3 className="text-2xl font-bold text-center mb-6 text-gray-900">Special Focus Areas</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold mb-3 text-blue-900">Emerging Technologies</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>AI/ML hardware acceleration</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Quantum computing interfaces</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Edge AI implementations</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>5G/6G embedded systems</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-3 text-purple-900">Application Domains</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Healthcare and biomedical</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Automotive and transportation</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Defense and security</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Environmental monitoring</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <InfoBox type="info" title="Submission Support">
              If you experience any issues with our online portal, please contact our editorial team. 
              We&apos;re here to assist authors throughout the submission process.
            </InfoBox>

            <div className="text-center">
              <Link href="/dashboard">
                <Button size="lg" className="px-8">
                  <Upload className="w-5 h-5 mr-2" />
                  Submit Your Research
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "how-we-publish",
    content: (
      <div className=" md:p-4">
        <div className="space-y-6 md:space-y-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How We Publish</h2>
            <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
              Our comprehensive publication process ensures rigorous quality control and efficient dissemination of research
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={Upload}
              value="Online"
              label="Submission"
              description="Digital platform"
            />
            <StatCard
              icon={Users}
              value="Expert"
              label="Review"
              description="Field specialists"
            />
            <StatCard
              icon={CheckCircle}
              value="Quality"
              label="Control"
              description="Rigorous standards"
            />
            <StatCard
              icon={Globe}
              value="Open"
              label="Access"
              description="Global availability"
            />
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Publication Workflow</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StepCard
                  step={1}
                  title="Manuscript Submission"
                  description="Authors submit through our online system"
                >
                  <div className="space-y-3">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <h5 className="font-medium text-gray-900 mb-1">Platform Features</h5>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• User-friendly interface</li>
                        <li>• Real-time status tracking</li>
                        <li>• Secure file upload</li>
                        <li>• Automated confirmations</li>
                      </ul>
                    </div>
                    <div className="text-center">
                      <Badge variant="outline" className="text-xs">
                        24/7 Available
                      </Badge>
                    </div>
                  </div>
                </StepCard>

                <StepCard
                  step={2}
                  title="Peer Review Process"
                  description="Thorough evaluation by field experts"
                >
                  <div className="space-y-3">
                    <div className="bg-green-50 rounded-lg p-3">
                      <h5 className="font-medium text-gray-900 mb-1">Review Standards</h5>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Double-blind review</li>
                        <li>• Multiple expert reviewers</li>
                        <li>• Comprehensive evaluation</li>
                        <li>• Constructive feedback</li>
                      </ul>
                    </div>
                    <div className="text-center">
                      <Badge variant="outline" className="text-xs">
                        Expert Panel
                      </Badge>
                    </div>
                  </div>
                </StepCard>

                <StepCard
                  step={3}
                  title="Revision & Improvement"
                  description="Authors enhance manuscripts based on feedback"
                >
                  <div className="space-y-3">
                    <div className="bg-purple-50 rounded-lg p-3">
                      <h5 className="font-medium text-gray-900 mb-1">Revision Support</h5>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Detailed reviewer comments</li>
                        <li>• Editorial guidance</li>
                        <li>• Multiple revision rounds</li>
                        <li>• Quality enhancement</li>
                      </ul>
                    </div>
                    <div className="text-center">
                      <Badge variant="outline" className="text-xs">
                        Collaborative
                      </Badge>
                    </div>
                  </div>
                </StepCard>

                <StepCard
                  step={4}
                  title="Publication & Distribution"
                  description="Global research community access"
                >
                  <div className="space-y-3">
                    <div className="bg-orange-50 rounded-lg p-3">
                      <h5 className="font-medium text-gray-900 mb-1">Publication Features</h5>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Online publication</li>
                        <li>• Global accessibility</li>
                        <li>• DOI assignment</li>
                        <li>• Indexing submission</li>
                      </ul>
                    </div>
                    <div className="text-center">
                      <Badge variant="outline" className="text-xs">
                        Worldwide
                      </Badge>
                    </div>
                  </div>
                </StepCard>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6">
              <h3 className="text-xl md:text-2xl font-bold text-center mb-6 text-gray-900">Publication Timeline</h3>
              <div className="grid md:grid-cols-5 gap-4">
                <TimelineItem
                  step={1}
                  title="Initial Review"
                  description="1-2 weeks for preliminary assessment"
                  isActive={true}
                />
                <TimelineItem
                  step={2}
                  title="Peer Review"
                  description="4-6 weeks for expert evaluation"
                  isActive={false}
                />
                <TimelineItem
                  step={3}
                  title="Author Response"
                  description="2-4 weeks for revisions"
                  isActive={false}
                />
                <TimelineItem
                  step={4}
                  title="Final Review"
                  description="1-2 weeks for final decision"
                  isActive={false}
                />
                <TimelineItem
                  step={5}
                  title="Publication"
                  description="1 week for online publication"
                  isActive={false}
                />
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Quality Assurance Framework</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <FeatureCard
                  icon={Shield}
                  title="Editorial Standards"
                  description="Rigorous editorial oversight ensures consistent quality and adherence to publication ethics"
                />
                <FeatureCard
                  icon={Users}
                  title="Expert Network"
                  description="Carefully selected reviewers from leading universities worldwide provide specialized expertise"
                />
                <FeatureCard
                  icon={Award}
                  title="Continuous Improvement"
                  description="Regular feedback incorporation and process refinement for enhanced publication quality"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                  Pre-Publication Checklist
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <CheckCircle className="w-3 h-3 mr-2 text-green-600 mt-1 flex-shrink-0" />
                    Manuscript format compliance
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-3 h-3 mr-2 text-green-600 mt-1 flex-shrink-0" />
                    Plagiarism screening completed
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-3 h-3 mr-2 text-green-600 mt-1 flex-shrink-0" />
                    Peer review recommendations addressed
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-3 h-3 mr-2 text-green-600 mt-1 flex-shrink-0" />
                    Final editorial approval obtained
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-3 h-3 mr-2 text-green-600 mt-1 flex-shrink-0" />
                    Metadata and indexing prepared
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-blue-600" />
                  Post-Publication Services
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <Star className="w-3 h-3 mr-2 text-yellow-500 mt-1 flex-shrink-0" />
                    DOI assignment and registration
                  </li>
                  <li className="flex items-start">
                    <Star className="w-3 h-3 mr-2 text-yellow-500 mt-1 flex-shrink-0" />
                    Indexing database submission
                  </li>
                  <li className="flex items-start">
                    <Star className="w-3 h-3 mr-2 text-yellow-500 mt-1 flex-shrink-0" />
                    Citation tracking and metrics
                  </li>
                  <li className="flex items-start">
                    <Star className="w-3 h-3 mr-2 text-yellow-500 mt-1 flex-shrink-0" />
                    Author notification services
                  </li>
                  <li className="flex items-start">
                    <Star className="w-3 h-3 mr-2 text-yellow-500 mt-1 flex-shrink-0" />
                    Ongoing archival maintenance
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 text-center">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Questions About Our Process?</h3>
              <p className="text-gray-600 mb-6">
                Our editorial team is here to guide you through every step of the publication journey.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={"/guides/contact-us"} className="bg-black rounded-md shadow-2xs text-white flex justify-center items-center gap-1 px-2 py-3">
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Editorial Office
                </Link>
                <Link href={"/"} className="bg-green-900 rounded-md shadow-2xs text-white flex justify-center items-center gap-1 px-2 py-3">
                  <Download className="w-4 h-4 mr-2" />
                  Publication Guide
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "templates",
    content: (
      <div className="md:p-4">
        <div className="space-y-6 md:space-y-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Author Resources & Templates</h2>
            <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
              Professional manuscript templates and comprehensive resources to ensure your submission meets our publication standards
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <StatCard
              icon={FileText}
              value="2 Formats"
              label="Templates"
              description="LaTeX & Word options"
            />
            <StatCard
              icon={CheckCircle}
              value="Required"
              label="Compliance"
              description="Template adherence mandatory"
            />
            <StatCard
              icon={Download}
              value="Free"
              label="Download"
              description="No cost access"
            />
          </div>

          <InfoBox 
            type="warning"
            title="Template Compliance Required"
            description="Manuscripts that do not follow the proper journal template will be rejected during the initial review stage. Please ensure strict adherence to formatting guidelines."
          />

          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Manuscript Templates</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <StepCard
                  step={1}
                  title="LaTeX Template (Recommended)"
                  description="Professional typesetting with precise formatting control"
                >
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border-l-4 border-green-500">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <Award className="w-4 h-4 mr-2 text-green-600" />
                        Preferred Format
                      </h4>
                      <p className="text-sm text-gray-700 mb-3">
                        Authors are highly encouraged to use the LaTeX template for optimal formatting and compliance.
                      </p>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li className="flex items-start">
                          <CheckCircle className="w-3 h-3 mr-2 text-green-600 mt-1 flex-shrink-0" />
                          Direct Overleaf.com compatibility
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-3 h-3 mr-2 text-green-600 mt-1 flex-shrink-0" />
                          TeX Live tools supported
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-3 h-3 mr-2 text-green-600 mt-1 flex-shrink-0" />
                          Automatic formatting compliance
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-3 h-3 mr-2 text-green-600 mt-1 flex-shrink-0" />
                          Professional mathematical typesetting
                        </li>
                      </ul>
                    </div>
                    
                    <div className="text-center">
                      <Link
                        href="/Journal_Template_latex.zip"
                        download
                        className="inline-flex"
                      >
                        <Button className="w-full">
                          <Download className="w-4 h-4 mr-2" />
                          Download LaTeX Template (.zip)
                        </Button>
                      </Link>
                    </div>
                  </div>
                </StepCard>

                <StepCard
                  step={2}
                  title="Microsoft Word Template"
                  description="Alternative format for Word users with strict guidelines"
                >
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border-l-4 border-blue-500">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-blue-600" />
                        Word Template Guidelines
                      </h4>
                      <p className="text-sm text-gray-700 mb-3">
                        Word template available for authors who prefer Microsoft Word environment.
                      </p>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li className="flex items-start">
                          <CheckCircle className="w-3 h-3 mr-2 text-green-600 mt-1 flex-shrink-0" />
                          Pre-formatted styles included
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-3 h-3 mr-2 text-green-600 mt-1 flex-shrink-0" />
                          Must submit final PDF format
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-3 h-3 mr-2 text-green-600 mt-1 flex-shrink-0" />
                          Strict formatting adherence required
                        </li>
                        <li className="flex items-start">
                          <AlertTriangle className="w-3 h-3 mr-2 text-orange-500 mt-1 flex-shrink-0" />
                          Manual formatting verification needed
                        </li>
                      </ul>
                    </div>
                    
                    <div className="text-center">
                      <Link
                        href="/Journal_Template_word.docx"
                        download
                        className="inline-flex"
                      >
                        <Button variant="outline" className="w-full">
                          <Download className="w-4 h-4 mr-2" />
                          Download Word Template (.docx)
                        </Button>
                      </Link>
                    </div>
                  </div>
                </StepCard>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Tutorial Templates</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <BookOpen className="w-4 h-4 mr-2 text-purple-600" />
                    Special Tutorial Format
                  </h4>
                  <p className="text-sm text-gray-700">
                    Separate templates are available for tutorial submissions with specialized formatting requirements.
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Settings className="w-4 h-4 mr-2 text-blue-600" />
                    Both Formats Available
                  </h4>
                  <p className="text-sm text-gray-700">
                    Tutorial templates provided in both LaTeX and Microsoft Word formats for author convenience.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Template Features & Benefits</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <FeatureCard
                  icon={Zap}
                  title="Automated Formatting"
                  description="Pre-configured styles ensure consistent formatting throughout your manuscript"
                />
                <FeatureCard
                  icon={CheckCircle}
                  title="Compliance Guarantee"
                  description="Templates designed to meet all journal requirements and submission guidelines"
                />
                <FeatureCard
                  icon={Clock}
                  title="Time Saving"
                  description="Focus on content while templates handle formatting, reducing preparation time"
                />
                <FeatureCard
                  icon={Award}
                  title="Professional Quality"
                  description="Industry-standard formatting ensures professional appearance of your research"
                />
                <FeatureCard
                  icon={Users}
                  title="Editorial Approved"
                  description="Templates reviewed and approved by our editorial board for optimal compatibility"
                />
                <FeatureCard
                  icon={Globe}
                  title="Universal Access"
                  description="Compatible with major word processing software and online platforms"
                />
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Template Usage Instructions</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-green-600" />
                    LaTeX Template Setup
                  </h4>
                  <ol className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="bg-green-100 text-green-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5 flex-shrink-0">1</span>
                      Download the LaTeX template zip file
                    </li>
                    <li className="flex items-start">
                      <span className="bg-green-100 text-green-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5 flex-shrink-0">2</span>
                      Extract files to your working directory
                    </li>
                    <li className="flex items-start">
                      <span className="bg-green-100 text-green-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5 flex-shrink-0">3</span>
                      Upload to Overleaf or use local TeX installation
                    </li>
                    <li className="flex items-start">
                      <span className="bg-green-100 text-green-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5 flex-shrink-0">4</span>
                      Replace placeholder content with your research
                    </li>
                  </ol>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-blue-600" />
                    Word Template Setup
                  </h4>
                  <ol className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5 flex-shrink-0">1</span>
                      Download the Word template file
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5 flex-shrink-0">2</span>
                      Open in Microsoft Word (2016 or later)
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5 flex-shrink-0">3</span>
                      Use pre-defined styles for consistency
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5 flex-shrink-0">4</span>
                      Export final manuscript as PDF
                    </li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-6 border-l-4 border-red-500">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                Important Submission Requirements
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Format Compliance</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Template usage is mandatory for all submissions
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Non-compliant manuscripts face automatic rejection
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      All formatting elements must remain unchanged
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">File Submission</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      PDF format required for final submission
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Source files may be requested during review
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      High-quality figures and tables required
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 text-center">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Need Help with Templates?</h3>
              <p className="text-gray-600 mb-6">
                Our editorial support team is available to assist with template usage and formatting questions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button>
                  <Link href={"/guides/contact-us"} className="flex">
                  <Mail className="w-4 h-4 mr-2" />
                  Template Support
                  </Link>
                </Button>
               
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "peer-review-process",
    content: (
      <div className=" md:p-4">
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Peer Review Process</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our rigorous peer review process ensures the highest quality publications through 
              expert evaluation and constructive feedback from leading researchers in the field.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <StatCard
              icon={Users}
              value="3+"
              label="Expert Reviewers"
              description="Per manuscript"
            />
            <StatCard
              icon={Clock}
              value="4-6 weeks"
              label="Review Timeline"
              description="Average duration"
            />
            <StatCard
              icon={Eye}
              value="Double-Blind"
              label="Review Type"
              description="Anonymous process"
            />
            <StatCard
              icon={Award}
              value="95%"
              label="Author Satisfaction"
              description="Positive feedback"
            />
          </div>

          <InfoBox type="info" title="Quality Assurance">
            Each manuscript is reviewed by at least three anonymous reviewers from reputed institutions, 
            with two from the core area and one from the application domain, ensuring comprehensive evaluation.
          </InfoBox>

          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold mb-6 text-gray-900">Review Timeline</h3>
              <div className="space-y-4">
                <TimelineItem
                  title="Initial Submission"
                  description="Manuscript submitted through online portal"
                  duration="Day 0"
                  isCompleted
                />
                <TimelineItem
                  title="Initial Screening"
                  description="Editorial team checks formatting and scope alignment"
                  duration="1-3 days"
                  isCompleted
                />
                <TimelineItem
                  title="Reviewer Assignment"
                  description="Associate editor selects qualified reviewers"
                  duration="3-7 days"
                  isActive
                />
                <TimelineItem
                  title="Peer Review"
                  description="Expert reviewers evaluate and provide feedback"
                  duration="3-4 weeks"
                />
                <TimelineItem
                  title="Editorial Decision"
                  description="Final decision based on reviewer recommendations"
                  duration="1-2 days"
                />
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-2xl font-bold mb-6 text-gray-900">Review Process Steps</h3>
              <div className="space-y-6">
                <StepCard
                  step={1}
                  title="Initial Checkup"
                  description="Manuscript submission verification, format compliance, and preliminary ethical screening by editorial office."
                  icon={Search}
                />
                <StepCard
                  step={2}
                  title="Associate Editor Assignment"
                  description="Editor-in-Chief assigns manuscript to appropriate Associate Editor based on subject expertise."
                  icon={Users}
                />
                <StepCard
                  step={3}
                  title="Peer Review"
                  description="Anonymous expert reviewers evaluate originality, technical quality, significance, and clarity."
                  icon={MessageCircle}
                />
                <StepCard
                  step={4}
                  title="Editorial Decision"
                  description="Final decision communicated to authors with detailed reviewer feedback and recommendations."
                  icon={CheckCircle}
                  isLast
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <FeatureCard
                icon={Shield}
                title="Review Criteria"
                description="What our reviewers evaluate"
                features={[
                  "Originality and novelty of research",
                  "Technical quality and methodology",
                  "Significance to the field",
                  "Clarity of presentation",
                  "Relevance to journal scope",
                  "Proper citation and references",
                  "Ethical compliance"
                ]}
              />
              
              <FeatureCard
                icon={Target}
                title="Decision Categories"
                description="Possible review outcomes"
                features={[
                  "Accept - Ready for publication",
                  "Minor Revisions - Small changes needed",
                  "Major Revisions - Significant improvements required",
                  "Reject and Resubmit - Substantial revision needed",
                  "Reject - Not suitable for publication"
                ]}
              />
            </div>

            <InfoBox type="success" title="Author Support">
              We provide detailed feedback to help authors improve their manuscripts, even for rejected papers. 
              Our goal is to advance research quality in embedded and digital system design.
            </InfoBox>
          </div>
        </div>
      </div>
    ),
  },
];
