import React from 'react';
import ReactDOM from 'react-dom';
import 'mapbox-gl/dist/mapbox-gl.css';
import './index.css';
import App from './App';
// Initialize Sentry
import * as Sentry from "@sentry/react";
Sentry.init({
  dsn: "https://534dd982fc94e447103a45e48ea6aabc@o4507278828503040.ingest.de.sentry.io/4507278829813840",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of the transactions
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
  // Session Replay
  replaysSessionSampleRate: 0.1, // Sample rate at 10%
  replaysOnErrorSampleRate: 1.0, // Sample rate at 100% when sampling sessions where errors occur
});

// Find the root element
const container = document.getElementById("root");
// Create a root.
const root = ReactDOM.createRoot(container); // Create a root.
// Render the App component
root.render(<App />);