import { getTargetFragment, getTargetAnnotationId } from './url';

describe('retrieving fragment from url', () => {
  it('retrieves fragment from url', () => {
    const result = getTargetFragment(
      'http://localhost:8181/editor/9f?annotationId=http%3A%2F%2Flocalhost%2Fwap%2Fsfb1475%2Fphilipp%2Ftakita%2Fc1225433-0678-4df7-8113-4fb27e1975f5&fragment=w.147',
    );
    expect(result).toBe('w.147');
  });

  it('tries to get the fragment from an url, but it is missing', () => {
    const result = getTargetAnnotationId('http://localhost:8181/editor/9f?');
    expect(result).toBe(null);
  });
});

describe('retrieving annotation ID from url', () => {
  it('retrieves annotation ID from url', () => {
    const result = getTargetAnnotationId(
      'http://localhost:8181/editor/9f?annotationId=http%3A%2F%2Flocalhost%2Fwap%2Fsfb1475%2Fphilipp%2Ftakita%2Fc1225433-0678-4df7-8113-4fb27e1975f5&fragment=w.147',
    );
    expect(result).toBe('http://localhost/wap/sfb1475/philipp/takita/c1225433-0678-4df7-8113-4fb27e1975f5');
  });

  it('tries to get the annotation ID from an url, but it is missing', () => {
    const result = getTargetAnnotationId('http://localhost:8181/editor/9f?');
    expect(result).toBe(null);
  });
});
