import React from 'react';
import { unmountComponentAtNode } from 'react-dom';
import { render, screen } from '@testing-library/react';

import SummaryBox from './SummaryBox';


let container = null;
let analysis = null;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  analysis = {
    getComment: () => '',
    getMappingTables: () => [],
    getMappingTableAt: () => [],
    getText: () => 'text',
  };
});

afterEach(() => {
  unmountComponentAtNode(container);
  container.remove();
  container = null;
  analysis = null;
});

it('renders without analysis prop', () => {
  render(<SummaryBox />, container);
  expect(container.textContent).toBe('');
});

it('renders comment', () => {
  analysis.getComment = () => 'a comment';
  render(<SummaryBox showComments analysis={analysis}/>, container);
  expect(screen.getByText('a comment')).toBeInTheDocument();
});

it('renders placeholder when there is no comment', () => {
  render(<SummaryBox showComments analysis={analysis} />, container);
  expect(screen.getByText('no comments')).toBeInTheDocument();
});

it('renders text summary', () => {
  render(<SummaryBox showText analysis={analysis} />, container);
  expect(screen.getByText('text')).toBeInTheDocument();
});

it('renders mapping summary', () => {
  analysis.getMappingTables = () => {
    return [[{source: {value: 'blabla', step: 'open'}, target: {value: 'blublu', step:'complete'}}]];
  };
  analysis.getMappingTableAt = () => {
    return [{source: {value: 'blabla', step: 'open'}, target: {value: 'blublu', step:'complete'}}];
  };
  render(<SummaryBox showMappings analysis={analysis} />, container);
  expect(screen.getByText('blublu')).toBeInTheDocument();
  expect(screen.getByText('blabla')).toBeInTheDocument();
});