import React from 'react';
import ReactDOM from 'react-dom/client';
import { Neo4jProvider, createDriver } from 'use-neo4j'
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const host = process.env.REACT_APP_IFC_NEO4J_HOST || 'localhost'
const user = process.env.REACT_APP_IFC_NEO4J_USER || 'neo4j'
const password = process.env.REACT_APP_IFC_NEO4J_PASSWORD || '123'

const driver = createDriver('neo4j', host, 7687, user, password)

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
