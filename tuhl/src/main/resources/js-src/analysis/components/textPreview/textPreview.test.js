import React from 'react';
import { unmountComponentAtNode } from 'react-dom';
import { render, screen } from '@testing-library/react';

import { TextPreview } from './textPreview';


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

it('needs at least a text prop', () => {
  // Silence console.error() for the duration of this test, so it does
  // not spam our console during the error handling which we are
  // expecting anyway. ;)
  jest.spyOn(console, 'error');
  console.error.mockImplementation(() => {});

  expect(() => render(<TextPreview />, container))
    .toThrow();

  console.error.mockRestore();
});

it('can render text without MRW', () => {
  render(<TextPreview text='hello' />, container);
  expect(screen.getByText('hello')).toBeInTheDocument();
});

it('can render with one MRW', () => {
  const text = 'hello world!';
  const mrws = [{text:'world'}];
  render(<TextPreview text={text} mrws={mrws} />, container);
  // This should be somewhere in the the output.
  expect(screen.getByText('hello', {exact: false})).toBeInTheDocument();
  // This should be in its own node somewhere in the output.
  expect(screen.getByText('world')).toBeInTheDocument();
});

it('can render with multiple MRWs', () => {
  const text = 'hello dear world!';
  const mrws = [{ text: 'dear' }, { text: 'world' }];
  render(<TextPreview text={text} mrws={mrws} />, container);
  expect(screen.getByText('hello', {exact: false})).toBeInTheDocument();
  // This should be in its own node somewhere in the output.
  expect(screen.getByText('world')).toBeInTheDocument();
  expect(screen.getByText('dear')).toBeInTheDocument();
});