import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, test, vi } from 'vitest';
import UserNewForm from './UserNewForm';

vi.mock('../AuthContext', () => ({ useAuth: () => ({ setUserId: vi.fn() }) }));

test('a failed preview stops retrying and can be replaced', () => {
  render(<MemoryRouter><UserNewForm /></MemoryRouter>);
  const field = screen.getByLabelText('Profile picture URL');
  fireEvent.change(field, { target: { value: 'https://example.com/broken.jpg' } });
  fireEvent.error(screen.getByAltText('Preview'));
  expect(screen.queryByAltText('Preview')).not.toBeInTheDocument();
  expect(screen.getByText('Unable to load image preview.')).toBeInTheDocument();
  fireEvent.change(field, { target: { value: 'https://example.com/next.png' } });
  expect(screen.getByAltText('Preview')).toHaveAttribute('src', 'https://example.com/next.png');
  expect(screen.queryByText('Unable to load image preview.')).not.toBeInTheDocument();
});
