import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const data = await request.formData();
  const name = data.get('name');
  const email = data.get('email');
  const message = data.get('message');
  const errors = { name: '', email: '', message: '' };

  if (typeof name !== 'string' || name.length < 1) {
    errors.name += 'Please enter your name ';
  }
  if (typeof email !== 'string' || email.length < 1) {
    errors.email += 'Please enter your email';
  }
  if (typeof message !== 'string' || message.length < 1) {
    errors.message += 'Please enter a message ';
  }
  const hasErrors = Object.values(errors).some((msg) => msg);
  if (hasErrors) {
    return new Response(JSON.stringify({ errors: errors }), { status: 400 });
  }

  const smtpKv = locals.runtime.env.SMTP;
  const smtpHost = await smtpKv.get('host');
  const smtpUser = await smtpKv.get('user');
  const smtpPassword = await smtpKv.get('password');
  const toEmail = await smtpKv.get('toEmail');

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: 465,
      secure: true,
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    } as SMTPTransport.Options);
    await transporter.sendMail({
      from: `"${name}" <${email}>`,
      to: toEmail as string,
      subject: 'Website Contact Me Form',
      text: message as string,
    });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({
        errors: {
          submit: 'Unable to send message. Please try again in a few moments.',
        },
      }),
      { status: 500 }
    );
  }
  return new Response(
    JSON.stringify({
      message: 'Success!',
    }),
    { status: 202 }
  );
};
