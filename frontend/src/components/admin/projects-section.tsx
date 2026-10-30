'use client';

import { FormEvent, useMemo, useState } from 'react';
import {
  graphql,
  optionalText,
  optionalTextOrNull,
  type AdminProfile,
  type AdminProject,
  type AdminSkill,
} from '@/lib/admin-api';
import { Field, FormCard, Section } from './ui';

type ProjectsSectionProps = {
  graphqlUrl: string;
  token: string;
  profile: AdminProfile;
  skills: AdminSkill[];
  onSaved: (message: string) => void;
  onError: (message: string) => void;
  onChanged: () => Promise<void>;
};

type Draft = {
  id?: string;
  name: string;
  description: string;
  url: string;
  repoUrl: string;
  sortOrder: string;
  skillNames: string[];
};

const emptyDraft: Draft = {
  name: '',
  description: '',
  url: '',
  repoUrl: '',
  sortOrder: '0',
  skillNames: [],
};

function fromProject(project: AdminProject): Draft {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    url: project.url ?? '',
    repoUrl: project.repoUrl ?? '',
    sortOrder: String(project.sortOrder),
    skillNames: project.skills.map((skill) => skill.name),
  };
}

export function ProjectsSection({
  graphqlUrl,
  token,
  profile,
  skills,
  onSaved,
  onError,
  onChanged,
}: ProjectsSectionProps) {
  const nextOrder = useMemo(
    () => String(profile.projects.length),
    [profile.projects.length],
  );
  const [draft, setDraft] = useState<Draft | null>(null);
  const [pending, setPending] = useState(false);

  function toggleSkill(name: string) {
    if (!draft) {
      return;
    }
    setDraft({
      ...draft,
      skillNames: draft.skillNames.includes(name)
        ? draft.skillNames.filter((item) => item !== name)
        : [...draft.skillNames, name],
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) {
      return;
    }
    setPending(true);
    try {
      const sortOrder = Number(draft.sortOrder || '0');
      if (draft.id) {
        await graphql(
          graphqlUrl,
          `mutation UpdateProject($input: UpdateProjectInput!) {
            updateProject(input: $input) { id }
          }`,
          {
            input: {
              id: draft.id,
              name: draft.name.trim(),
              description: draft.description.trim(),
              url: optionalTextOrNull(draft.url),
              repoUrl: optionalTextOrNull(draft.repoUrl),
              sortOrder,
            },
          },
          token,
        );
        await graphql(
          graphqlUrl,
          `mutation SetProjectSkills($input: SetProjectSkillsInput!) {
            setProjectSkills(input: $input) { id }
          }`,
          { input: { projectId: draft.id, names: draft.skillNames } },
          token,
        );
      } else {
        await graphql(
          graphqlUrl,
          `mutation CreateProject($input: CreateProjectInput!) {
            createProject(input: $input) { id }
          }`,
          {
            input: {
              name: draft.name.trim(),
              description: draft.description.trim(),
              url: optionalText(draft.url),
              repoUrl: optionalText(draft.repoUrl),
              sortOrder,
              skillNames: draft.skillNames,
            },
          },
          token,
        );
      }
      setDraft(null);
      await onChanged();
      onSaved(draft.id ? 'Проект обновлён' : 'Проект добавлен');
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Не удалось сохранить');
    } finally {
      setPending(false);
    }
  }

  async function removeProject(project: AdminProject) {
    const confirmed = window.confirm(`Удалить проект «${project.name}»?`);
    if (!confirmed) {
      return;
    }
    try {
      await graphql(
        graphqlUrl,
        `mutation DeleteProject($id: ID!) { deleteProject(id: $id) }`,
        { id: project.id },
        token,
      );
      if (draft?.id === project.id) {
        setDraft(null);
      }
      await onChanged();
      onSaved('Проект удалён');
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Не удалось удалить');
    }
  }

  return (
    <div className="admin-stack">
      <Section
        title="Проекты"
        hint="Карточки в блоке «Избранные проекты»"
        actions={
          <button
            className="btn ghost"
            type="button"
            onClick={() => setDraft({ ...emptyDraft, sortOrder: nextOrder })}
          >
            Добавить проект
          </button>
        }
      >
        {profile.projects.length === 0 ? (
          <p className="admin-empty">Проектов пока нет.</p>
        ) : (
          <ul className="admin-list">
            {profile.projects.map((project) => (
              <li key={project.id}>
                <div>
                  <strong>{project.name}</strong>
                  <span className="admin-meta">
                    {project.skills.map((skill) => skill.name).join(' · ') ||
                      'без стека'}
                  </span>
                </div>
                <div className="admin-actions">
                  <button
                    className="btn ghost"
                    type="button"
                    onClick={() => setDraft(fromProject(project))}
                  >
                    Изменить
                  </button>
                  <button
                    className="btn ghost danger"
                    type="button"
                    onClick={() => void removeProject(project)}
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
          title={draft.id ? 'Редактирование проекта' : 'Новый проект'}
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
          <Field label="Название">
            <input
              required
              value={draft.name}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
            />
          </Field>
          <Field label="Описание">
            <textarea
              required
              rows={5}
              value={draft.description}
              onChange={(event) =>
                setDraft({ ...draft, description: event.target.value })
              }
            />
          </Field>
          <div className="admin-grid">
            <Field label="Сайт">
              <input
                value={draft.url}
                placeholder="https://..."
                onChange={(event) =>
                  setDraft({ ...draft, url: event.target.value })
                }
              />
            </Field>
            <Field label="Репозиторий">
              <input
                value={draft.repoUrl}
                placeholder="https://github.com/..."
                onChange={(event) =>
                  setDraft({ ...draft, repoUrl: event.target.value })
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
          <fieldset className="admin-fieldset">
            <legend>Стек проекта</legend>
            <div className="admin-checks">
              {skills.map((skill) => (
                <label className="admin-check" key={skill.id}>
                  <input
                    type="checkbox"
                    checked={draft.skillNames.includes(skill.name)}
                    onChange={() => toggleSkill(skill.name)}
                  />
                  <span>{skill.name}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </FormCard>
      ) : null}
    </div>
  );
}
