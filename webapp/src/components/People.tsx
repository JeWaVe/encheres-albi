import React from "react";
import { useLocation } from "react-router-dom";
import { nodes } from "../graph";

function People() {
    const path = useLocation().pathname.split('/');
    const id = parseInt(path[path.length - 1], 10);
    const node = nodes[id];
    const allJobs = node.job.map((j, i) => <li key={i}>{j.Name} : {j.Category}</li>);
    
    return <div>
        <p>{node.name} - {node.office?.Name} ({node.office?.Category})</p>
        <ul>
            {allJobs}
        </ul>
    </div>
}

export default People;