import React from 'react';
import { IconButton } from '../button';
import { Icon } from '../icon';
import { Input } from '../formElement';

export const MetadataForm = (props) => {
  const { data, setData } = props;

  const onChangeAnnotator = (ev) => {
    setData({...data, annotator: ev.target.value});
  };
  const onChangeProject = (ev) => {
    setData({...data, project: ev.target.value});
  };
  const onChangeDocTitle = (ev) => {
    setData({...data, doc_title: ev.target.value});
  };
  const onChangeDocReference = (ev) => {
    setData({...data, doc_reference: ev.target.value});
  };

  return (
    <div className='Metadata'>
      <h2>Metadata</h2>
      
      <div className='user-metadata'>
        <h3>Annotator</h3>
        <IconButton>
          <Icon glyph='question' />
        </IconButton>

        <Input
          type='text'
          id='annotator'
          name='annotator'
          placeholder='Last name, First name'
          value={data.annotator}
          onChange={onChangeAnnotator}
        >
          Annotator
        </Input>
        <Input
          type='text'
          id='project'
          name='project'
          placeholder='(e.g. B01)'
          value={data.project}
          onChange={onChangeProject}
        >
          Project
        </Input>
      </div>
      <div className='text-metadata'>
        <h3>Document</h3>
        <Input
          type='text'
          id='doc_title'
          name='doc_title'
          placeholder='Title'
          value={data.doc_title}
          onChange={onChangeDocTitle}
        >
          Title
        </Input>
        <Input
          type='text'
          id='doc_reference'
          name='doc_reference'
          placeholder='e.g. Page & Line Number'
          value={data.doc_reference}
          onChange={onChangeDocReference}
        >
          Reference
        </Input>
      </div>
    </div>
  );
};

export default MetadataForm;
