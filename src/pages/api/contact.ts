import type { APIRoute } from 'astro';
import { LoopsClient } from 'loops';
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

  const loopsKv = locals.runtime.env.LOOPS;
  const loopsApiKey = await loopsKv.get('api_key');
  const loopsEmail = await loopsKv.get('email');
  const loopsTransactionalId = await loopsKv.get('transactionalId');

  try {
    const loops = new LoopsClient(loopsApiKey as string);

    const resp = await loops.sendTransactionalEmail({
      transactionalId: loopsTransactionalId as string,
      email: loopsEmail as string,
      dataVariables: {
        message: message as string,
        from: name as string,
        reply: email as string,
      },
    });
    if (!resp.success) {
      console.error(JSON.stringify(resp));
      return new Response(
        JSON.stringify({
          errors: {
            submit: 'Unable to send message. Please try again in a few moments.',
          },
        }),
        { status: 500 }
      );
    }
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
