import { TextAnimate } from "@/components/magicui/text-animate";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import React from "react";
import { Fade } from "react-awesome-reveal";

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
      <Card className="max-w-4xl bg-blue-200/20  backdrop-blur-md  bg-clip-padding backdrop-filter   border border-gray-100 shadow-lg rounded-2xl md:p-6 p-2">
        <CardContent className="space-y-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-4">
            About Us
          </h2>
          <TextAnimate
            animation="fadeIn"
            duration={1}
            animate
            once
            className="text-gray-600 text-lg leading-relaxed mb-4"
          >
            A nation&rsquo;s dream is to build a ubiquitous digital
            infrastructure so that this will ensure ease of living for the
            people living within. The growth in digital infrastructure is
            completely relying on the development of secure, fast, and reliable
            digital hardware platforms. Innovative techniques are to be adopted
            to develop cheaper but high-performing embedded or digital systems.
          </TextAnimate>
          <TextAnimate
            animation="fadeIn"
            delay={1}
            duration={2}
            once
            className="text-gray-600 text-lg leading-relaxed mb-4"
          >
            Journal of Embedded and Digital System Design (JEDSD) is a platform
            where researchers can publish emerging techniques for the design of
            embedded or digital systems. JEDSD is an open-access journal that
            aims to publish full-length manuscripts on emerging design
            techniques for embedded and digital systems. This journal covers a
            broader area of the aforesaid domain.
          </TextAnimate>
          <TextAnimate
            animation="fadeIn"
            delay={3}
            duration={3}
            animate
            once
            className="text-gray-600 text-lg leading-relaxed"
          >
            The objective of this journal is to motivate students right from
            graduation to focus on developing innovative designs, to inspire
            researchers to propose novel ideas in digital hardware development,
            and to provide researchers with a platform through which their
            research can reach researchers around the world.
          </TextAnimate>
        </CardContent>
      </Card>
    ),
  },
  {
    title: "mission-vision",
    content: (
      <Card className="max-w-4xl bg-blue-200/20  backdrop-blur-md  bg-clip-padding backdrop-filter   border border-gray-100 shadow-lg rounded-2xl md:p-6 p-2">
        <CardContent className="space-y-4">
          <h2 className="text-3xl font-bold text-center text-gray-800">
            Our Mission and Vision
          </h2>

          <TextAnimate
            animation="fadeIn"
            duration={1}
            once
            animate
            className="text-2xl font-semibold text-gray-700 mb-2"
          >
            Vision Statement
          </TextAnimate>
          <p className="text-gray-600 text-lg leading-relaxed mb-4">
            The vision of the{" "}
            <strong>
              Journal of Embedded and Digital System Design (JEDSD)
            </strong>{" "}
            is to:
          </p>
          <ul className="list-disc pl-6 text-gray-600 text-lg mb-4">
            <li>
              to drive forward the research in the field of digital system
              design (DSD) and embedded system design (ESD)
            </li>
            <li>
              to promote research in algorithm development and optimization for
              best design metrics
            </li>
            <li>
              to be indexed by scientific abstract and citation databases like
              SCOPUS
            </li>
            <li>to become one of the journals belonging to Quartile 4 (Q4)</li>
            <li>
              to get international recognition and become the first choice for
              the researchers to publish their research in the domain as
              mentioned earlier.
            </li>
          </ul>

          <TextAnimate
            animation="fadeIn"
            duration={1}
            once
            animate
            className="text-2xl font-semibold text-gray-700 mb-2"
          >
            Mission Statement
          </TextAnimate>
          <p className="text-gray-600 text-lg leading-relaxed mb-4">
            In achieving the vision statements, the mission statements are set
            as
          </p>
          <ul className="list-disc pl-6 text-gray-600 text-lg">
            <li>
              to publish periodically quality original manuscripts in the domain
              of embedded and digital system design,
            </li>
            <li>
              to maintain the trust of the authors by maintaining
              confidentiality, following ethical values, and focusing on
              novelty,
            </li>
            <li>
              to reach global researchers by maintaining quality as well as by
              proper advertisement,
            </li>
            <li>
              to have a data object identifier (DOI) for each article and to
              have an International Standard Serial Number (ISSN) number for the
              journal as soon as possible,
            </li>
            <li>
              to focus on quality not on quantity to have a good citation index
              which will help in getting popular.
            </li>
          </ul>
        </CardContent>
      </Card>
    ),
  },
  {
    title: "our-team",
    content: (
      <Card className="max-w-4xl bg-blue-200/20  backdrop-blur-md  bg-clip-padding backdrop-filter   border border-gray-100 shadow-lg rounded-2xl md:p-6 p-2">
        <h2 className="text-4xl font-bold text-center text-black mb-6">
          Members
        </h2>
        <div className="flex flex-wrap justify-center gap-4">
          {members.map((member, index) => (
            <Fade key={index} direction="up" triggerOnce>
              <Card className="bg-white shadow-lg rounded-2xl p-4  w-[20rem] max-w-[98vw] mx-4">
                <CardContent>
                  <h3 className="text-xl font-semibold text-gray-700">
                    {member.name}
                  </h3>
                  <p className="text-gray-600">{member.role}</p>
                  <p className="text-gray-500 text-sm">{member.position}</p>
                  {member.email && (
                    <p className="text-blue-500 text-sm mt-2">
                      <a href={`mailto:${member.email}`}>{member.email}</a>
                    </p>
                  )}
                </CardContent>
              </Card>
            </Fade>
          ))}
        </div>
      </Card>
    ),
  },
  {
    title: "contact-us",
    content: (
      <Card className="max-w-4xl bg-blue-200/20  backdrop-blur-md  bg-clip-padding backdrop-filter   border border-gray-100 shadow-lg rounded-2xl md:p-6 p-2">
        <CardContent className="space-y-4">
          <h1 className="text-4xl font-bold mb-4 text-center">Contact Us</h1>

          <div className="mb-6">
            <h2 className="text-xl font-semibold">Editor-in-Chief</h2>
            <p className="text-gray-700">Dr. Shirshendu Roy</p>
            <p className="text-gray-700">Assistant Professor</p>
            <p className="text-gray-700">
              Department of Electronics and Communication
            </p>
            <p className="text-gray-700">Dayananda Sagar University</p>
            <p className="text-gray-700">
              Email:{" "}
              <a
                href="mailto:shirshenduroy-ece@dsu.edu.in"
                className="text-blue-500"
              >
                shirshenduroy-ece@dsu.edu.in
              </a>
            </p>
            <p className="text-gray-700">
              Ph:{" "}
              <a href="tel:+919330324297" className="text-blue-500">
                9330324297
              </a>
            </p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold">Official Address</h2>
            <p className="text-gray-700">Das Vila</p>
            <p className="text-gray-700">17 - Rajani Kanta Chowdhury Lane</p>
            <p className="text-gray-700">Shibpur, Howrah-711103</p>
            <p className="text-gray-700">
              Email:{" "}
              <a href="mailto:editorial@jedsd.com" className="text-blue-500">
                editorial@jedsd.com
              </a>{" "}
              /{" "}
              <a
                href="mailto:jedsdofficial@gmail.com"
                className="text-blue-500"
              >
                jedsdofficial@gmail.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    ),
  },
  {
    title: "submission-guidelines",
    content: (
      <Card className="max-w-4xl bg-blue-200/20  backdrop-blur-md  bg-clip-padding backdrop-filter   border border-gray-100 shadow-lg rounded-2xl md:p-6 p-2">
        <h1 className="text-4xl font-bold mb-4 text-center">
          Submission Guidelines
        </h1>

        <p className="text-gray-700 mb-6">
          The Journal of Embedded and Digital System Design (JEDSD) accepts
          regular original manuscripts, review papers, and tutorials. Authors
          must submit their manuscripts through our online submission portal.
        </p>

        <div>
          <h2 className="text-xl font-semibold mt-4">
            1. Online Submission Portal
          </h2>
          <ul className="list-disc pl-5 text-gray-700">
            <li>
              Access Link:{" "}
              <Link href="/dashboard" className="text-blue-600 underline">
                Submit Manuscript
              </Link>
            </li>
            <li>User Registration: New users must register for an account.</li>
            <li>Existing users can log in with their credentials.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mt-4">2. Submission Process</h2>
          <ul className="list-disc pl-5 text-gray-700">
            <li>
              Complete the submission form with manuscript details (title,
              abstract, keywords, authors).
            </li>
            <li>Choose a corresponding author for communication.</li>
            <li>
              Upload the manuscript file in <strong>PDF format</strong>.
            </li>
            <li>Attach a cover letter with the necessary details.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mt-4">
            3. Submission Checklist
          </h2>
          <ul className="list-disc pl-5 text-gray-700">
            <li>Full manuscript in PDF format.</li>
            <li>Cover letter (PDF).</li>
            <li>Abstract (200-250 words).</li>
            <li>4-5 keywords.</li>
            <li>All author details (affiliations, addresses, contact info).</li>
            <li>Compliance with ethical guidelines.</li>
            <li>Declaration of any conflicts of interest.</li>
          </ul>
        </div>
      </Card>
    ),
  },
  {
    title: "author-guidelines",
    content: (
      <Card className="max-w-4xl bg-blue-200/20  backdrop-blur-md  bg-clip-padding backdrop-filter   border border-gray-100 shadow-lg rounded-2xl md:p-6 p-2">
        <CardContent className="space-y-4">
          <h1 className="text-4xl font-bold mb-4 w-full text-center">
            Author Guidelines
          </h1>
          <p className="text-gray-700 mb-6">
            The Journal of Embedded and Digital System Design (JEDSD) accepts
            original manuscripts that satisfy the objective of the journal.
            Manuscripts should be prepared as per the guidelines mentioned on
            the website. Manuscripts that have not followed the journal
            guidelines will face automatic rejection. Authors should take care
            of the following points while preparing the manuscript.
          </p>
          <ul className="list-disc pl-6 text-gray-700">
            <li>
              <strong>Subject Area:</strong> Identify the sub-domain or article
              type that best matches the manuscript.
            </li>
            <li>
              <strong>Title:</strong> The title should be concise and
              informative. It may contain the key invention and methodology.
              Avoid abbreviations and formulae.
            </li>
            <li>
              <strong>Abstract:</strong>The abstract may have 200-250 words,
              summarizing the research question, methodology, results, and
              conclusion. The abstract gives the reader an overview of the
              manuscript.
            </li>
            <li>
              <strong>Keywords:</strong> Authors must provide 4-5 keywords to
              facilitate indexing and search. These keywords must be chosen
              carefully to increase the visibility of their research work.
            </li>
          </ul>

          <h2 className="text-xl font-semibold mt-4 inline">Main Text:</h2>
          <p className="inline-block text-gray-700 mb-4">
            Structured as Introduction, Theoretical Background, Proposed Work,
            Results and Comparison, Discussion, and Conclusion.
          </p>
          <ul className="list-disc pl-6 text-gray-700">
            <li>
              <strong>Introduction:</strong> Context, objectives, and the
              significance of the study. The topic of research should be
              introduced in this section followed by a strong literature survey.
              Prior works on the relevant topic must be discussed here.
            </li>
            <li>
              <strong>Background Work:</strong> Brief theory, detailed
              methodology (including materials), procedures, and analysis
              techniques. Citing the original work is mandatory.
            </li>
            <li>
              <strong>Proposed Work:</strong> The proposed work should be
              discussed in detail with images, figures, and tables in this
              section.
            </li>
            <li>
              <strong>Results and Comparison:</strong> Clear and concise
              presentation of findings with appropriate use of tables and
              figures. Comparison of the results with state of the art works can
              be presented here.
            </li>
            <li>
              <strong>Discussion:</strong> Interpretation of results,
              implications, limitations, and future directions.
            </li>
            <li>
              <strong>Conclusion:</strong> Summary of findings and their
              significance.
            </li>
          </ul>

          <h2 className="text-xl font-semibold mt-4">Additional Guidelines:</h2>
          <ul className="list-disc pl-6 text-gray-700">
            <li>
              <strong>References:</strong> We are following the IEEE citation
              style for writing the references. There are no minimum or maximum
              limits in citing relevant papers but authors must cite the
              relevant works and no tables, images, and datasets should be used
              without proper citation. JEDSD highly discourages improper
              self-citation.
            </li>
            <li>
              <strong>Figures:</strong> High-quality images should be used in
              the manuscript. Images can be of formats .jpg, .jpeg, .png, or
              pdf. Authors must be selective in choosing drawing tools like IPE
              for latex, Microsoft Visio etc. can be used. Online drawing tools
              like draw.io also can be used. Images may require the proper use
              of legends, labels, or titles. All the high-quality images may be
              asked for during the final submission of the manuscript after
              acceptance. The caption for any image is to be written below an
              image in sentence case with a citation if required. Multiple
              figures or images are to be used in terms of subfigures with a
              caption for each sub-figure.
            </li>
            <li>
              <strong>Tables:</strong> Multiple tables may be required to
              support the proposed work. Tables may contain a common row or a
              common column. The contents of the table must be chosen in such a
              way that it fits in the text width. Resizing the table using a
              lower font size is not recommended. The caption for the tables
              should be given above the table in sentence case with citation if
              required. No table should be put in the form image means tables
              should be editable.
            </li>
            <li>
              <strong>Supplementary Material (Optional):</strong> Additional
              data or material that supports the manuscript can be included
              along with the main script.
            </li>
            <li>
              <strong>Equations:</strong> Mathematical equations should be
              written by the authors and images for the equations should not be
              used. Equations should be readable and numbered. Numbering of the
              equations is mandatory so that they can be referenced to.
            </li>
            <li>
              <strong>Algorithms:</strong> All algorithms should be numbered and
              should be written by the authors. Images for the algorithms should
              not be provided.
            </li>
            <li>
              <strong>Referring Figures, Tables, and Algorithms:</strong>{" "}
              Figures to be referred to as Fig. 4, tables to be referred to as
              Table IV, and algorithms to be referred to as Algorithm 4. For the
              equation to be equation (1).
            </li>
          </ul>
        </CardContent>
      </Card>
    ),
  },
  {
    title: "ethical-guidelines",
    content: (
      <Card className="max-w-4xl bg-blue-200/20  backdrop-blur-md bg-clip-padding backdrop-filter  border border-gray-100 shadow-lg rounded-2xl md:p-6 p-2">
        <CardContent className="space-y-4">
          <h1 className="text-4xl font-bold mb-4 w-full text-center">
            Ethical Considerations
          </h1>

          <p className="text-gray-700 mb-6">
            The Journal of Embedded and Digital System Design (JEDSD) invites
            original manuscripts for publication. All manuscripts will undergo
            originality checks before acceptance for review. Authors must adhere
            to the following ethical guidelines when submitting their
            manuscripts:
          </p>

          <div>
            <h2 className="text-xl font-semibold mt-4">
              1. Originality and Plagiarism:
            </h2>
            <ul className="list-disc pl-6 text-gray-700">
              <li>
                <strong>Original Work:</strong> All manuscripts must be original
                work and not be previously published or under consideration
                elsewhere (any other journal). Submission of manuscripts in
                multiple journals is a serious crime and if authors are found
                doing so, they will be barred from submitting any further
                manuscripts.
              </li>
              <li>
                <strong>Plagiarism Screening:</strong> Authors must check for
                plagiarism and a similarity of less than 10 percent (without
                references) should be maintained. Submitted manuscripts will
                again go through a screening process by our specialized software
                for plagiarism checks. Any instance of plagiarism more than the
                acceptable limit will result in the immediate rejection of the
                manuscript.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mt-4">2. Authorship:</h2>
            <ul className="list-disc pl-6 text-gray-700">
              <li>
                <strong>Author Contributions:</strong> All listed authors must
                have made significant contributions to the research and
                manuscript preparation. We strictly discourage adding ghost
                authors who do not have any contribution to the preparation of
                the manuscript. All authors should be added before acceptance of
                the manuscript. In case of any changes in the order of the
                authors, or the inclusion of an author, the corresponding author
                must communicate with the editor-in-chief.
              </li>
              <li>
                <strong>Corresponding Author:</strong> One author must be
                designated as the corresponding author, responsible for all
                communication with the journal. Change of corresponding
                authorship will not be entertained unless a signed application
                letter is accepted by the editor-in-chief.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mt-4">
              3. Data Fabrication and Falsification:
            </h2>
            <ul className="list-disc pl-6 text-gray-700">
              <li>
                <strong>Data Integrity:</strong> Authors must ensure that all
                data presented in the manuscript is accurate and has not been
                manipulated. Manipulation of data is a serious crime and authors
                must refrain from manipulating research data from any other
                published manuscript.
              </li>
              <li>
                <strong>Raw Data:</strong> Authors may be asked to provide raw
                data for verification purposes. This is to stop the manipulation
                of research data and to provide actual data in the manuscript.
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    ),
  },
  {
    title: "conflict-of-interest",
    content: (
      <Card className="max-w-4xl bg-blue-200/20  backdrop-blur-md bg-clip-padding backdrop-filter  border border-gray-100 shadow-lg rounded-2xl ">
        <CardContent className="space-y-4">
          <h1 className="text-4xl font-bold mb-4 w-full text-center">
            Conflict of Interest
          </h1>

          <p className="text-gray-700 mb-6">
            The editorial board will check the conflict of interest for each of
            the manuscripts in the initial check or throughout the review
            duration. It is also the authors&apos; responsibility to declare if
            any conflict of interest is associated with their manuscripts.
            Details regarding conflict of interests are as follows
          </p>

          <div>
            <h2 className="text-xl font-semibold mt-4">1. Definition:</h2>
            <ul className="list-disc pl-6 text-gray-700">
              <li>
                <strong>Conflict of Interest:</strong> A conflict of interest
                occurs when there are financial, personal, or professional
                affiliations that could influence the research or interpretation
                of the results.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mt-4">
              2. Disclosure Requirements:
            </h2>
            <ul className="list-disc pl-6 text-gray-700">
              <li>
                <strong>Authors:</strong> All authors must disclose any
                potential conflicts of interest in the manuscript, including
                financial support, employment, consultancies, stock ownership,
                honoraria, and paid expert testimony.
                <ul className="list-disc pl-6 text-gray-700 mt-2">
                  <li>
                    All the authors who contributed to the manuscripts must be
                    declared as co-authors.
                  </li>
                  <li>
                    Financial sponsors should be acknowledged if any kind of
                    financial help is taken in the preparation of the
                    manuscripts.
                  </li>
                  <li>
                    Permission is to be taken from the funding organizations if
                    the manuscript is an outcome of a funded project.
                  </li>
                  <li>
                    No images, tables, or figures should be used without
                    permission from the concerned person.
                  </li>
                </ul>
              </li>
              <li>
                <strong>Reviewers:</strong> Reviewers must disclose any
                potential conflicts of interest before accepting a review
                assignment. If a conflict of interest is identified, the
                reviewer will be recused from the review process.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mt-4">3. Editorial Board:</h2>
            <ul className="list-disc pl-6 text-gray-700">
              <li>
                <strong>Transparency:</strong> Editorial board members must
                disclose any potential conflicts of interest related to the
                manuscripts they handle. Board members will be recused from
                handling manuscripts where a conflict of interest exists.
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    ),
  },
  {
    title: "publishing-model",
    content: (
      <Card className="max-w-4xl bg-blue-200/20  backdrop-blur-md  bg-clip-padding backdrop-filter   border border-gray-100 shadow-lg rounded-2xl md:p-6 p-2">
        <CardContent className="space-y-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-4">
            Publishing Model
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-4">
            Journal of Embedded and Digital System Design (JEDSD) is a newly
            launched platform where researchers can publish their full-length
            manuscripts. This journal is new but it aims to become one of the
            quality journals in the world in the aforesaid domain. The good
            thing about it is that it focuses on a specific domain that is of
            prime importance and emerging. Thus we are expecting a few
            manuscripts to get published within a year and these manuscripts
            will be peer reviewed by our esteemed reviewers from reputed
            universities and the manuscripts will be improved based on their
            comments.
          </p>
          <p className="text-gray-600 text-lg leading-relaxed mb-4">
            Index, citation, and impact factors are important factors to judge a
            journal. We are starting afresh and applying for an International
            Standard Serial (ISSN) number. Gradually we will opt for different
            index systems. The quality of the manuscripts will be maintained so
            that they will have maximum citations. No article processing charges
            (APC) will be charged from the authors as of now for publication.
            The redemption in APC charges will motivate the researchers to
            publish quality manuscripts through this journal.
          </p>
        </CardContent>
      </Card>
    ),
  },
  {
    title: "call-for-papers",
    content: (
      <Card className="max-w-4xl bg-blue-200/20  backdrop-blur-md bg-clip-padding backdrop-filter  border border-gray-100 shadow-lg rounded-2xl md:p-6 p-2">
        <CardContent className="space-y-4">
          <h1 className="text-4xl font-bold mb-4 w-full text-center">
            Call For Papers/ Scope
          </h1>

          <p className="text-gray-700 mb-6">
            The Journal of Embedded and Digital System Design (JEDSD) expects
            the submission of original high quality research manuscripts related
            to the development of innovative ideas on embedded and digital
            system design. The sub-domains can be listed as
          </p>

          <ol className="list-decimal pl-6 text-gray-700 space-y-2">
            <li>
              <strong>FPGA Implementation</strong> - FPGA is a very important
              reconfigurable hardware to implement digital systems. Digital
              subsystems or algorithms can be of any domain like signal
              processing (SP), image processing (IP), video processing (VP),
              audio processing (AP), natural language processing (NLP), machine
              learning (ML), neural networks (NN) or of any other domains.
            </li>
            <li>
              <strong>VLSI or ASIC Implementation</strong> - Any digital system
              specifically implemented for ASIC or digital VLSI implementation
              of any aforesaid algorithms.
            </li>
            <li>
              <strong>Processor or Controller-Based Implementations</strong> -
              CPU, GPU, or DSP processor-based implementations of digital
              systems or algorithms.
            </li>
            <li>
              <strong>Embedded System Implementations</strong> - Embedded
              system-based implementation of specific tasks that may include
              input devices, electronic controllers, and output devices.
            </li>
            <li>
              <strong>Development in the Internet of Things (IoT)</strong> -
              Recent developments (advancement in communication protocols and
              techniques, development in controllers, or development in
              peripherals) on IoT.
            </li>
            <li>
              <strong>IoT or Industrial IoT application</strong> - Application
              of IoT or IIoT having an impact on our daily life, industry
              sector, health care, or in the defense sector.
            </li>
            <li>
              <strong>Theoretical development</strong> - Novelty algorithms or
              techniques that can play a crucial role in developing promising
              embedded or digital hardware systems.
            </li>
          </ol>

          <p className="text-gray-700 mt-6">
            Authors can submit their manuscripts throughout the year through our
            online portal. If any issues are faced in the online portal, then
            authors can contact us to submit their manuscripts.
          </p>
        </CardContent>
      </Card>
    ),
  },
  {
    title: "how-we-publish",
    content: (
      <Card className="max-w-4xl bg-blue-200/20  backdrop-blur-md  bg-clip-padding backdrop-filter   border border-gray-100 shadow-lg rounded-2xl md:p-6 p-2">
        <CardContent className="space-y-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-4">
            How We Publish
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-4">
            The Journal of Embedded and Digital System Design (JEDSD) follows a
            rigorous publication process to ensure the highest quality of
            research dissemination. Our publication process includes the
            following steps:
          </p>
          <ol className="list-decimal list-inside mb-4">
            <li>
              <strong>Submission:</strong> Authors submit their manuscripts
              through our online submission system.
            </li>
            <li>
              <strong>Peer Review:</strong> All submissions undergo a thorough
              peer-review process by experts in the field.
            </li>
            <li>
              <strong>Revisions:</strong> Authors may be required to revise
              their manuscripts based on reviewer feedback.
            </li>
            <li>
              <strong>Publication:</strong> Accepted manuscripts are published
              online and made available to the research community.
            </li>
          </ol>
          <p className="text-gray-600 text-lg leading-relaxed mb-4">
            For more information about our publication process, please visit our
            website or contact the editorial office.
          </p>
        </CardContent>
      </Card>
    ),
  },
  {
    title: "templates",
    content: (
      <Card className="max-w-4xl bg-blue-200/20  backdrop-blur-md  bg-clip-padding backdrop-filter   border border-gray-100 shadow-lg rounded-2xl md:p-6 p-2">
        <CardContent className="space-y-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
            Author Resources
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-4">
            All the manuscripts should be prepared according to the guidelines
            provided by the journal. If any manuscript does not follow the
            proper journal template, then it will be rejected during the initial
            check-up stage only. The templates for the manuscripts are given
            here.
          </p>
          <ul className="list-decimal">
            <li className="font-bold">
              Templates for Manuscripts
              <ul className="list-disc pl-6">
                <li>
                  <strong>Latex Template:</strong>The authors are highly
                  encouraged to prepare their manuscript according to the latex
                  template. Manuscripts can be easily prepared by the latex
                  template provided here. This template can be directly uploaded
                  to overleaf.com or can be prepared by the latest test live
                  tools.
                </li>
                <li>
                  <strong>Microsoft Word Template:</strong>The manuscripts can
                  also be prepared by Microsoft Word template. However, authors
                  should submit the manuscript only in pdf format with proper
                  format.
                </li>
              </ul>
            </li>
            <li className="font-bold mt-2">
              Templates for Tutorials
              <ul className="list-disc pl-6">
                <li>
                  the case of tutorials, separate latex and word templates
                  should be followed.
                </li>
              </ul>
            </li>
          </ul>
          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-2">
            Some of templates are here which can help you.
          </h3>
          <a
            className="text-blue-600 p-6"
            download
            href="/Journal_Template_word.docx"
          >
            Download word file
          </a>
          <a
            className="text-blue-600 p-6"
            download
            href="/Journal_Template_latex.zip"
          >
            Download Zip folder
          </a>
        </CardContent>
      </Card>
    ),
  },
  {
    title: "peer-review-process",
    content: (
      <Card className="max-w-4xl bg-blue-200/20  backdrop-blur-md  bg-clip-padding backdrop-filter   border border-gray-100 shadow-lg rounded-2xl md:p-6 p-2">
        <CardContent className="space-y-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-4">
            Peer Review Process
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-4">
            The quality of the journal is most important to us. Each manuscript
            has to have some level of innovation and it should not be
            plagiarized. Journal of Embedded and Digital System Design (JEDSD)
            ensures that each manuscript will go through a peer review and
            plagiarism check process. All the manuscripts will go through a peer
            review process and each manuscript will be reviewed by at least
            three anonymous reviewers, from reputed institutions, selected by
            the editorial teams. Out of these reviewers, two reviewers will be
            from the core or primary area and one reviewer will be selected from
            the application or secondary area. The reviewer&apos;s comments will
            be sent to the editor-in-chief for decision-making. The total review
            process will be approximately 4-6 weeks. Authors may experience
            delay in the review process only if reviewers have not accepted the
            manuscript for review or reviewers have delayed giving their
            comments due to some reasons. There are four steps between the
            submission of a manuscript and its publication. These steps are
            discussed in detail below
          </p>
       
        <div>
          <h2 className="text-xl font-semibold mt-4">
            1. Initial Checkup
          </h2>
          <ul className="list-disc pl-6 text-gray-700">
            <li>
              <strong>Manuscript Submission Check:</strong> Authors submit their manuscripts through the online submission system, which automatically checks if all files are uploaded correctly in PDF format. Sometimes a cover letter may be uploaded only in PDF format.
            </li>
            <li>
              <strong>Preliminary Check:</strong> The editorial office conducts an initial screening to ensure the manuscript adheres to the journal's formatting and ethical guidelines. Manuscripts that do not meet these criteria are returned to the authors for correction.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mt-4">
            2. Assignment to Associate Editor
          </h2>
          <ul className="list-disc pl-6 text-gray-700">
            <li>
              <strong>Editor Assignment:</strong> The Editor-in-Chief assigns the manuscript to an appropriate Associate Editor based on the manuscript's subject area.
            </li>
            <li>
              <strong>Reviewer Selection:</strong> The Associate Editor selects three or more independent reviewers with expertise in the relevant field.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mt-4">
            3. Peer Review
          </h2>
          <ul className="list-disc pl-6 text-gray-700">
            <li>
              <strong>Under Review:</strong> JEDSD follows a blind review process where the reviewers will remain anonymous to authors.
            </li>
            <li>
              <strong>Review Criteria:</strong> Reviewers evaluate the manuscript based on originality, technical quality, significance, clarity, and relevance to the journal's scope.
            </li>
            <li>
              <strong>Reviewer Reports:</strong> Reviewers provide detailed feedback and recommendations: accept, minor revisions, major revisions, or reject.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mt-4">
            4. Final Decision
          </h2>
          <ul className="list-disc pl-6 text-gray-700">
            <li>
              <strong>Comments by Reviewers:</strong> All the reviewers&apos;comments will be collected by the associate editor.
            </li>
            <li>
              <strong>Comment by Editor:</strong> The associate editor will make comments on the manuscript and summarize the comments by the reviewers.
            </li>
            <li>
              <strong>Final Decision:</strong> Based on all the comments by the reviewers and the associate editor, the final decision for the manuscript will be conveyed to the authors only through email by the editor-in-chief office.
            </li>
          </ul>
        </div>
        </CardContent>
      </Card>
    ),
  },
];
