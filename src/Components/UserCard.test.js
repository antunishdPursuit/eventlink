import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, test, vi } from 'vitest';
import UserCard from './UserCard';

const auth = vi.hoisted(() => ({ userId: 1 }));
vi.mock('../AuthContext', () => ({ useAuth: () => auth }));
const user = { id: 1, username: 'test-person', profile_picture: 'https://example.com/avatar.jpg', bio: 'A real profile', looking_for_group: true, date_created: '2023-08-01' };

test('real profile facts do not present an unavailable event count as zero', () => {
  const view = render(<MemoryRouter><UserCard user={user} id="1" savedCount={null} /></MemoryRouter>);
  expect(screen.getByLabelText('Saved event count unavailable')).toHaveTextContent('—');
  view.rerender(<MemoryRouter><UserCard user={user} id="1" savedCount={0} /></MemoryRouter>);
  expect(screen.queryByLabelText('Saved event count unavailable')).not.toBeInTheDocument();
  expect(screen.getByText('0')).toBeInTheDocument();
  expect(screen.getByText('Yes')).toBeInTheDocument();
  expect(screen.getByText('August 1, 2023')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Edit profile' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Delete profile' })).not.toBeInTheDocument();
});

test('a visitor cannot see another profile owner controls', () => {
  auth.userId = 2;
  render(<MemoryRouter><UserCard user={user} id="1" savedCount={3} /></MemoryRouter>);
  expect(screen.queryByRole('link', { name: 'Edit profile' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Delete profile' })).not.toBeInTheDocument();
  auth.userId = 1;
});
