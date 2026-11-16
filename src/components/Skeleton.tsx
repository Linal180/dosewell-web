export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="stack" aria-hidden="true">
      {Array.from({ length: rows }, (_, index) => (
        <div className="skeleton" key={index} />
      ))}
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="stack" aria-hidden="true">
      <div className="skeleton short" />
      <div className="skeleton" />
      <div className="skeleton" />
      <div className="skeleton short" />
    </div>
  );
}
