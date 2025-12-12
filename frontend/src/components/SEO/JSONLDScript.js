import React from 'react';
import { Helmet } from 'react-helmet-async';

const JSONLDScript = React.memo(({ data }) => {
  if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
    return null;
  }

  // Serialize JSON outside of JSX to avoid try/catch around JSX
  let jsonString;
  try {
    jsonString = JSON.stringify(data);
  } catch (error) {
    console.error('Error serializing JSON-LD data:', error);
    return null;
  }
  
  return (
    <Helmet>
      <script type="application/ld+json">
        {jsonString}
      </script>
    </Helmet>
  );
});

JSONLDScript.displayName = 'JSONLDScript';

export default JSONLDScript;