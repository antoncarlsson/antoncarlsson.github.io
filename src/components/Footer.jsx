import React from 'react';
import { useTheme } from '@chakra-ui/core';

const Footer = () => {
  const theme = useTheme();
  console.log(theme);

  return (
    <footer
      style={{
        backgroundColor: theme.colors.gray[50],
        borderTop: '1px solid',
        borderTopColor: theme.colors.gray[200],
      }}
    />
  );
};

export default Footer;
