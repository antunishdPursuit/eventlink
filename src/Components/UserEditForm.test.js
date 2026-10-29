import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Link, MemoryRouter, Routes, Route } from 'react-router-dom';
import { beforeEach, expect, test, vi } from 'vitest';
import axios from 'axios';
import UserEditForm from './UserEditForm';

const auth = vi.hoisted(() => ({ userId: 1, sessionLoading: false, deleteProfile: vi.fn() }));
vi.mock('../AuthContext', () => ({ useAuth: () => auth }));
vi.mock('axios', () => ({ default: { get: vi.fn(), put: vi.fn() } }));
const profile = { id: 1, username: 'test-person', profile_picture: 'https://example.com/photo.jpg', bio: 'Original bio', looking_for_group: false, date_created: '2023-08-01' };

function openForm() {
  return render(<MemoryRouter initialEntries={['/users/1/edit']}><Link to="/about">About</Link><Routes><Route path="/users/:id/edit" element={<UserEditForm />} /><Route path="/users" element={<h1>People screen</h1>} /><Route path="/users/:id" element={<h1>Profile screen</h1>} /><Route path="/about" element={<h1>About screen</h1>} /></Routes></MemoryRouter>);
}

beforeEach(() => { vi.clearAllMocks(); auth.userId = 1; });

test('a failed profile load offers retry instead of an empty editable form', async () => {
  axios.get.mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce({ data: profile });
  openForm();
  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load this profile.');
  expect(screen.queryByRole('button', { name: 'Save changes' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
  expect(await screen.findByLabelText('Username')).toHaveValue('test-person');
});

test('a failed save keeps the draft and allows retry without a duplicate pending request', async () => {
  axios.get.mockResolvedValue({ data: profile });
  let rejectSave;
  axios.put.mockImplementationOnce(() => new Promise((resolve, reject) => { rejectSave = reject; }));
  openForm();
  fireEvent.change(await screen.findByLabelText('Bio'), { target: { value: 'Keep this draft' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  rejectSave(new Error('Offline'));
  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to save your changes.');
  expect(screen.getByLabelText('Bio')).toHaveValue('Keep this draft');
  expect(screen.getByRole('button', { name: 'Save changes' })).toBeEnabled();
  expect(axios.put).toHaveBeenCalledTimes(1);
  await waitFor(() => expect(screen.getByLabelText('Bio')).toBeEnabled());
});

test('a save finishing after leaving the form does not pull the user back', async () => {
  axios.get.mockResolvedValue({ data: profile });
  let finishSave;
  axios.put.mockImplementationOnce(() => new Promise(resolve => { finishSave = resolve; }));
  openForm();
  await screen.findByLabelText('Bio');
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  fireEvent.click(screen.getByRole('link', { name: 'About' }));
  expect(await screen.findByRole('heading', { name: 'About screen' })).toBeInTheDocument();
  await act(async () => finishSave({ data: profile }));
  expect(screen.getByRole('heading', { name: 'About screen' })).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'Profile screen' })).not.toBeInTheDocument();
});

test('a different signed-in profile cannot open owner editing controls', () => {
  auth.userId = 2;
  openForm();
  expect(screen.getByText('Only the profile owner can make changes.')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Save changes' })).not.toBeInTheDocument();
  expect(axios.get).not.toHaveBeenCalled();
  expect(screen.queryByText('Account settings')).not.toBeInTheDocument();
});

test('deletion is collapsed in account settings and disables profile saving while pending', async () => {
  axios.get.mockResolvedValue({ data: profile });
  let finish;
  auth.deleteProfile.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
  openForm();
  await screen.findByLabelText('Bio');
  expect(screen.getByText('Account settings').closest('details')).not.toHaveAttribute('open');
  fireEvent.click(screen.getByText('Account settings'));
  fireEvent.click(screen.getByRole('button', { name: 'Delete profile' }));
  expect(auth.deleteProfile).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Delete permanently' }));
  expect(screen.getByLabelText('Bio')).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled();
  await act(async () => finish({ applied: true }));
  expect(await screen.findByRole('heading', { name: 'People screen' })).toBeInTheDocument();
  expect(auth.deleteProfile).toHaveBeenCalledWith('1');
});
