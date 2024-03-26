// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// some textEditor functions need jquery
// highlight.test
import $ from 'jquery';
global.$ = $;
global.jQuery = $;
// and the metadataeditor
// doesnt work, destroys jquery for everyoneimport './../common/utils/metadataeditor';
