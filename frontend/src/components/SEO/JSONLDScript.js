import React from 'react';
import { Helmet } from 'react-helmet-async';

const JSONLDScript = React.memo(({ data }) => {
  if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
    return null;
  }

  try {
    const jsonString = JSON.stringify(data);
    
    return (
      <Helmet>
        <script type="application/ld+json">
          {jsonString}
        </script>
      </Helmet>
    );
  } catch (error) {
    console.error('Error serializing JSON-LD data:', error);
    return null;
  }
});

JSONLDScript.displayName = 'JSONLDScript';

export default JSONLDScript;