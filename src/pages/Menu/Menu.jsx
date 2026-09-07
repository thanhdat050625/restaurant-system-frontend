import React from 'react';
import PageWrapper from '../../layouts/PageWrapper';
import ParallaxMenu from './components/ParallaxMenu';

const Menu = () => {
  return (
    <PageWrapper>
      {/* 
        ParallaxMenu handles its own full-screen layout.
        We wrap it in a container that ensures it sits below the navbar
        but covers the rest of the screen.
      */}
      <div className="absolute inset-0 z-40 bg-black pt-16 sm:pt-20">
        <ParallaxMenu />
      </div>
    </PageWrapper>
  );
};

export default Menu;
