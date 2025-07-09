import { ResearchPaper, User } from "@prisma/client";
import { sendAuthorPaperStatusUpdateMail } from "./sendAuthorPaperStatusUpdateMail";
import { sendAdminPaperNotificationMail } from "./sendAdminPaperNotificationMail";
import { sendEditorPaperAllocationMail } from "./sendEditorPaperAllocationMail";
import { sendReviewerPaperMail } from "./send-reviewer-new-paper-mail";
import { sendPointOfContactNotificationMail } from "./sendPointOfContactNotificationMail";
import { sendContributorNotificationMail } from "./sendContributorNotificationMail";
import { sendReviewerStatusUpdateMail } from "./sendReviewerStatusUpdateMail";
import { sendEditorStatusUpdateMail } from "./sendEditorStatusUpdateMail";
import prisma from "@/lib/prisma";

interface Contributor {
  name: string;
  email: string;
  contribution: string;
}

interface PointOfContact {
  name: string;
  email: string;
  phone?: string;
}

export class NotificationService {
  // Send notifications when paper status changes
  static async sendPaperStatusUpdateNotifications(
    paper: ResearchPaper & { author: User | null },
    newStatus: string,
    message?: string
  ) {
    const notifications = [];

    // 1. Notify author
    if (paper.author) {
      const authorResult = await sendAuthorPaperStatusUpdateMail(
        paper,
        paper.author,
        newStatus,
        message
      );
      notifications.push({ type: 'author', result: authorResult });
    }

    // 2. Notify point of contact
    try {
      const pointOfContact: PointOfContact = JSON.parse(paper.pointOfContact as string);
      if (pointOfContact.email) {
        const pocResult = await sendPointOfContactNotificationMail(
          paper,
          pointOfContact,
          'STATUS_UPDATE',
          message
        );
        notifications.push({ type: 'pointOfContact', result: pocResult });
      }
    } catch (error) {
      console.error('Error parsing point of contact:', error);
    }

    // 3. Notify contributors
    try {
      const contributors: Contributor[] = JSON.parse(paper.contributors as string);
      for (const contributor of contributors) {
        if (contributor.email) {
          const contributorResult = await sendContributorNotificationMail(
            paper.title,
            contributor,
            newStatus === 'ACCEPTED' ? 'ACCEPTANCE' : newStatus === 'REJECTED' ? 'REJECTION' : 'SUBMISSION',
            paper.id,
            message
          );
          notifications.push({ type: 'contributor', result: contributorResult });
        }
      }
    } catch (error) {
      console.error('Error parsing contributors:', error);
    }

    // 4. Notify admins
    const admins = await prisma.user.findMany({
      where: { userType: 'ADMIN' }
    });

    for (const admin of admins) {
      const adminResult = await sendAdminPaperNotificationMail(
        paper,
        admin,
        `Paper status updated to ${newStatus}`
      );
      notifications.push({ type: 'admin', result: adminResult });
    }

    return notifications;
  }

  // Send notifications when reviewer is assigned
  static async sendReviewerAssignmentNotifications(
    paper: ResearchPaper & { author: User | null },
    reviewer: User
  ) {
    const notifications = [];

    // 1. Notify reviewer
    const reviewerResult = await sendReviewerPaperMail(paper, reviewer);
    notifications.push({ type: 'reviewer', result: reviewerResult });

    // 2. Notify author
    if (paper.author) {
      const authorResult = await sendAuthorPaperStatusUpdateMail(
        paper,
        paper.author,
        'REVIEWER_ALLOCATION',
        `Your paper has been assigned to reviewer: ${reviewer.name}`
      );
      notifications.push({ type: 'author', result: authorResult });
    }

    // 3. Notify admins
    const admins = await prisma.user.findMany({
      where: { userType: 'ADMIN' }
    });

    for (const admin of admins) {
      const adminResult = await sendAdminPaperNotificationMail(
        paper,
        admin,
        `Reviewer ${reviewer.name} assigned to paper`
      );
      notifications.push({ type: 'admin', result: adminResult });
    }

    return notifications;
  }

