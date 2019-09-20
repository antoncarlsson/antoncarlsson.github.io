import React from 'react';
import { Link } from 'gatsby';
import { Box, Heading, Text } from '@chakra-ui/core';

import Layout from '../components/layout';
import SEO from '../components/seo';

const IndexPage = () => (
  <Layout>
    <SEO title="Home" />
    <Box justify="center">
      <Heading fontFamily="heading" color="gray.700" p={4}>
        Lorem ipsum
      </Heading>
      <Box
        rounded="lg"
        backgroundColor="gray.50"
        p={8}
        border="1px"
        borderColor="gray.200"
      >
        <Text>Lorem ipsum dolor sit amet.</Text>
      </Box>
    </Box>
  </Layout>
);

export default IndexPage;
