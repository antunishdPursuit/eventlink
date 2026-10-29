import { expect, test } from 'vitest';
import { accountDestination, accountLink } from './accountNavigation';

test.each(['https://evil.example/events', '//evil.example/events', '/signin', '/users/new', '/events/../signin', '/\\evil.example/events', 'javascript:alert(1)'])('unsafe or looping continuation %s stays within the account', destination => {
  const search = '?returnTo=' + encodeURIComponent(destination);
  expect(accountDestination(search, 7)).toBe('/users/7');
  expect(accountLink('/users/new', search)).toBe('/users/new');
});
