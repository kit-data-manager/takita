import { updateDisplay } from '.';
import * as data from '../data/annotations';

// Silence console.xxx() for the duration of these tests, so it does
// not spam our console
beforeEach(() => {
  console.error = jest.fn(() => {});
  console.log = jest.fn(() => {});
});
afterEach(() => {
  jest.clearAllMocks();
});

describe('updating the display by rendering the current annotations', () => {
  beforeEach(() => {
    window.ANNOJSON = undefined;
    jest.clearAllMocks();
  });
  it('successfully updates the display and store the current annotations in a variable', async () => {
    // TODO: remove the annotation table related requirement (the two divs and the creator from the
    // mockAnnoKson) after the display update is decoupled from the update of the annotation table
    document.body.innerHTML = `<div id="table"></div><div id="TEI"><div id="w.1"></div><div id="w.2"></div><div id="w.3"></div>
        <div id="w.4"></div><div id="w.5" class="defaulthighlight"></div></div>
        <div id="annotationTableBottom"></div>
        <div class="card card-body row-gap-2 invisible" id="annotationCard">`;
    const mockAnnoJson = [
      { id: '1', svg: ['id("w.1")', 'id("w.2")'], color: 'none', creator: 'test' },
      { id: '2', svg: ['id("w.3")', 'id("w.4")'], color: 'none', creator: 'test' },
    ];
    // mocking an inner funciton call, which does a network request, to be called successfully
    // and return the data
    jest.spyOn(data, 'getAllAnnotationsData').mockReturnValue(mockAnnoJson);

    await updateDisplay({});
    expect(window.ANNOJSON).toStrictEqual(mockAnnoJson);
    expect(document.getElementById('w.1').classList.contains('defaulthighlight')).toBe(true);
    expect(document.getElementById('w.2').classList.contains('defaulthighlight')).toBe(true);
    expect(document.getElementById('w.3').classList.contains('defaulthighlight')).toBe(true);
    expect(document.getElementById('w.4').classList.contains('defaulthighlight')).toBe(true);
    expect(document.getElementById('w.5').classList.contains('defaulthighlight')).toBe(false);
  });
  it('fails on updating the display', async () => {
    // mocking an inner funciton call, which does a network request, to be called unsuccessfully
    // and to throw an error, which gets handled
    jest.spyOn(data, 'getAllAnnotationsData').mockReturnValue(new Error());
    await updateDisplay({});
    expect(window.ANNOJSON).toStrictEqual(undefined);
  });
});
