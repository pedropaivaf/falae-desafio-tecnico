export function StarRating({ rating }: { rating: number }) {
  return (
    <span aria-label={`Nota ${rating} de 5`} className="text-sm tracking-tight">
      <span className="text-brand-orange">{"★".repeat(rating)}</span>
      <span className="text-slate-300">{"★".repeat(5 - rating)}</span>
    </span>
  );
}
