import React from 'react';
import { nodes, sales } from "../graph";
import { Link } from "react-router-dom";

class Nodes extends React.Component {
  public render() {

    const allNodes = Object.entries(nodes).sort((a, b) => {
      return (b[1].wins?.length || 0) - (a[1].wins?.length || 0);
    }).map(n => {
      let allWins = "";
      if(n[1].wins !== undefined && n[1].wins.length > 0) {
        allWins = " a gagné les enchères: " + n[1].wins.map(w => sales[w].Name + "(" + sales[w].Date + ")").join(",");
      }
      return (
        <li key={n[0]}>
          <Link to={"/people/" + n[0]}>{n[0]} -- {n[1].name} -- {allWins}</Link>
        </li>)
    });

    let tmp1: { [key: string]: number } = { "pas de travail connu": 0 };
    let tmp2: { [key: string]: number } = { "pas d'office connu": 0 };
    for(const id in nodes) {
      const n = nodes[id];
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
    }

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