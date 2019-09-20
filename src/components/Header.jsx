import { Link } from 'gatsby';
import PropTypes from 'prop-types';
import React from 'react';
import { Heading, useTheme } from '@chakra-ui/core';

const Header = ({ siteTitle }) => {
  const theme = useTheme();

  return (
    <header
      style={{
        backgroundColor: theme.colors.gray[50],
        borderBottom: '1px solid',
        borderBottomColor: theme.colors.gray[200],
      }}
    >
      <Heading
        fontFamily="heading"
        as="h1"
        fontSize="6xl"
        letterSpacing={5}
        p={10}
        color="gray.700"
      >
        <Link to="/">{siteTitle}</Link>
      </Heading>
    </header>
  );
};

Header.propTypes = {
  siteTitle: PropTypes.string,
};

Header.defaultProps = {
  siteTitle: ``,
};

export default Header;
