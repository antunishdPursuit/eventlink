import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, expect, test, vi } from 'vitest';
import axios from 'axios';
import Events from './Events';

vi.mock('axios', () => ({ default: { get: vi.fn(), delete: vi.fn(), put: vi.fn() } }));
vi.mock('./Event', () => ({ default: ({ event, handleDelete, handleSubmit }) => <div><input aria-label={`Draft ${event.artist}`} defaultValue="" /><button onClick={() => handleDelete(event.id).catch(() => {})}>Delete {event.artist}</button><button onClick={() => handleSubmit({ ...event, artist: 'Edited' }).catch(() => {})}>Save {event.artist}</button></div> }));
beforeEach(() => vi.resetAllMocks());

function renderEvents(newEventToAdd, onCountChange) {
  return render(<MemoryRouter initialEntries={['/users/1']}><Link to="/users/2">Other profile</Link><Routes><Route path="/users/:id" element={<Events newEventToAdd={newEventToAdd} onEventDeleted={vi.fn()} onCountChange={onCountChange} />} /></Routes></MemoryRouter>);
}

test('offers retry on a load failure and then shows the empty state', async () => {
  axios.get.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({ data: [] });
  renderEvents();
  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load saved events');
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
  expect(await screen.findByText('No saved events yet.')).toBeInTheDocument();
});

test('profile facts distinguish an unknown count from a loaded empty list', async () => {
  let finishLoad;
  axios.get.mockImplementationOnce(() => new Promise(resolve => { finishLoad = resolve; }));
  const countChanged = vi.fn();
  renderEvents(undefined, countChanged);
  expect(countChanged).toHaveBeenLastCalledWith('1', null);
  await act(async () => finishLoad({ data: [] }));
  await waitFor(() => expect(countChanged).toHaveBeenLastCalledWith('1', 0));
});

test('a failed background refresh keeps the current event draft mounted', async () => {
  axios.get.mockResolvedValueOnce({ data: [{ id: 1, artist: 'Example' }] }).mockRejectedValueOnce(new Error('offline'));
  const view = renderEvents();
  fireEvent.change(await screen.findByLabelText('Draft Example'), { target: { value: 'Unsaved draft' } });
  view.rerender(<MemoryRouter initialEntries={['/users/1']}><Link to="/users/2">Other profile</Link><Routes><Route path="/users/:id" element={<Events newEventToAdd={{ id: 2 }} onEventDeleted={vi.fn()} />} /></Routes></MemoryRouter>);
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
  view.rerender(<MemoryRouter initialEntries={['/users/1']}><Link to="/users/2">Other profile</Link><Routes><Route path="/users/:id" element={<Events newEventToAdd={{ id: 2 }} onEventDeleted={vi.fn()} />} /></Routes></MemoryRouter>);
  fireEvent.click(screen.getByRole('button', { name: 'Delete Example' }));
  expect(await screen.findByText('No saved events yet.')).toBeInTheDocument();
  resolveOldRefresh({ data: [{ id: 1, artist: 'Example' }] });
  await new Promise(resolve => setTimeout(resolve, 0));
  expect(screen.queryByRole('button', { name: 'Delete Example' })).not.toBeInTheDocument();
});

test.each(['resolve', 'reject'])('a delete that finishes after changing profiles cannot affect the next profile (%s)', async outcome => {
  let finishDelete, rejectDelete;
  axios.get.mockResolvedValueOnce({ data: [{ id: 1, artist: 'Example' }] }).mockResolvedValueOnce({ data: [{ id: 2, artist: 'Other' }] });
  axios.delete.mockImplementationOnce(() => new Promise((resolve, reject) => { finishDelete = resolve; rejectDelete = reject; }));
  renderEvents();
  fireEvent.click(await screen.findByRole('button', { name: 'Delete Example' }));
  fireEvent.click(screen.getByRole('link', { name: 'Other profile' }));
  await screen.findByRole('button', { name: 'Delete Other' });
  const readsBefore = axios.get.mock.calls.length;
  await act(async () => { if (outcome === 'resolve') finishDelete({ data: { id: 1 } }); else rejectDelete(new Error('Offline')); });
  expect(screen.getByRole('button', { name: 'Delete Other' })).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(axios.get).toHaveBeenCalledTimes(readsBefore);
});

test('an edit that finishes after changing profiles cannot refresh the next profile', async () => {
  let finishEdit;
  axios.get.mockResolvedValueOnce({ data: [{ id: 1, artist: 'Example' }] }).mockResolvedValueOnce({ data: [{ id: 2, artist: 'Other' }] });
  axios.put.mockImplementationOnce(() => new Promise(resolve => { finishEdit = resolve; }));
  renderEvents();
  fireEvent.click(await screen.findByRole('button', { name: 'Save Example' }));
  fireEvent.click(screen.getByRole('link', { name: 'Other profile' }));
  await screen.findByRole('button', { name: 'Delete Other' });
  const readsBefore = axios.get.mock.calls.length;
  await act(async () => finishEdit({ data: { id: 1, artist: 'Edited' } }));
  expect(screen.getByRole('button', { name: 'Delete Other' })).toBeInTheDocument();
  expect(axios.get).toHaveBeenCalledTimes(readsBefore);
});

test('repeated delete requests share one request and an already deleted event is removed', async () => {
  axios.get.mockResolvedValueOnce({ data: [{ id: 1, artist: 'Example' }] }).mockResolvedValueOnce({ data: [] });
  let rejectDelete;
  axios.delete.mockImplementationOnce(() => new Promise((resolve, reject) => { rejectDelete = reject; }));
  renderEvents();
  const remove = await screen.findByRole('button', { name: 'Delete Example' });
  fireEvent.click(remove);
  fireEvent.click(remove);
  expect(axios.delete).toHaveBeenCalledTimes(1);
  await act(async () => rejectDelete({ response: { status: 404 } }));
  expect(await screen.findByText('No saved events yet.')).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
