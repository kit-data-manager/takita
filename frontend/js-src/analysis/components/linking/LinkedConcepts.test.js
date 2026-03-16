import React from 'react';
import { unmountComponentAtNode } from 'react-dom';
import { render, screen } from '@testing-library/react';

import { DetailedConcept } from '../../data/models/appstate';

// SUT
import { LinkedConcepts } from './LinkedConcepts';

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

it('can render without concepts prop', () => {
  // Silence console.error() for the duration of this test, so it does
  // not spam our console during the error handling which we are
  // expecting anyway. ;)
  jest.spyOn(console, 'error');
  console.error.mockImplementation(() => {});

  expect(() => render(<LinkedConcepts />, container)).not.toThrow();

  console.error.mockRestore();
});

it('renders a single linked concept', () => {
  const c = {
    uri: 'http://example.com/c1',
    parentUri: 'http://example.com/c2',
    prefLabel: 'Example',
    parentLabel: 'Thing',
    notation: '1.2.3',
  };

  render(<LinkedConcepts concepts={[new DetailedConcept(c)]} />, container);
  expect(screen.getByTitle('Open Concept in Skosmos')).toBeInTheDocument();
  expect(screen.getByText(c.prefLabel)).toBeInTheDocument();
  expect(screen.getByText(c.prefLabel)).toHaveAttribute('href', c.uri);
  expect(screen.getByText(c.parentLabel, { exact: false })).toBeInTheDocument();
});

it('renders multiple linked concepts', () => {
  const cs = [
    {
      uri: 'http://example.com/c1',
      parentUri: 'http://example.com/c2',
      prefLabel: 'Example',
      parentLabel: 'Thing',
      notation: '1.2.3',
    },
    {
      uri: 'http://example.com/c3',
      parentUri: 'http://example.com/c4',
      prefLabel: 'Another',
      parentLabel: 'Entity',
      notation: '4.5.6',
    },
  ];

  render(<LinkedConcepts concepts={cs.map(c => new DetailedConcept(c))} />, container);
  expect(screen.getAllByTitle('Open Concept in Skosmos')).toHaveLength(2);
  // first item
  expect(screen.getByText(cs[0].prefLabel)).toBeInTheDocument();
  expect(screen.getByText(cs[0].prefLabel)).toHaveAttribute('href', cs[0].uri);
  expect(screen.getByText(cs[0].parentLabel, { exact: false })).toBeInTheDocument();
  // second item
  expect(screen.getByText(cs[1].prefLabel)).toBeInTheDocument();
  expect(screen.getByText(cs[1].prefLabel)).toHaveAttribute('href', cs[1].uri);
  expect(screen.getByText(cs[1].parentLabel, { exact: false })).toBeInTheDocument();
});
