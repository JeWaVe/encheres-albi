import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './index.css';
import App from './App';
import AllPeople from "./components/AllPeople";
import People from "./components/People";
import FullGraph from "./components/FullGraph";
import Header from "./Header";

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  //<React.StrictMode>
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="peoples" element={<AllPeople />} />
        <Route path="people/:id" element={<People />} />
        <Route path="fullgraph" element={<FullGraph />} />
      </Routes>
    </BrowserRouter>
  //</React.StrictMode>
);
