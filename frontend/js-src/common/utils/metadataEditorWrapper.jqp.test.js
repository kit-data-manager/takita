import { useJQueryPlugin } from './metadataEditorWrapper';

describe('dummy test suite for import and usage of jsonform', () => {
  it('can use $ without access to the global document and/or window in the function', () => {
    const node = document.createElement('div', { class: 'test-node' });
    node.appendChild(document.createTextNode('dummy div'));
    const obj = useJQueryPlugin(node);
    expect(obj).toBeDefined();
    expect(obj.jsonForm).toBeDefined();
  });

  it('can use the jsonform plugin functionality', () => {
    const node = document.createElement('div', { class: 'test-node' });
    node.appendChild(document.createTextNode('dummy div'));
    const obj = useJQueryPlugin(node);
    expect(obj.jsonForm).toBeDefined();
  });

  it('can use the metadataeditor plugin functionality', () => {
    const node = document.createElement('div', { class: 'test-node' });
    node.appendChild(document.createTextNode('dummy div'));
    const obj = useJQueryPlugin(node);
    expect(obj.metadataeditorTable).toBeDefined();
  });
});
