import React from 'react';
import { Heading, Text } from '@chakra-ui/core';

import Layout from '../components/layout';
import SEO from '../components/seo';

const NotFoundPage = () => (
  <Layout>
    <SEO title="404: Not found" />
    <Box justify="center">
      <Heading fontFamily="heading" color="gray.700" p={4}>
        NOT FOUND
      </Heading>
      <Box
        rounded="lg"
        backgroundColor="gray.50"
        p={8}
        border="1px"
        borderColor="gray.200"
      >
        <Text>You just hit a route that doesn&#39;t exist... the sadness.</Text>
      </Box>
    </Box>
  </Layout>
);

export default NotFoundPage;
