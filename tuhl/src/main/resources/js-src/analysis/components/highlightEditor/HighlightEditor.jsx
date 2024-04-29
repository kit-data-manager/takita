import React from 'react';
import ReactQuill, { Quill } from 'react-quill';
//import 'react-quill/dist/quill.snow.css';

import Toolbar from './Toolbar';

const Inline = Quill.import('blots/inline');

class MRWCandidateBlot extends Inline {
  static blotName = 'mrw-candidate';
  static className = 'mrw-candidate';
  static tagName = 'span';

  static formats() {
    return true;
  }
}

class MRWGeneralBlot extends Inline {
  static blotName = 'mrw-general';
  static className = 'mrw-general';
  static tagName = 'span';

  static formats() {
    return true;
  }
}

class MRWDirectBlot extends Inline {
  static blotName = 'mrw-direct';
  static className = 'mrw-direct';
  static tagName = 'span';

  static formats() {
    return true;
  }
}

class MRWIndirectBlot extends Inline {
  static blotName = 'mrw-indirect';
  static className = 'mrw-indirect';
  static tagName = 'span';

  static formats() {
    return true;
  }
}

class MRWImplicitBlot extends Inline {
  static blotName = 'mrw-implicit';
  static className = 'mrw-implicit';
  static tagName = 'span';

  static formats() {
    return true;
  }
}

class MRWMFlagBlot extends Inline {
  static blotName = 'mrw-mflag';
  static className = 'mrw-mflag';
  static tagName = 'span';

  static formats() {
    return true;
  }
}

Quill.register(MRWCandidateBlot);
Quill.register(MRWGeneralBlot);
Quill.register(MRWDirectBlot);
Quill.register(MRWImplicitBlot);
Quill.register(MRWIndirectBlot);
Quill.register(MRWMFlagBlot);

function HighlightEditor({ text, setText, readOnly }) {
  const mods = readOnly ? { toolbar: false } : { toolbar: { container: '#toolbar' } };

  return (
    <div className='text-editor'>
      {!readOnly && <Toolbar />}
      <ReactQuill
        placeholder='Note down ad-hoc translations to aid in the analysis'
        theme='snow'
        value={text}
        onChange={setText}
        readOnly={readOnly}
        modules={mods}
        formats={['mrw-candidate', 'mrw-general', 'mrw-direct', 'mrw-indirect', 'mrw-implicit', 'mrw-mflag']}
      />
    </div>
  );
}

export default HighlightEditor;
