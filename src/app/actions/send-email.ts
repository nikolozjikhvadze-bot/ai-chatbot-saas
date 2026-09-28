'use server';

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmailAction(formData: { name: string; email: string; message: string }) {
  try {
    const { name, email, message } = formData;

    // იღებს .env.local-იდან MY_EMAIL-ს, ხოლოდ თუ ვერ წაიკითხა, იყენებს სათადარიგოს
    const recipientEmail = process.env.MY_EMAIL || 'nikolozjikhvadze@gmail.com';

    await resend.emails.send({
      from: 'YourBot <onboarding@resend.dev>',
      to: 'yourbot95@gmail.com', // წერილი მოდის შენთან
      replyTo: email,     // პასუხის გაცემისას პასუხი მიდის მომხმარებელთან
      subject: `ახალი შეტყობინება YourBot-ზე: ${name}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #6d28d9;">ახალი შეტყობინება საიტიდან</h2>
          <p><strong>სახელი:</strong> ${name}</p>
          <p><strong>მომხმარებლის ელ.ფოსტა:</strong> ${email}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 15px 0;" />
          <p><strong>შეტყობინება:</strong></p>
          <p style="background: #f9fafb; padding: 12px; border-radius: 8px;">${message}</p>
        </div>
      `,
    });

    return { success: true };
  } catch (error: any) {
    console.error('Resend Error:', error);
    return { success: false, error: error?.message || 'გაგზავნა ვერ მოხერხდა' };
  }
}