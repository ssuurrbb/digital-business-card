import {
  displayLink,
  emailLink,
  initials,
  isEmailLink,
  isExternalUrl,
  moreLabel,
  seekingSentence,
  skillGroups,
  splitAchievements,
  writeLink,
} from '@/lib/profile';
import type { Experience, Profile, ProfileLink, Project } from '@/types';

type CardProps = {
  profile: Profile;
};

function linkAttrs(url: string) {
  if (!isExternalUrl(url)) {
    return {};
  }
  return { target: '_blank', rel: 'noreferrer' } as const;
}

function actionButtons(links: ProfileLink[]) {
  const mail = emailLink(links);
  if (mail && links.length === 1) {
    return (
      <>
        <a className="btn" href={mail.url}>
          Написать на почту
        </a>
        <a className="btn ghost" href={mail.url}>
          {displayLink(mail)}
        </a>
      </>
    );
  }

  return links.map((link, index) => (
    <a
      className={index === 0 ? 'btn' : 'btn ghost'}
      href={link.url}
      key={`${link.kind}-${link.url}`}
      {...linkAttrs(link.url)}
    >
      {isEmailLink(link) && index === 0 ? 'Написать на почту' : displayLink(link)}
    </a>
  ));
}

function ProjectCard({ project }: { project: Project }) {
  const title = project.url ? (
    <a href={project.url} {...linkAttrs(project.url)}>
      {project.name}
    </a>
  ) : (
    project.name
  );

  return (
    <article className="project">
      <h2>{title}</h2>
      <p>{project.description}</p>
      {(project.url || project.repoUrl) && (
        <div className="project-links">
          {project.url ? (
            <a href={project.url} {...linkAttrs(project.url)}>
              Сайт
            </a>
          ) : null}
          {project.repoUrl ? (
            <a href={project.repoUrl} {...linkAttrs(project.repoUrl)}>
              Код
            </a>
          ) : null}
        </div>
      )}
      {project.skills.length > 0 ? (
        <div className="tags">
          {project.skills.map((skill) => (
            <span className="tag" key={skill.name}>
              {skill.name}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}

function Job({ job }: { job: Experience }) {
  const { visible, hidden } = splitAchievements(job);
  const company = job.companyUrl ? (
    <a className="company" href={job.companyUrl} {...linkAttrs(job.companyUrl)}>
      {job.company}
    </a>
  ) : (
    <span className="company">{job.company}</span>
  );

  return (
    <article className="job">
      <div className="job-side">
        {company}
        <span className="period">{job.period}</span>
        {job.isCurrent ? <span className="now">сейчас</span> : null}
      </div>
      <div>
        <h3>{job.position}</h3>
        {visible.length > 0 ? (
          <ul>
            {visible.map((item) => (
              <li key={item.text}>{item.text}</li>
            ))}
          </ul>
        ) : null}
        {hidden.length > 0 ? (
          <details className="more">
            <summary>{moreLabel(hidden.length)}</summary>
            <ul>
              {hidden.map((item) => (
                <li key={item.text}>{item.text}</li>
              ))}
            </ul>
          </details>
        ) : null}
      </div>
    </article>
  );
}

export function Card({ profile }: CardProps) {
  const mark = initials(profile.name);
  const write = writeLink(profile.links);
  const groups = skillGroups(profile.skills);
  const closing = seekingSentence(profile.description);
  const footerLink = write ?? profile.links[0];

  return (
    <>
      <header className="topbar">
        <div className="mark" aria-hidden="true">
          {mark}
        </div>
        <nav>
          {profile.projects.length > 0 ? (
            <a href="#projects">Проекты</a>
          ) : null}
          {profile.experience.length > 0 ? (
            <a href="#experience">Опыт</a>
          ) : null}
          {groups.length > 0 ? <a href="#skills">Стек</a> : null}
        </nav>
        {write ? (
          <a className="write" href={write.url} {...linkAttrs(write.url)}>
            Написать
          </a>
        ) : (
          <span />
        )}
      </header>

      <main className="wrap">
        <section className="hero">
          <div className="avatar" aria-hidden="true">
            {mark}
          </div>
          <div>
            {profile.location ? (
              <div className="meta">
                <span>{profile.location}</span>
              </div>
            ) : null}
            <h1>{profile.name}</h1>
            <p className="headline">{profile.headline}</p>
            <p className="bio">{profile.description}</p>
            {profile.links.length > 0 ? (
              <div className="actions">{actionButtons(profile.links)}</div>
            ) : null}
          </div>
        </section>

        {profile.projects.length > 0 ? (
          <section id="projects">
            <p className="kicker">Избранные проекты</p>
            <div className="projects">
              {profile.projects.map((project) => (
                <ProjectCard key={project.name} project={project} />
              ))}
            </div>
          </section>
        ) : null}

        {profile.experience.length > 0 ? (
          <section id="experience">
            <p className="kicker">Опыт</p>
            {profile.experience.map((job) => (
              <Job key={`${job.company}-${job.period}`} job={job} />
            ))}
          </section>
        ) : null}

        {groups.length > 0 ? (
          <section id="skills">
            <p className="kicker">Стек</p>
            <div className="skills">
              {groups.map((group) => (
                <div key={group.title}>
                  <h2>{group.title}</h2>
                  <div className="tags">
                    {group.skills.map((skill) => (
                      <span className="tag" key={skill.name}>
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <footer>
          <div className="close">
            <p className="kicker">Контакт</p>
            {closing ? <p className="close-text">{closing}</p> : null}
            {footerLink ? (
              <div className="actions">
                <a
                  className="btn"
                  href={footerLink.url}
                  {...linkAttrs(footerLink.url)}
                >
                  {displayLink(footerLink)}
                </a>
              </div>
            ) : null}
          </div>
        </footer>
      </main>
    </>
  );
}
