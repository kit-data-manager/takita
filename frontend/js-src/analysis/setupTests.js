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

// testing the selection requires an xml file to be
// appended to the DOM by CETEIcean, which needs the TextEncoder
// textSelection.test
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// jsdom provides a better functioning dom than the default one
// import { JSDOM } from 'jsdom';
// const dom = new JSDOM();
// global.document = dom.window.document;
// global.window = dom.window;
