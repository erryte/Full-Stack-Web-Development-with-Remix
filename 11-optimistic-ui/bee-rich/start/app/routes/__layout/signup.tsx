import type { ActionArgs, LoaderArgs, V2_MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useActionData, useNavigation } from '@remix-run/react';
import { Button } from '~/components/buttons';
import { Card } from '~/components/containers';
import { Form, Input } from '~/components/forms';
import { H1 } from '~/components/headings';
import { InlineError } from '~/components/texts';
import { createUserSession, getUserId, registerUser } from '~/session.server';

export const meta: V2_MetaFunction = () => {
  return [
    { title: 'Sign Up | BeeRich' },
    { name: 'description', content: 'Sign up for a BeeRich account to track your expenses and income.' },
  ];
};

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const { name, email, password } = Object.fromEntries(formData);
  if (!name || !email || !password) {
    return json({ error: 'Please fill out all fields.' });
  }
  if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
    throw new Error('Invalid form data.');
  }
  try {
    const user = await registerUser({ name, email, password });
    return redirect('/dashboard', {
      headers: await createUserSession(user),
    });
  } catch (error: any) {
    return json({ error: error?.message || 'Something went wrong.' });
  }
}

export async function loader({ request }: LoaderArgs) {
  const userId = await getUserId(request);
  if (userId) {
    return redirect('/dashboard');
  }
  return {};
}

export default function SignUpPage() {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const actionData = useActionData<typeof action>();
  return (
    <Card>
      <Form method="POST" action="/signup">
        <H1>Sign Up</H1>
        <Input label="Name:" name="name" required />
        <Input label="Email:" name="email" type="email" required />
        <Input label="Password:" name="password" type="password" required />
        <Button disabled={isSubmitting} type="submit" isPrimary>
          {isSubmitting ? 'Signing you up...' : 'Sign up!'}
        </Button>
        <InlineError aria-live="assertive">{actionData?.error && actionData.error}</InlineError>
      </Form>
    </Card>
  );
}
