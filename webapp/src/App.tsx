import React from 'react';
import './App.css';
import Header from "./Header";

class App extends React.Component {
  public render() {
    return (
      <main>
        <Header />
        <h2>hello app</h2>
      </main>
    );
  }
}

export default App;
