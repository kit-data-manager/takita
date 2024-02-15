import React from 'react';

const Toolbar = (_props) => {
  return (
    <div className='toolbar' id='toolbar'>
      <button className='ql-mrw-indirect'>MRW (indirect)</button>
      <button className='ql-mrw-direct'>MRW (direct)</button>
      <button className='ql-mrw-implicit'>MRW (implicit)</button>
      <button className='ql-mrw-mflag'>MFlag</button>
    </div>
  );
};

export default Toolbar;
