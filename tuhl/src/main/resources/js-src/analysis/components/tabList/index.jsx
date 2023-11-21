import React from 'react';

import { Button } from '../button';
import { StyledTab, StyledTabList } from './style';

export const Tab = ({to, children, ...props}) => {
  return (
    <StyledTab>
      <Button to={to} className='tab'>
        {children || 'button-label'}
      </Button>
    </StyledTab>
  );
};

export const TabList = ({ tabs }) => {
  return (
    <StyledTabList>
      { 
        tabs.map(([label, route], idx) => <Tab key={idx} to={route}>{label}</Tab>)
      }
    </StyledTabList>
  );
};
