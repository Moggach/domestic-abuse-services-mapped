'use client';

import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function ApiDocsPage() {
  return (
    <main style={{ padding: '2rem' }}>
      <SwaggerUI url="/api/swagger" />
    </main>
  );
}
