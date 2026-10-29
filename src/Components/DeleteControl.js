import { useEffect, useId, useRef, useState } from 'react';

export default function DeleteControl({ label, description, onDelete, disabled = false, onPendingChange }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const busy = useRef(false);
  const trigger = useRef(null);
  const wasConfirming = useRef(false);
  const titleId = useId();
  useEffect(() => {
    if (!confirming && wasConfirming.current) trigger.current?.focus();
    wasConfirming.current = confirming;
  }, [confirming]);
  async function remove() {
    if (busy.current || disabled) return;
    busy.current = true; setPending(true); onPendingChange?.(true); setError('');
    try { await onDelete(); setConfirming(false); }
    catch { setError('Unable to delete. Please try again.'); }
    finally { busy.current = false; setPending(false); onPendingChange?.(false); }
  }
  if (!confirming) return <button ref={trigger} className="btn btn-outline-danger" type="button" disabled={disabled} onClick={() => { setError(''); setConfirming(true); }}>{label}</button>;
  return <section className="delete-confirmation" aria-labelledby={titleId} aria-busy={pending} onKeyDown={event => { if (event.key === 'Escape' && !pending) { event.preventDefault(); setConfirming(false); } }}>
    <h3 id={titleId}>{label}?</h3><p>{description}</p>
    {error && <p role="alert">{error}</p>}
    <div className="confirmation-actions">
      <button className="btn btn-secondary" type="button" autoFocus disabled={pending} onClick={() => setConfirming(false)}>Cancel</button>
      <button className="btn btn-danger" type="button" disabled={pending || disabled} onClick={remove}>{pending ? 'Deleting...' : 'Delete permanently'}</button>
    </div>
  </section>;
}
