import type { FormEvent, ReactNode } from 'react';

type FieldProps = {
  label: string;
  children: ReactNode;
};

export function Field({ label, children }: FieldProps) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

type FormCardProps = {
  title: string;
  hint?: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  actions?: ReactNode;
};

export function FormCard({
  title,
  hint,
  onSubmit,
  children,
  actions,
}: FormCardProps) {
  return (
    <form className="admin-card" onSubmit={onSubmit}>
      <div className="admin-card-head">
        <h2>{title}</h2>
        {hint ? <p>{hint}</p> : null}
      </div>
      {children}
      <div className="admin-actions">{actions}</div>
    </form>
  );
}

type SectionProps = {
  title: string;
  hint?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function Section({ title, hint, actions, children }: SectionProps) {
  return (
    <section className="admin-section">
      <div className="admin-section-head">
        <div>
          <h2>{title}</h2>
          {hint ? <p>{hint}</p> : null}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}
