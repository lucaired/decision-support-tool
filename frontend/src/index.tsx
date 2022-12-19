import React from 'react';
import ReactDOM from 'react-dom/client';
import { Neo4jProvider, createDriver } from 'use-neo4j'
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const variantNeo4J = process.env.REACT_APP_VARIANT_NEO4J_URL || 'localhost'
const driver = createDriver('neo4j', variantNeo4J, 7687, 'neo4j', '123')
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
      <Neo4jProvider driver={driver}>
        <App />
      </Neo4jProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
