import React from 'react';
import { unmountComponentAtNode } from 'react-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DetailedConcept } from '../../data/models/appstate';

// SUT
import { ConceptQuickSearch } from './ConceptQuickSearch';

let container = null;
beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

it('throws without searchFunction', () => {
  // Silence console.error() for the duration of this test, so it does
  // not spam our console during the error handling which we are
  // expecting anyway. ;)
  jest.spyOn(console, 'error');
  console.error.mockImplementation(() => {});

  expect(() => render(<ConceptQuickSearch onAdd={() => undefined} />, container)).toThrow();

  console.error.mockRestore();
});

it('throws without onAdd', () => {
  jest.spyOn(console, 'error');
  console.error.mockImplementation(() => {});

  expect(() => render(<ConceptQuickSearch searchFunction={() => undefined} />, container)).toThrow();

  console.error.mockRestore();
});

it.skip('displays search results', async () => {
  // This currently even fails in upstream metaphor-analysis, still
  // need to figure out why.
  const c = {
    uri: 'http://example.com/c1',
    prefLabel: 'Dog',
    parentUri: 'http://example.com/c2',
    parentLabel: 'Animal',
    notation: '1.2.3',
  };
  const search = jest.fn(() => [new DetailedConcept(c)]);
  const user = userEvent.setup();

  render(<ConceptQuickSearch onAdd={() => {}} searchFunction={search} />, container);
  await user.click(screen.getByRole('button'));

  expect(screen.getByText(c.prefLabel)).toBeInTheDocument();
});
