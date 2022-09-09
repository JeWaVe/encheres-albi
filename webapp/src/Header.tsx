import React from 'react';
import { Link } from "react-router-dom";

class Header extends React.Component {
  public render() {
    return (
      <div>
        <h1>Enchères Albi</h1>
        <nav>
          <Link to="/">Accueil</Link> |{" "}
          <Link to="/peoples">Protagonistes</Link> |{" "}
          <Link to="/fullgraph">Graphique complet</Link> |{" "}
        </nav>
      </div>
    );
  }
}

export default Header;
