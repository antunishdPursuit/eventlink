import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { expect, test, vi } from 'vitest';
import axios from 'axios';
import Events from './Events';

vi.mock('axios', () => ({ default: { get: vi.fn(), delete: vi.fn(), put: vi.fn() } }));
vi.mock('./Event', () => ({ default: ({ event, handleDelete }) => <div><input aria-label={`Draft ${event.artist}`} defaultValue="" /><button onClick={() => handleDelete(event.id)}>Delete {event.artist}</button></div> }));

function renderEvents(newEventToAdd) {
  return render(<MemoryRouter initialEntries={['/users/1']}><Routes><Route path="/users/:id" element={<Events newEventToAdd={newEventToAdd} onEventDeleted={vi.fn()} />} /></Routes></MemoryRouter>);
}

test('offers retry on a load failure and then shows the empty state', async () => {
  axios.get.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({ data: [] });
  renderEvents();
  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load saved events');
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
  expect(await screen.findByText('No saved events yet.')).toBeInTheDocument();
});

test('a failed background refresh keeps the current event draft mounted', async () => {
  axios.get.mockResolvedValueOnce({ data: [{ id: 1, artist: 'Example' }] }).mockRejectedValueOnce(new Error('offline'));
  const view = renderEvents();
  fireEvent.change(await screen.findByLabelText('Draft Example'), { target: { value: 'Unsaved draft' } });
  view.rerender(<MemoryRouter initialEntries={['/users/1']}><Routes><Route path="/users/:id" element={<Events newEventToAdd={{ id: 2 }} onEventDeleted={vi.fn()} />} /></Routes></MemoryRouter>);
  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to refresh saved events');
  expect(screen.getByLabelText('Draft Example')).toHaveValue('Unsaved draft');
});

test('a failed delete keeps the saved event visible', async () => {
  axios.get.mockResolvedValueOnce({ data: [{ id: 1, artist: 'Example' }] });
  axios.delete.mockRejectedValueOnce(new Error('offline'));
  renderEvents();
  fireEvent.click(await screen.findByRole('button', { name: 'Delete Example' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to delete event');
  expect(screen.getByRole('button', { name: 'Delete Example' })).toBeInTheDocument();
});

test('an older refresh cannot restore an event after deletion', async () => {
  let resolveOldRefresh;
  const oldRefresh = new Promise(resolve => { resolveOldRefresh = resolve; });
  axios.get.mockResolvedValueOnce({ data: [{ id: 1, artist: 'Example' }] })
    .mockReturnValueOnce(oldRefresh).mockResolvedValueOnce({ data: [] });
  axios.delete.mockResolvedValueOnce({ data: { id: 1, artist: 'Example' } });
  const view = renderEvents();
  await screen.findByRole('button', { name: 'Delete Example' });
  view.rerender(<MemoryRouter initialEntries={['/users/1']}><Routes><Route path="/users/:id" element={<Events newEventToAdd={{ id: 2 }} onEventDeleted={vi.fn()} />} /></Routes></MemoryRouter>);
  fireEvent.click(screen.getByRole('button', { name: 'Delete Example' }));
  expect(await screen.findByText('No saved events yet.')).toBeInTheDocument();
  resolveOldRefresh({ data: [{ id: 1, artist: 'Example' }] });
  await new Promise(resolve => setTimeout(resolve, 0));
  expect(screen.queryByRole('button', { name: 'Delete Example' })).not.toBeInTheDocument();
});
