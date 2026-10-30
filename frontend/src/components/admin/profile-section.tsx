'use client';

import { FormEvent, useEffect, useState } from 'react';
import {
  graphql,
  optionalTextOrNull,
  type AdminProfile,
} from '@/lib/admin-api';
import { Field, FormCard } from './ui';

type ProfileSectionProps = {
  graphqlUrl: string;
  token: string;
  profile: AdminProfile;
  onSaved: (message: string) => void;
  onError: (message: string) => void;
  onChanged: () => Promise<void>;
};

export function ProfileSection({
  graphqlUrl,
  token,
  profile,
  onSaved,
  onError,
  onChanged,
}: ProfileSectionProps) {
  const [name, setName] = useState(profile.name);
  const [headline, setHeadline] = useState(profile.headline);
  const [location, setLocation] = useState(profile.location ?? '');
  const [description, setDescription] = useState(profile.description);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setName(profile.name);
    setHeadline(profile.headline);
    setLocation(profile.location ?? '');
    setDescription(profile.description);
  }, [profile]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    try {
      await graphql(
        graphqlUrl,
        `mutation UpdateProfile($input: UpdateProfileInput!) {
          updateProfile(input: $input) { id }
        }`,
        {
          input: {
            name: name.trim(),
            headline: headline.trim(),
            description: description.trim(),
            location: optionalTextOrNull(location),
          },
        },
        token,
      );
      await onChanged();
      onSaved('Профиль сохранён');
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Не удалось сохранить');
    } finally {
      setPending(false);
    }
  }

  return (
    <FormCard
      title="Профиль"
      hint="Имя, заголовок и текст на главной визитки"
      onSubmit={handleSubmit}
      actions={
        <button className="btn" disabled={pending} type="submit">
          {pending ? 'Сохраняю…' : 'Сохранить'}
        </button>
      }
    >
      <div className="admin-grid">
        <Field label="Имя">
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </Field>
        <Field label="Город">
          <input
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          />
        </Field>
      </div>
      <Field label="Должность / заголовок">
        <input
          required
          value={headline}
          onChange={(event) => setHeadline(event.target.value)}
        />
      </Field>
      <Field label="О себе">
        <textarea
          required
          rows={6}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </Field>
    </FormCard>
  );
}
