'use client';

import { FormEvent, useEffect, useState } from 'react';
import {
  graphql,
  SKILL_CATEGORIES,
  type AdminProfile,
  type AdminSkill,
} from '@/lib/admin-api';
import type { SkillCategory } from '@/types';
import { Field, FormCard, Section } from './ui';

type SkillsSectionProps = {
  graphqlUrl: string;
  token: string;
  profile: AdminProfile;
  skills: AdminSkill[];
  onSaved: (message: string) => void;
  onError: (message: string) => void;
  onChanged: () => Promise<void>;
};

export function SkillsSection({
  graphqlUrl,
  token,
  profile,
  skills,
  onSaved,
  onError,
  onChanged,
}: SkillsSectionProps) {
  const [selected, setSelected] = useState<string[]>(() =>
    profile.skills.map((skill) => skill.name),
  );
  const [name, setName] = useState('');
  const [category, setCategory] = useState<SkillCategory>('LANGUAGE');
  const [savingProfile, setSavingProfile] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    setSelected(profile.skills.map((skill) => skill.name));
  }, [profile.skills]);

  function toggle(skillName: string) {
    setSelected((current) =>
      current.includes(skillName)
        ? current.filter((item) => item !== skillName)
        : [...current, skillName],
    );
  }

  async function saveProfileSkills(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingProfile(true);
    try {
      await graphql(
        graphqlUrl,
        `mutation SetProfileSkills($input: SetProfileSkillsInput!) {
          setProfileSkills(input: $input) { id }
        }`,
        { input: { names: selected } },
        token,
      );
      await onChanged();
      onSaved('Навыки на визитке обновлены');
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Не удалось сохранить');
    } finally {
      setSavingProfile(false);
    }
  }

  async function createSkill(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    try {
      await graphql(
        graphqlUrl,
        `mutation UpsertSkill($input: UpsertSkillInput!) {
          upsertSkill(input: $input) { id name }
        }`,
        { input: { name: name.trim(), category } },
        token,
      );
      setName('');
      await onChanged();
      onSaved('Навык сохранён в справочнике');
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Не удалось сохранить');
    } finally {
      setCreating(false);
    }
  }

  async function removeSkill(skill: AdminSkill) {
    const confirmed = window.confirm(
      `Удалить навык «${skill.name}»? Он также снимется с проектов и визитки.`,
    );
    if (!confirmed) {
      return;
    }
    try {
      await graphql(
        graphqlUrl,
        `mutation DeleteSkill($id: ID!) { deleteSkill(id: $id) }`,
        { id: skill.id },
        token,
      );
      await onChanged();
      onSaved(`Навык «${skill.name}» удалён`);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Не удалось удалить');
    }
  }

  return (
    <div className="admin-stack">
      <FormCard
        title="Навыки на визитке"
        hint="Отметьте то, что показывается в блоке «Стек». Порядок — как в списке ниже."
        onSubmit={saveProfileSkills}
        actions={
          <button className="btn" disabled={savingProfile} type="submit">
            {savingProfile ? 'Сохраняю…' : 'Сохранить набор'}
          </button>
        }
      >
        <div className="admin-checks">
          {skills.map((skill) => (
            <label className="admin-check" key={skill.id}>
              <input
                type="checkbox"
                checked={selected.includes(skill.name)}
                onChange={() => toggle(skill.name)}
              />
              <span>{skill.name}</span>
            </label>
          ))}
        </div>
      </FormCard>

      <FormCard
        title="Новый навык"
        hint="Сначала добавьте навык в справочник, потом повесьте его на визитку или проект"
        onSubmit={createSkill}
        actions={
          <button className="btn" disabled={creating} type="submit">
            {creating ? 'Добавляю…' : 'Добавить'}
          </button>
        }
      >
        <div className="admin-grid">
          <Field label="Название">
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </Field>
          <Field label="Категория">
            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as SkillCategory)
              }
            >
              {SKILL_CATEGORIES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </FormCard>

      <Section title="Справочник" hint="Удаление снимает навык везде, где он использовался">
        <ul className="admin-list">
          {skills.map((skill) => (
            <li key={skill.id}>
              <div>
                <strong>{skill.name}</strong>
                <span className="admin-meta">
                  {SKILL_CATEGORIES.find((item) => item.value === skill.category)
                    ?.label ?? skill.category}
                </span>
              </div>
              <button
                className="btn ghost danger"
                type="button"
                onClick={() => void removeSkill(skill)}
              >
                Удалить
              </button>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
