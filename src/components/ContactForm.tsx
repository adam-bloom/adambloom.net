import { useState } from 'preact/hooks';
import type { Form as Props } from '~/types';

type FormResponse = {
  success: boolean;
  errors?: { [key: string]: string };
};

export default function Form(props: Props) {
  const [formResponse, setFormResponse] = useState({} as FormResponse);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(e: SubmitEvent) {
    setIsSubmitting(true);
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const response = await fetch('/api/contact', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    setFormResponse({ success: response.status === 202, errors: data?.errors });
    setIsSubmitting(false);
  }

  const textAreaName = props.textarea?.name ? props.textarea.name : 'message';

  return formResponse.success ? (
    <div>
      <p>Your message was successfully sent.</p>
    </div>
  ) : (
    <form onSubmit={submit}>
      {props.inputs &&
        props.inputs.map(
          ({ type = 'text', name, label = '', autocomplete = 'on', placeholder = '' }) =>
            name && (
              <div class="mb-6">
                {label && (
                  <label for={name} class="block text-sm font-medium">
                    {label}
                  </label>
                )}
                <input
                  type={type}
                  name={name}
                  id={name}
                  autocomplete={autocomplete}
                  placeholder={placeholder}
                  class="py-3 px-4 block w-full text-md rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900"
                />
                {formResponse.errors?.[name] && <p>{formResponse.errors[name]}</p>}
              </div>
            )
        )}

      {props.textarea && (
        <div>
          <label for="textarea" class="block text-sm font-medium">
            {props.textarea.label}
          </label>
          <textarea
            id="textarea"
            name={textAreaName}
            rows={props.textarea.rows ? props.textarea.rows : 4}
            placeholder={props.textarea.placeholder}
            class="py-3 px-4 block w-full text-md rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900"
          />
          {formResponse.errors?.[textAreaName] && <p>{formResponse.errors[textAreaName]}</p>}
        </div>
      )}

      {props.disclaimer && (
        <div class="mt-3 flex items-start">
          <div class="flex mt-0.5">
            <input
              id="disclaimer"
              name="disclaimer"
              type="checkbox"
              class="cursor-pointer mt-1 py-3 px-4 block w-full text-md rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900"
            />
          </div>
          <div class="ml-3">
            <label for="disclaimer" class="cursor-pointer select-none text-sm text-gray-600 dark:text-gray-400">
              {props.disclaimer.label}
            </label>
          </div>
        </div>
      )}

      {props.button && (
        <div class="mt-10 grid">
          <button
            class={'btn-primary'.concat(isSubmitting ? ' border-secondary bg-secondary' : '')}
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : props.button}
          </button>
          {formResponse.errors?.submit && <p>{formResponse.errors.submit}</p>}
        </div>
      )}

      {props.description && (
        <div class="mt-3 text-center">
          <p class="text-sm text-gray-600 dark:text-gray-400">{props.description}</p>
        </div>
      )}
    </form>
  );
}
