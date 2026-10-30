'use client';

import { FormEvent, useMemo, useState } from 'react';
import {
  graphql,
  optionalText,
  optionalTextOrNull,
  splitLines,
  toDateInput,
  toIsoDate,
  type AdminExperience,
  type AdminProfile,
} from '@/lib/admin-api';
import { Field, FormCard, Section } from './ui';

type ExperienceSectionProps = {
  graphqlUrl: string;
  token: string;
  profile: AdminProfile;
  onSaved: (message: string) => void;
  onError: (message: string) => void;
  onChanged: () => Promise<void>;
};

type Draft = {
  id?: string;
  company: string;
  companyUrl: string;
  position: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  sortOrder: string;
  achievements: string;
};

const emptyDraft: Draft = {
  company: '',
  companyUrl: '',
  position: '',
  startDate: '',
  endDate: '',
  isCurrent: true,
  sortOrder: '0',
  achievements: '',
};

function fromJob(job: AdminExperience): Draft {
  return {
    id: job.id,
    company: job.company,
    companyUrl: job.companyUrl ?? '',
    position: job.position,
    startDate: toDateInput(job.startDate),
    endDate: toDateInput(job.endDate),
    isCurrent: job.isCurrent,
    sortOrder: String(job.sortOrder),
    achievements: job.achievements.map((item) => item.text).join('\n'),
  };
}

export function ExperienceSection({
  graphqlUrl,
  token,
  profile,
  onSaved,
  onError,
  onChanged,
}: ExperienceSectionProps) {
  const nextOrder = useMemo(
    () => String(profile.experience.length),
    [profile.experience.length],
  );
  const [draft, setDraft] = useState<Draft | null>(null);
  const [pending, setPending] = useState(false);

  function openNew() {
    setDraft({ ...emptyDraft, sortOrder: nextOrder });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) {
      return;
    }
    if (!draft.isCurrent && !draft.endDate) {
      onError('Укажите дату окончания или отметьте «сейчас работаю»');
      return;
    }
    setPending(true);
    try {
      const achievements = splitLines(draft.achievements);
      const sortOrder = Number(draft.sortOrder || '0');
      if (draft.id) {
        await graphql(
          graphqlUrl,
          `mutation UpdateExperience($input: UpdateExperienceInput!) {
            updateExperience(input: $input) { id }
          }`,
          {
            input: {
              id: draft.id,
              company: draft.company.trim(),
              companyUrl: optionalTextOrNull(draft.companyUrl),
              position: draft.position.trim(),
              startDate: toIsoDate(draft.startDate),
              endDate: draft.isCurrent ? null : toIsoDate(draft.endDate),
              sortOrder,
            },
          },
          token,
        );
        await graphql(
          graphqlUrl,
          `mutation ReplaceAchievements($input: ReplaceAchievementsInput!) {
            replaceAchievements(input: $input) { id }
          }`,
          { input: { experienceId: draft.id, texts: achievements } },
          token,
        );
      } else {
        await graphql(
          graphqlUrl,
          `mutation CreateExperience($input: CreateExperienceInput!) {
            createExperience(input: $input) { id }
          }`,
          {
            input: {
              company: draft.company.trim(),
              companyUrl: optionalText(draft.companyUrl),
              position: draft.position.trim(),
              startDate: toIsoDate(draft.startDate),
              endDate: draft.isCurrent ? undefined : toIsoDate(draft.endDate),
              sortOrder,
              achievements,
            },
          },
          token,
        );
      }
      setDraft(null);
      await onChanged();
      onSaved(draft.id ? 'Место работы обновлено' : 'Место работы добавлено');
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Не удалось сохранить');
    } finally {
      setPending(false);
    }
  }

  async function removeJob(job: AdminExperience) {
    const confirmed = window.confirm(`Удалить «${job.position} · ${job.company}»?`);
    if (!confirmed) {
      return;
    }
    try {
      await graphql(
        graphqlUrl,
        `mutation DeleteExperience($id: ID!) { deleteExperience(id: $id) }`,
        { id: job.id },
        token,
      );
      if (draft?.id === job.id) {
        setDraft(null);
      }
      await onChanged();
      onSaved('Запись удалена');
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Не удалось удалить');
    }
  }

  return (
    <div className="admin-stack">
      <Section
        title="Опыт"
        hint="Каждое место работы можно править отдельно"
        actions={
          <button className="btn ghost" type="button" onClick={openNew}>
            Добавить место
          </button>
        }
      >
        {profile.experience.length === 0 ? (
          <p className="admin-empty">Пока нет записей об опыте.</p>
        ) : (
          <ul className="admin-list">
            {profile.experience.map((job) => (
              <li key={job.id}>
                <div>
                  <strong>
                    {job.position} · {job.company}
                  </strong>
                  <span className="admin-meta">{job.period}</span>
                </div>
                <div className="admin-actions">
                  <button
                    className="btn ghost"
                    type="button"
                    onClick={() => setDraft(fromJob(job))}
                  >
                    Изменить
                  </button>
                  <button
                    className="btn ghost danger"
                    type="button"
                    onClick={() => void removeJob(job)}
                  >
                    Удалить
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {draft ? (
        <FormCard
          title={draft.id ? 'Редактирование опыта' : 'Новое место работы'}
          onSubmit={handleSubmit}
          actions={
            <>
              <button
                className="btn ghost"
                type="button"
                onClick={() => setDraft(null)}
              >
                Отмена
              </button>
              <button className="btn" disabled={pending} type="submit">
                {pending ? 'Сохраняю…' : 'Сохранить'}
              </button>
            </>
          }
        >
          <div className="admin-grid">
            <Field label="Компания">
              <input
                required
                value={draft.company}
                onChange={(event) =>
                  setDraft({ ...draft, company: event.target.value })
                }
              />
            </Field>
            <Field label="Сайт компании">
              <input
                value={draft.companyUrl}
                placeholder="https://..."
                onChange={(event) =>
                  setDraft({ ...draft, companyUrl: event.target.value })
                }
              />
            </Field>
          </div>
          <Field label="Должность">
            <input
              required
              value={draft.position}
              onChange={(event) =>
                setDraft({ ...draft, position: event.target.value })
              }
            />
          </Field>
          <div className="admin-grid">
            <Field label="Начало">
              <input
                required
                type="date"
                value={draft.startDate}
                onChange={(event) =>
                  setDraft({ ...draft, startDate: event.target.value })
                }
              />
            </Field>
            <Field label="Окончание">
              <input
                type="date"
                disabled={draft.isCurrent}
                value={draft.endDate}
                onChange={(event) =>
                  setDraft({ ...draft, endDate: event.target.value })
                }
              />
            </Field>
            <Field label="Порядок">
              <input
                type="number"
                min={0}
                value={draft.sortOrder}
                onChange={(event) =>
                  setDraft({ ...draft, sortOrder: event.target.value })
                }
              />
            </Field>
          </div>
          <label className="admin-check">
            <input
              type="checkbox"
              checked={draft.isCurrent}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  isCurrent: event.target.checked,
                  endDate: event.target.checked ? '' : draft.endDate,
                })
              }
            />
            <span>Сейчас работаю здесь</span>
          </label>
          <Field label="Достижения — каждое с новой строки">
            <textarea
              rows={8}
              value={draft.achievements}
              onChange={(event) =>
                setDraft({ ...draft, achievements: event.target.value })
              }
            />
          </Field>
        </FormCard>
      ) : null}
    </div>
  );
}
