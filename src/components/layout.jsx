/**
 * Layout component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from 'react';
import PropTypes from 'prop-types';
import { useStaticQuery, graphql } from 'gatsby';
import { CSSReset, Grid, ThemeProvider, theme } from '@chakra-ui/core';

import Header from './Header';
import Footer from './Footer';
import 'typeface-montserrat';
import 'typeface-lato';

const customTheme = {
  ...theme,
  fonts: {
    ...theme.fonts,
    body: 'Lato, sans-serif',
    heading: 'Montserrat, sans-serif',
  },
};

const Layout = ({ children }) => {
  const data = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `);

  return (
    <ThemeProvider theme={customTheme}>
      <CSSReset />
      <Grid
        h="100vh"
        templateAreas="'header' 'content' 'footer'"
        templateRows="150px auto 100px"
        fontFamily="body"
      >
        <Grid area="header">
          <Header siteTitle={data.site.siteMetadata.title} />
        </Grid>
        <Grid w="100%" area="content" p={16}>
          <main>{children}</main>
        </Grid>
        <Grid area="footer">
          <Footer />
        </Grid>
      </Grid>
    </ThemeProvider>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