  // Send notifications when editor is assigned
  static async sendEditorAssignmentNotifications(
    paper: ResearchPaper & { author: User | null },
    editor: User
  ) {
    const notifications = [];

    // 1. Notify editor
    const editorResult = await sendEditorPaperAllocationMail(paper, editor);
    notifications.push({ type: 'editor', result: editorResult });

    // 2. Notify author
    if (paper.author) {
      const authorResult = await sendAuthorPaperStatusUpdateMail(
        paper,
        paper.author,
        'EDITOR_ALLOCATION',
        `Your paper has been assigned to editor: ${editor.name}`
      );
      notifications.push({ type: 'author', result: authorResult });
    }

    // 3. Notify admins
    const admins = await prisma.user.findMany({
      where: { userType: 'ADMIN' }
    });

    for (const admin of admins) {
      const adminResult = await sendAdminPaperNotificationMail(
        paper,
        admin,
        `Editor ${editor.name} assigned to paper`
      );
      notifications.push({ type: 'admin', result: adminResult });
    }

    return notifications;
  }

  // Send notifications when paper is published
  static async sendPublicationNotifications(
    paper: ResearchPaper & { author: User | null }
  ) {
    const notifications = [];

    // 1. Notify author
    if (paper.author) {
      const authorResult = await sendAuthorPaperStatusUpdateMail(
        paper,
        paper.author,
        'PUBLISH',
        'Congratulations! Your paper has been published.'
      );
      notifications.push({ type: 'author', result: authorResult });
    }

    // 2. Notify point of contact
    try {
      const pointOfContact: PointOfContact = JSON.parse(paper.pointOfContact as string);
      if (pointOfContact.email) {
        const pocResult = await sendPointOfContactNotificationMail(
          paper,
          pointOfContact,
          'PUBLICATION',
          'The paper has been successfully published.'
        );
        notifications.push({ type: 'pointOfContact', result: pocResult });
      }
    } catch (error) {
      console.error('Error parsing point of contact:', error);
    }

    // 3. Notify contributors
    try {
      const contributors: Contributor[] = JSON.parse(paper.contributors as string);
      for (const contributor of contributors) {
        if (contributor.email) {
          const contributorResult = await sendContributorNotificationMail(
            paper.title,
            contributor,
            'PUBLICATION',
            paper.id,
            'The paper has been successfully published.'
          );
          notifications.push({ type: 'contributor', result: contributorResult });
        }
      }
    } catch (error) {
      console.error('Error parsing contributors:', error);
    }

    return notifications;
  }

  // Send reviewer status update notifications
  static async sendReviewerStatusNotifications(
    paper: ResearchPaper,
    reviewer: User,
    reviewerStatus: string,
    reviewText?: string,
    rating?: number
  ) {
    const notifications = [];

    // 1. Notify reviewer
    const reviewerResult = await sendReviewerStatusUpdateMail(
      paper,
      reviewer,
      reviewerStatus,
      reviewText,
      rating
    );
    notifications.push({ type: 'reviewer', result: reviewerResult });

    // 2. Notify admins
    const admins = await prisma.user.findMany({
      where: { userType: 'ADMIN' }
    });

    for (const admin of admins) {
      const adminResult = await sendAdminPaperNotificationMail(
        paper,
        admin,
        `Reviewer ${reviewer.name} updated status to ${reviewerStatus}`
      );
      notifications.push({ type: 'admin', result: adminResult });
    }

    return notifications;
  }

  // Send editor status update notifications
  static async sendEditorStatusNotifications(
    paper: ResearchPaper,
    editor: User,
    editorStatus: string,
    editorNotes?: string
  ) {
    const notifications = [];

    // 1. Notify editor
    const editorResult = await sendEditorStatusUpdateMail(
      paper,
      editor,
      editorStatus,
      editorNotes
    );
    notifications.push({ type: 'editor', result: editorResult });

    // 2. Notify admins
    const admins = await prisma.user.findMany({
      where: { userType: 'ADMIN' }
    });

    for (const admin of admins) {
      const adminResult = await sendAdminPaperNotificationMail(
        paper,
        admin,
        `Editor ${editor.name} updated status to ${editorStatus}`
      );
      notifications.push({ type: 'admin', result: adminResult });
    }

    return notifications;
  }
}
