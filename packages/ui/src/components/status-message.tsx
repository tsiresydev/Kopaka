export type StatusTone =
  'neutral' | 'loading' | 'success' | 'error' | 'disabled';
const marks: Record<StatusTone, string> = {
  neutral: 'M8 12h8',
  loading: 'M12 7v5l3 2',
  success: 'm7 12 3 3 7-7',
  error: 'M12 7v6m0 3v1',
  disabled: 'm6 6 12 12',
};
export function StatusMessage({
  tone = 'neutral',
  label,
  message,
}: {
  tone?: StatusTone;
  label: string;
  message?: string;
}) {
  return (
    <div className="k-status" data-tone={tone}>
      <svg
        className="k-status-icon"
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="9" />
        <path d={marks[tone]} />
      </svg>
      <div>
        <strong>{label}</strong>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
}
