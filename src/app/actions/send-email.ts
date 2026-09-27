'use server';

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmailAction(formData: { name: string; email: string; message: string }) {
  try {
    const { name, email, message } = formData;

    if (!name || !email || !message) {
      return { success: false, error: 'გთხოვთ შეავსოთ ყველა ველი.' };
    }

    await resend.emails.send({
      from: 'YourBot <onboarding@resend.dev>',
      to: process.env.MY_EMAIL || '',
      subject: `ახალი შეტყობინება YourBot-იდან: ${name}`,
      replyTo: email,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #f9fafb;">
          <h2 style="color: #4f46e5; margin-bottom: 16px;">ახალი შეტყობინება საიტიდან</h2>
          <p style="margin: 8px 0;"><strong>სახელი:</strong> ${name}</p>
          <p style="margin: 8px 0;"><strong>ელ.ფოსტა:</strong> ${email}</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
          <p style="margin: 8px 0;"><strong>შეტყობინება:</strong></p>
          <p style="white-space: pre-wrap; background-color: #ffffff; padding: 12px; border-radius: 8px; border: 1px solid #e5e7eb;">${message}</p>
        </div>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error('Resend Error:', error);
    return { success: false, error: 'შეტყობინების გაგზავნა ვერ მოხერხდა.' };
  }
}