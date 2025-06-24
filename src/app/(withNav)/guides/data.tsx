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
      <Card className="max-w-4xl bg-green-400/25  bg-clip-padding backdrop-filter backdrop-blur-2xl  border border-gray-100 shadow-lg rounded-2xl md:p-6 p-2">
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
            infrastructure, ensuring ease of living for its people. Growth in
            digital infrastructure relies on secure, fast, and reliable digital
            hardware platforms. Innovative techniques are crucial for developing
            cost-effective yet high-performing embedded or digital systems.
          </TextAnimate>
          <TextAnimate
            animation="fadeIn"
            delay={1}
            duration={2}
            once
            className="text-gray-600 text-lg leading-relaxed mb-4"
          >
            Journal of Embedded and Digital System Design (JEDSD) is an
            open-access journal providing a platform for researchers to publish
            emerging techniques in embedded and digital system design. The
            journal covers a broad spectrum of topics within this domain.
          </TextAnimate>
          <TextAnimate
            animation="fadeIn"
            delay={3}
            duration={3}
            animate
            once
            className="text-gray-600 text-lg leading-relaxed"
          >
            Our objective is to motivate students—from graduation onwards—to
            innovate in digital system design, inspire researchers to propose
            novel ideas, and provide a global platform for sharing research
            advancements.
          </TextAnimate>
        </CardContent>
      </Card>
    ),
  },
  {
    title: "mission-vision",
    content: (
      <Card className="max-w-4xl bg-green-400/25  bg-clip-padding backdrop-filter backdrop-blur-2xl  border border-gray-100 shadow-lg rounded-2xl md:p-6 p-2">
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
              Drive forward research in digital and embedded system design.
            </li>
            <li>
              Promote algorithm development and optimization for best design
              metrics.
            </li>
            <li>Be indexed by major citation databases like SCOPUS.</li>
            <li>Achieve Quartile 4 (Q4) ranking.</li>
            <li>
              Gain international recognition and become the preferred journal
              for researchers.
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
            To achieve our vision, we commit to:
          </p>
          <ul className="list-disc pl-6 text-gray-600 text-lg">
            <li>
              Periodically publish quality original manuscripts in embedded and
              digital system design.
            </li>
            <li>
              Uphold author trust by maintaining confidentiality, ethics, and a
              focus on novelty.
            </li>
            <li>
              Reach global researchers through high standards and proper
              promotion.
            </li>
            <li>
              Obtain a Digital Object Identifier (DOI) and an International
              Standard Serial Number (ISSN).
            </li>
            <li>
              Prioritize quality over quantity to enhance citation impact and
              journal reputation.
            </li>
          </ul>
        </CardContent>
      </Card>
    ),
  },
  {
    title: "our-team",
    content: (
      <Card className="max-w-4xl bg-green-400/25  bg-clip-padding backdrop-filter backdrop-blur-2xl  border border-gray-100 shadow-lg rounded-2xl md:p-6 p-2">
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
      <Card className="max-w-4xl bg-green-400/25  bg-clip-padding backdrop-filter backdrop-blur-2xl  border border-gray-100 shadow-lg rounded-2xl md:p-6 p-2">
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
      <Card className="max-w-4xl bg-green-400/25  bg-clip-padding backdrop-filter backdrop-blur-2xl  border border-gray-100 shadow-lg rounded-2xl md:p-6 p-2">
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
      <Card className="max-w-4xl bg-green-400/25  bg-clip-padding backdrop-filter backdrop-blur-2xl  border border-gray-100 shadow-lg rounded-2xl md:p-6 p-2">
        <CardContent className="space-y-4">
          <h1 className="text-4xl font-bold mb-4 w-full text-center">
            Author Guidelines
          </h1>
          <p className="text-gray-700 mb-6">
            The Journal of Embedded and Digital System Design (JEDSD) accepts
            original manuscripts that satisfy the objective of the journal.
            Manuscripts should be prepared as per the guidelines mentioned on
            the website. Manuscripts that have not followed the journal
            guidelines will face automatic rejection.
          </p>

          <h2 className="text-xl font-semibold mt-4">
            Manuscript Preparation:
          </h2>
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
              <strong>Abstract:</strong> 200-250 words summarizing the research
              question, methodology, results, and conclusion.
            </li>
            <li>
              <strong>Keywords:</strong> Authors must provide 4-5 keywords for
              better indexing and searchability.
            </li>
          </ul>

          <h2 className="text-xl font-semibold mt-4">Main Text:</h2>
          <ul className="list-disc pl-6 text-gray-700">
            <li>
              <strong>Introduction:</strong> Context, objectives, and
              significance of the study. It should include a literature survey.
            </li>
            <li>
              <strong>Background Work:</strong> Brief theory, detailed
              methodology, procedures, and analysis techniques.
            </li>
            <li>
              <strong>Proposed Work:</strong> Discuss the proposed work in
              detail with supporting figures and tables.
            </li>
            <li>
              <strong>Results and Comparison:</strong> Present findings with
              tables and figures. Compare results with state-of-the-art works.
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
              <strong>References:</strong> Follow IEEE citation style.
            </li>
            <li>
              <strong>Figures:</strong> High-quality images (.jpg, .jpeg, .png,
              .pdf) with proper captions.
            </li>
            <li>
              <strong>Tables:</strong> Editable tables (not images) with
              captions above.
            </li>
            <li>
              <strong>Equations:</strong> Must be numbered and written in an
              equation editor (not images).
            </li>
            <li>
              <strong>Algorithms:</strong> Must be numbered and formatted
              properly.
            </li>
          </ul>
        </CardContent>
      </Card>
    ),
  },
  {
    title: "ethical-guidelines",
    content: (
      <Card className="max-w-4xl bg-green-400/25  bg-clip-padding backdrop-filter backdrop-blur-2xl  border border-gray-100 shadow-lg rounded-2xl md:p-6 p-2">
        <CardContent className="space-y-4">
          <h1 className="text-4xl font-bold mb-4 w-full text-center">
            Ethical Considerations
          </h1>

          <p className="text-gray-700 mb-6">
            The Journal of Embedded and Digital System Design (JEDSD) invites
            original manuscripts for publication. All manuscripts will undergo
            originality checks before acceptance for review. Authors must adhere
            to the following ethical guidelines when submitting their
            manuscripts.
          </p>

          <div>
            <h2 className="text-xl font-semibold mt-4">
              1. Originality and Plagiarism:
            </h2>
            <p className="text-gray-700">
              All manuscripts must be original and must not have been previously
              published or under consideration elsewhere. Submitting the same
              manuscript to multiple journals is strictly prohibited and will
              result in the authors being barred from future submissions.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-medium mt-2">Plagiarism Screening:</h2>
            <p className="text-gray-700">
              Authors must ensure that their manuscript has a similarity of less
              than 10% (excluding references). All submissions will undergo
              plagiarism screening, and any manuscript exceeding the acceptable
              limit will be rejected immediately.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mt-4">2. Authorship:</h2>
            <p className="text-gray-700">
              All listed authors must have made significant contributions to the
              research and manuscript preparation. The inclusion of ghost
              authors (who have not contributed) is strictly prohibited. Any
              changes to authorship after submission must be communicated to the
              editor-in-chief by the corresponding author.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-medium mt-2">Corresponding Author:</h2>
            <p className="text-gray-700">
              One author must be designated as the corresponding author,
              responsible for all communication with the journal. Requests for
              changing the corresponding author will only be considered with a
              signed application and approval from the editor-in-chief.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mt-4">
              3. Data Fabrication and Falsification:
            </h2>
            <p className="text-gray-700">
              Authors must ensure that all data presented in their manuscript is
              accurate and has not been manipulated. Data fabrication and
              falsification are serious ethical violations and will result in
              immediate rejection.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-medium mt-2">Raw Data:</h2>
            <p className="text-gray-700">
              Authors may be required to provide raw data for verification
              purposes. This measure helps ensure research integrity and
              prevents manipulation of research findings.
            </p>
          </div>
        </CardContent>
      </Card>
    ),
  },
  {
    title: "conflict-of-interest",
    content: (
      <Card className="max-w-4xl bg-green-400/25  bg-clip-padding backdrop-filter backdrop-blur-2xl  border border-gray-100 shadow-lg rounded-2xl md:p-6 p-2">
        <CardContent className="space-y-4">
          <h1 className="text-4xl font-bold mb-4 text-center">
            Conflict of Interest
          </h1>

          <p className="text-gray-700 mb-6">
            The editorial board will check the conflict of interest for each of
            the manuscripts in the initial check or throughout the review
            duration. Authors must declare if any conflict of interest is
            associated with their manuscripts.
          </p>

          <div>
            <h2 className="text-xl font-semibold mt-4">1. Definition:</h2>
            <p className="text-gray-700">
              A conflict of interest occurs when financial, personal, or
              professional affiliations could influence research outcomes.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mt-4">
              2. Disclosure Requirements:
            </h2>
            <p className="text-gray-700">
              Authors must disclose financial support, employment, stock
              ownership, and other potential conflicts.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-medium mt-2">Reviewers:</h2>
            <p className="text-gray-700">
              Reviewers must disclose any conflicts before accepting a review
              assignment.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mt-4">3. Editorial Board:</h2>
            <p className="text-gray-700">
              Editorial members must disclose any conflicts related to the
              manuscripts they handle.
            </p>
          </div>
        </CardContent>
      </Card>
    ),
  },
  {
    title:"publishing-model",
    content: (
      <Card className="max-w-4xl bg-green-400/25  bg-clip-padding backdrop-filter backdrop-blur-2xl  border border-gray-100 shadow-lg rounded-2xl md:p-6 p-2">
        <CardContent className="space-y-4">
           <h2 className="text-4xl font-bold text-center text-gray-800 mb-4">
            Publishing Model
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-4">
          Journal of Embedded and Digital System Design (JEDSD) is a newly launched platform where researchers can publish their full-length manuscripts. This journal is new but it aims to become one of the quality journals in the world in the aforesaid domain. The good thing about it is that it focuses on a specific domain that is of prime importance and emerging. Thus we are expecting a few manuscripts to get published within a year and these manuscripts will be peer reviewed by our esteemed reviewers from reputed universities and the manuscripts will be improved based on their comments. 

          </p>
          <p className="text-gray-600 text-lg leading-relaxed mb-4">
          Index, citation, and impact factors are important factors to judge a journal. We are starting afresh and applying for an International Standard Serial (ISSN) number. Gradually we will opt for different index systems. The quality of the manuscripts will be maintained so that they will have maximum citations. No article processing charges (APC) will be charged from the authors as of now for publication. The redemption in APC charges will motivate the researchers to publish quality manuscripts through this journal. 

          </p>
          
          </CardContent>
          </Card>)
  },
  {
    title:"call-for-papers",
    content: (
      <Card className="max-w-4xl bg-green-400/25  bg-clip-padding backdrop-filter backdrop-blur-2xl  border border-gray-100 shadow-lg rounded-2xl md:p-6 p-2">
        <CardContent className="space-y-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-4">
            Call for Papers
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-4">
            The Journal of Embedded and Digital System Design (JEDSD) invites researchers to submit their original manuscripts for consideration. We are looking for high-quality papers that contribute to the field of embedded and digital system design.
          </p>
          <p className="text-gray-600 text-lg leading-relaxed mb-4">
            Manuscripts should be submitted through our online submission system. All submissions will undergo a rigorous peer-review process to ensure the highest quality standards.
          </p>
          <p className="text-gray-600 text-lg leading-relaxed mb-4">
            Important Dates:
          </p>
          <ul className="list-disc list-inside mb-4">
            <li>Submission Deadline: [Insert Date]</li>
            <li>Notification of Acceptance: [Insert Date]</li>
            <li>Final Manuscript Due: [Insert Date]</li>
          </ul>
          <p className="text-gray-600 text-lg leading-relaxed mb-4">
            For more information, please visit our website or contact the editorial office.
          </p>
        </CardContent>
      </Card>
    )
  },
  {
    title:"how-we-publish",
    content: (
      <Card className="max-w-4xl bg-green-400/25  bg-clip-padding backdrop-filter backdrop-blur-2xl  border border-gray-100 shadow-lg rounded-2xl md:p-6 p-2">
        <CardContent className="space-y-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-4">
            How We Publish
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-4">
            The Journal of Embedded and Digital System Design (JEDSD) follows a rigorous publication process to ensure the highest quality of research dissemination. Our publication process includes the following steps:
          </p>
          <ol className="list-decimal list-inside mb-4">
            <li>
              <strong>Submission:</strong> Authors submit their manuscripts through our online submission system.
            </li>
            <li>
              <strong>Peer Review:</strong> All submissions undergo a thorough peer-review process by experts in the field.
            </li>
            <li>
              <strong>Revisions:</strong> Authors may be required to revise their manuscripts based on reviewer feedback.
            </li>
            <li>
              <strong>Publication:</strong> Accepted manuscripts are published online and made available to the research community.
            </li>
          </ol>
          <p className="text-gray-600 text-lg leading-relaxed mb-4">
            For more information about our publication process, please visit our website or contact the editorial office.
          </p>
        </CardContent>
      </Card>
      )
  },
  {
    title:"templates",
    content: (<Card className="max-w-4xl bg-green-400/25  bg-clip-padding backdrop-filter backdrop-blur-2xl  border border-gray-100 shadow-lg rounded-2xl md:p-6 p-2">
        <CardContent className="space-y-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
            Author Resources
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-4">
            All manuscripts should be prepared according to the guidelines provided by the journal. If any manuscript does not follow the proper journal template, it will be rejected during the initial check-up stage. The templates for the manuscripts are provided below.
          </p>
          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-2">Some of templates are here which can help you.</h3>
          <a className="text-blue-600 p-6" download href="/Journal_Template_word.docx">Download word file</a>
          <a className="text-blue-600 p-6" download href="/Journal_Template_latex.zip">Download Zip folder</a>
          <h3 className="text-2xl font-semibold text-gray-800 mt-6 mb-2">1. Templates for Manuscripts</h3>
          <p className="text-gray-600 text-lg leading-relaxed mb-4">
            <strong>Latex Template:</strong> Authors are highly encouraged to prepare their manuscript using the LaTeX template. Manuscripts can be easily prepared using the provided LaTeX template, which can be directly uploaded to Overleaf or edited using the latest TeX live tools.
          </p>
          <p className="text-gray-600 text-lg leading-relaxed mb-4">
            <strong>Microsoft Word Template:</strong> Manuscripts can also be prepared using the Microsoft Word template. However, authors should submit the manuscript only in PDF format, ensuring proper formatting.
          </p>
          <h3 className="text-2xl font-semibold text-gray-800 mt-6 mb-2">2. Templates for Tutorials</h3>
          <p className="text-gray-600 text-lg leading-relaxed mb-4">
            For tutorials, separate LaTeX and Word templates should be followed to maintain consistency and clarity.
          </p>
        </CardContent>
      </Card>
    )
  },{
    title:"peer-review-process",
    content: (
      <Card className="max-w-4xl bg-green-400/25  bg-clip-padding backdrop-filter backdrop-blur-2xl  border border-gray-100 shadow-lg rounded-2xl md:p-6 p-2">
        <CardContent className="space-y-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-4">
            Peer Review Process
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-4">
            The peer review process is essential to maintaining the quality and integrity of the research published in the Journal of Embedded and Digital System Design (JEDSD). Our peer review process includes the following steps:
          </p>
          <ol className="list-decimal list-inside mb-4">
            <li>
              <strong>Initial Review:</strong> All submitted manuscripts undergo an initial review by the editorial team to ensure they meet the journal&apos;s scope and formatting requirements.
            </li>
            <li>
              <strong>Reviewer Selection:</strong> Manuscripts that pass the initial review are sent to expert reviewers in the field for a thorough evaluation.
            </li>
            <li>
              <strong>Reviewer Feedback:</strong> Reviewers provide feedback and recommendations for improvement, which are communicated to the authors.
            </li>
            <li>
              <strong>Revisions:</strong> Authors may be required to revise their manuscripts based on reviewer feedback before resubmission.
            </li>
            <li>
              <strong>Final Decision:</strong> The editorial team makes a final decision on the manuscript based on the reviewers recommendations and the authors revisions.
            </li>
          </ol>
          <p className="text-gray-600 text-lg leading-relaxed mb-4">
            For more information about our peer review process, please visit our website or contact the editorial office.
          </p>
        </CardContent>
      </Card>
    )
  }
];
