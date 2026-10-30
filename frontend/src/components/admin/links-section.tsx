'use client';

import { FormEvent, useEffect, useState } from 'react';
import {
  graphql,
  LINK_KINDS,
  type AdminLink,
  type AdminProfile,
} from '@/lib/admin-api';
import type { LinkKind } from '@/types';
import { Field, FormCard } from './ui';

type DraftLink = {
  key: string;
  kind: LinkKind;
  label: string;
  url: string;
};

type LinksSectionProps = {
  graphqlUrl: string;
  token: string;
  profile: AdminProfile;
  onSaved: (message: string) => void;
  onError: (message: string) => void;
  onChanged: () => Promise<void>;
};

function toDraft(links: AdminLink[]): DraftLink[] {
  return links.map((link) => ({
    key: link.id,
    kind: link.kind,
    label: link.label,
    url: link.url,
  }));
}

export function LinksSection({
  graphqlUrl,
  token,
  profile,
  onSaved,
  onError,
  onChanged,
}: LinksSectionProps) {
  const [links, setLinks] = useState<DraftLink[]>(() => toDraft(profile.links));
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setLinks(toDraft(profile.links));
  }, [profile.links]);

  function update(key: string, patch: Partial<DraftLink>) {
    setLinks((current) =>
      current.map((link) => (link.key === key ? { ...link, ...patch } : link)),
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    try {
      await graphql(
        graphqlUrl,
        `mutation ReplaceLinks($input: ReplaceLinksInput!) {
          replaceLinks(input: $input) { id }
        }`,
        {
          input: {
            links: links.map((link, index) => ({
              kind: link.kind,
              label: link.label.trim(),
              url: link.url.trim(),
              sortOrder: index,
            })),
          },
        },
        token,
      );
      await onChanged();
      onSaved('Ссылки сохранены');
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Не удалось сохранить');
    } finally {
      setPending(false);
    }
  }

  return (
    <FormCard
      title="Ссылки"
      hint="Кнопки на визитке: почта, GitHub, Telegram и остальное"
      onSubmit={handleSubmit}
      actions={
        <>
          <button
            className="btn ghost"
            type="button"
            onClick={() =>
              setLinks((current) => [
                ...current,
                {
                  key: `new-${Date.now()}`,
                  kind: 'OTHER',
                  label: '',
                  url: '',
                },
              ])
            }
          >
            Добавить ссылку
          </button>
          <button className="btn" disabled={pending} type="submit">
            {pending ? 'Сохраняю…' : 'Сохранить'}
          </button>
        </>
      }
    >
      {links.length === 0 ? (
        <p className="admin-empty">Ссылок пока нет.</p>
      ) : (
        links.map((link, index) => (
          <div className="admin-row" key={link.key}>
            <Field label="Тип">
              <select
                value={link.kind}
                onChange={(event) =>
                  update(link.key, { kind: event.target.value as LinkKind })
                }
              >
                {LINK_KINDS.map((kind) => (
                  <option key={kind.value} value={kind.value}>
                    {kind.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Подпись">
              <input
                required
                value={link.label}
                onChange={(event) =>
                  update(link.key, { label: event.target.value })
                }
              />
            </Field>
            <Field label="URL">
              <input
                required
                value={link.url}
                placeholder="mailto:you@mail.com или https://..."
                onChange={(event) =>
                  update(link.key, { url: event.target.value })
                }
              />
            </Field>
            <button
              className="btn ghost danger"
              type="button"
              onClick={() =>
                setLinks((current) =>
                  current.filter((item) => item.key !== link.key),
                )
              }
            >
              Удалить
            </button>
            <span className="admin-index">{index + 1}</span>
          </div>
        ))
      )}
    </FormCard>
  );
}
