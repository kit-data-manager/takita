import React from 'react';
import { useQuill } from 'react-quilljs';
import 'quill/dist/quill.snow.css';

export const Editor = () => {
  const { quill, quillRef } = useQuill();

  return (
    <div style={{ width: 600, height: 400 }}>
      <div ref={quillRef} />
    </div>
  );
};

export default Editor;
