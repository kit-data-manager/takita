import { encodeAnnoId, toggleOverview, toggleExpand } from './utils';

describe('encoding the id of an annotation', () => {
  it('encodes the id of an annotation twice', () => {
    let annoId = 'https://server.com:9999/wap/test/takita/f0569811c51f';
    const result = encodeAnnoId(annoId);
    expect(result).toBe('https%253A%252F%252Fserver.com%253A9999%252Fwap%252Ftest%252Ftakita%252Ff0569811c51f');
  });
});

const innerHTML =
  '<div class="card">' +
  '<div class="row is-full-width" id="divId">' +
  '<div class="is-left col formBodyDiv">' +
  '<div id="iconRow1">' +
  '<i id="expand1" class="bx bx-chevron-right"></i>' +
  '<i id="delete1" class="bx bx-trash"></i>' +
  '</div>' +
  '</div>' +
  '</div>' +
  '<div class="row is-full-width is-hidden"  id="test"></div>' +
  '</div>';

describe('expanding/collapsing a div-element', () => {
  it.skip('expands a collapsed div', () => {
    // setup the document
    document.body.innerHTML = innerHTML;
    const div = document.getElementById('test');
    const expandIcon = document.getElementById('expand1');
    // mocking a collapsed div
    div.classList.add('is-hidden');
    expandIcon.classList.add('bx-chevron-right');
    toggleExpand(div);
    const result = [expandIcon.classList.contains('bx-chevron-down'), div.classList.contains('is-hidden')];
    expect(result).toEqual([true, false]);
  });

  it.skip('collapses an expanded div', () => {
    // setup the document
    document.body.innerHTML = innerHTML;
    const div = document.getElementById('divId');
    const expandIcon = document.getElementById('expand1');
    toggleExpand(div);
    const result = [expandIcon.classList.contains('bx-chevron-right'), div.classList.contains('is-hidden')];
    expect(result).toEqual([true, true]);
  });
});

const innerHTMLOverview =
  '<body>' +
  '<li class="features-item star">' +
  '<i id="pagesButton" class="bx bx-book-open features-item-icon"></i>' +
  '</li>' +
  '<div class="collapse col-auto is-hidden is-full-width" id="pages"></div>' +
  '</body>';

const innerHTMLOverviewShown =
  '<body>' +
  '<li class="features-item star active">' +
  '<i id="pagesButton" class="bx bx-book-open features-item-icon"></i>' +
  '</li>' +
  '<div class="collapse col-auto is-full-width" id="pages"></div>' +
  '</body>';

describe('showing/hiding a div-element', () => {
  it('shows a hidden div', () => {
    // mocking "scrollIntoView" as its not implemented ind jsdom see:
    // https://github.com/jsdom/jsdom/issues/1695
    Element.prototype.scrollIntoView = jest.fn();
    // setup the document
    document.body.innerHTML = innerHTMLOverview;
    const div = document.getElementById('pages');
    const button = document.getElementById('pagesButton');
    toggleOverview(div.id);
    const result = [button.parentElement.classList.contains('active'), div.classList.contains('is-hidden')];
    expect(result).toEqual([true, false]);
  });
  it('hides div', () => {
    // setup the document
    document.body.innerHTML = innerHTMLOverviewShown;
    const div = document.getElementById('pages');
    const button = document.getElementById('pagesButton');
    toggleOverview(div.id);
    const result = [button.parentElement.classList.contains('active'), div.classList.contains('is-hidden')];
    expect(result).toEqual([false, true]);
  });
});
