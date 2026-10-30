'use client';

type ErrorPageProps = {
  reset: () => void;
};

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <main className="status">
      <p className="kicker">Ошибка</p>
      <h1>Не удалось загрузить визитку</h1>
      <p>Проверьте, что API запущен и GRAPHQL_URL указывает на него.</p>
      <div className="actions">
        <button className="btn" onClick={reset} type="button">
          Повторить
        </button>
      </div>
    </main>
  );
}
