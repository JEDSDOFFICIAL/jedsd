import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY!);

export const getBaseUrl = () => {
  return process.env.NEXTAUTH_URL || 'http://localhost:3000';
};

export const getFromEmail = () => {
  return process.env.NEXT_ENV_FROM_MAIL!;
};

export const getAdminEmail = () => {
  return process.env.NEXT_ENV_TO_ADMIN!;
};

export interface EmailOptions {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
}

export const sendEmail = async (options: EmailOptions) => {
  try {
    const { data, error } = await resend.emails.send({
      from: getFromEmail(),
      to: options.to,
      subject: options.subject,
      react: options.react,
    });

    if (error) {
      console.error('Email sending error:', error);
      return { success: false, error };
    }

    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error };
  }
};

export const generateResetPasswordUrl = (token: string) => {
  return `${getBaseUrl()}/auth/reset-password?token=${token}`;
};

export const generateVerificationUrl = (token: string) => {
  return `${getBaseUrl()}/verify?token=${token}`;
};

export const generateDashboardUrl = () => {
  return `${getBaseUrl()}/dashboard`;
};

export const generatePaperUrl = (paperId: string) => {
  return `${getBaseUrl()}/paper/${paperId}`;
};

export const generateReviewUrl = (paperId: string) => {
  return `${getBaseUrl()}/review/${paperId}`;
};

export const generateEditorPaperUrl = (paperId: string) => {
  return `${getBaseUrl()}/dashboard/editor/papers/${paperId}`;
};

export const generateAdminPaperUrl = (paperId: string) => {
  return `${getBaseUrl()}/dashboard/admin/papers/${paperId}`;
};
