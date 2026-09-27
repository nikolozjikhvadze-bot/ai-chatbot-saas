'use server';

import { Resend } from 'resend';

export async function sendEmailAction(formData: { name: string; email: string; message: string }) {
  console.log('1. Server Action დაიწყო');
  
  const apiKey = process.env.RESEND_API_KEY;
  const myEmail = process.env.MY_EMAIL;

  console.log('2. API Key:', apiKey ? 'არსებობს' : 'არ არის!');
  console.log('3. MY_EMAIL:', myEmail);

  if (!apiKey) {
    return { success: false, error: 'API Key არ არის მითითებული .env.local-ში' };
  }

  const resend = new Resend(apiKey);

  try {
    console.log('4. Resend-ზე მოთხოვნა იგზავნება...');
    
    const data = await resend.emails.send({
      from: 'YourBot <onboarding@resend.dev>',
      to: myEmail || '',
      subject: `ახალი შეტყობინება: ${formData.name}`,
      replyTo: formData.email,
      html: `<p><strong>${formData.name}</strong> (${formData.email}):</p><p>${formData.message}</p>`,
    });

    console.log('5. Resend-ის პასუხი:', data);
    return { success: true };
  } catch (error: any) {
    console.error('6. შეცდომა Resend-ში:', error);
    return { success: false, error: error?.message || 'შეცდომა გაგზავნისას' };
  }
}