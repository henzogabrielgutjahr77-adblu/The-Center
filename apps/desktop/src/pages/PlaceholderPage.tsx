interface PlaceholderPageProps {
  title: string;
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="page">
      <h1>{title}</h1>
      <div className="list-message">
        Esta área ainda não foi implementada.
      </div>
    </div>
  );
}
