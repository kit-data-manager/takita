import React from 'react';
import { ColorCircle, ColorBar } from '../colorElements';

const Toolbar = (_props) => {
  return (
    <div className='toolbar' id='toolbar'>
      <button className='ql-mrw-candidate mrw-button'>
        <ColorBar color={'var(--mrw-candidate-bg-color)'} height={'100%'} />
        <span className='mrw-label'>MRW candidate</span>
      </button>
      <button className='ql-mrw-general mrw-button'>
        <ColorBar color={'var(--mrw-general-bg-color)'} height={'100%'} />
        <span className='mrw-label'>MRW</span>
      </button>
      <button className='ql-mrw-indirect mrw-button'>
        <ColorBar color={'var(--mrw-indirect-bg-color)'} height={'100%'} />
        <span className='mrw-label'>MRW (indirect)</span>
      </button>
      <button className='ql-mrw-direct mrw-button'>
        <ColorBar color={'var(--mrw-direct-bg-color)'} height={'100%'} />
        <span className='mrw-label'>MRW (direct)</span>
      </button>
      <button className='ql-mrw-implicit mrw-button'>
        <ColorBar color={'var(--mrw-implicit-bg-color)'} height={'100%'} />
        <span className='mrw-label'>MRW (implicit)</span>
      </button>
      <button className='ql-mrw-mflag mrw-button'>
        <ColorBar color={'var(--mrw-mflag-bg-color)'} height={'100%'} />
        <span className='mrw-label'>MFlag</span>
      </button>
    </div>
  );
};

export default Toolbar;
