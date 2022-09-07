import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './index.css';
import App from './App';
import AllPeople from "./routes/AllPeople";
import People from "./routes/People";
import FullGraph from "./routes/FullGraph";

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="peoples" element={<AllPeople />} />
        <Route path="people/:id" element={<People />} />
        <Route path="fullgraph" element={<FullGraph />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
