import React from 'react';
import { graph } from "../graph";
import Header from "../Header";
import { Link } from "react-router-dom";

class Nodes extends React.Component {
  public render() {
    const allNodes = graph.nodes.sort((a,b) => a.id - b.id).map(n => {
      return (
        <li key={n.id.toString(10)}>
          <Link to={"/people/" + n.id}>{n.id} -- {n.name}</Link>
        </li>)
    });

    let tmp1: { [key: string]: number } = { "pas de travail connu": 0 };
    let tmp2: { [key: string]: number } = { "pas d'office connu": 0 };
    graph.nodes.forEach(n => {
      const oName = n.office?.Name;
      if (!oName) {
        tmp2["pas d'office connu"] += 1;
      }
      else {
        if (!tmp2.hasOwnProperty(oName)) {
          tmp2[oName] = 0;
        }
        tmp2[oName] += 1;
      };
      n.job.forEach(j => {
        if (!tmp1.hasOwnProperty(j.Category)) {
          tmp1[j.Category] = 0;
        }
        tmp1[j.Category] += 1;
      });
      if (n.job.length === 0) {
        tmp1["pas de travail connu"] += 1;
      }
    });

    const jobCategories = Object.entries(tmp1).sort((a,b) => b[1] - a[1]).map(kvp => {
      return (<li key={kvp[0]}>
        <div>
          {kvp[0]} : {kvp[1] + " vrais mecs"}
        </div>
      </li>);
    });

    const officeCategories = Object.entries(tmp2).sort((a,b) => b[1] - a[1]).map(kvp => {
      return (<li key={kvp[0]}>
        <div>
          {kvp[0]} : {kvp[1] + " vrais mecs"}
        </div>
      </li>);
    });

    return (
      <main>
        <Header />
        <p>Catégories de métiers</p>
          <ul>{jobCategories}</ul>
        <div>Catégories d'offices</div>
          <ul>{officeCategories}</ul>
        <div>Tout le monde</div>
        <ul>{allNodes}</ul>
      </main >
    );
  }
}

export default Nodes;