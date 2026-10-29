import { act, fireEvent, render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import DeleteControl from './DeleteControl';

test('opening, canceling and escaping never delete and restore trigger focus', () => {
  const remove = vi.fn();
  render(<DeleteControl label="Delete profile" description="Permanently remove your account." onDelete={remove} />);
  fireEvent.click(screen.getByRole('button', { name: 'Delete profile' }));
  expect(remove).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(screen.getByRole('button', { name: 'Delete profile' })).toHaveFocus();
  fireEvent.click(screen.getByRole('button', { name: 'Delete profile' }));
  fireEvent.keyDown(screen.getByRole('button', { name: 'Cancel' }), { key: 'Escape' });
  expect(screen.getByRole('button', { name: 'Delete profile' })).toHaveFocus();
  expect(remove).not.toHaveBeenCalled();
});

test('confirmation prevents repeated requests and locks cancellation until complete', async () => {
  let finish;
  const remove = vi.fn(() => new Promise(resolve => { finish = resolve; }));
  const pending = vi.fn();
  render(<DeleteControl label="Delete" description="Remove this event." onDelete={remove} onPendingChange={pending} />);
  fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
  const confirm = screen.getByRole('button', { name: 'Delete permanently' });
  fireEvent.click(confirm);
  fireEvent.click(confirm);
  expect(remove).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Deleting...' })).toBeDisabled();
  await act(async () => finish());
  expect(screen.getByRole('button', { name: 'Delete' })).toHaveFocus();
  expect(pending.mock.calls).toEqual([[true], [false]]);
});

test('failure retains the confirmation and permits an explicit retry', async () => {
  const remove = vi.fn().mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce();
  render(<DeleteControl label="Delete" description="Remove this event." onDelete={remove} />);
  fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
  fireEvent.click(screen.getByRole('button', { name: 'Delete permanently' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to delete');
  fireEvent.click(screen.getByRole('button', { name: 'Delete permanently' }));
  expect(await screen.findByRole('button', { name: 'Delete' })).toBeInTheDocument();
  expect(remove).toHaveBeenCalledTimes(2);
});
