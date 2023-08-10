import { useLocation, Link } from "react-router-dom";
import { nodes, links, sales, LinkType } from "../graph";

function People() {
    const path = useLocation().pathname.split('/');
    const id = parseInt(path[path.length - 1], 10);
    const node = nodes[id];
    const allJobs = node.job.map((j, i) => <li key={i}>{j.Name} : {j.Category}</li>);

    const allActions = links.filter(l => l.source === id)
         .map((l,i) => {
            let saleName = formatSale(l.saleId);
            let targetName = formatTarget(l.dest);
            
            switch(l.type) {
                case LinkType.Overbid:
                    return <li key={i}>a surenchéri sur {targetName} lors de l'enchère {saleName}</li>;
                case LinkType.CoOverbid:
                    return <li key={i}>a surenchéri avec {targetName} lors de l'enchère {saleName}</li>;
                case LinkType.TakeOver:
                    return <li key={i}>a pris l'enchère {saleName} sur {targetName}</li>;
                case LinkType.CoTakeOver:
                    return <li key={i}>a pris l'enchère {saleName} avec {targetName}</li>;
                case LinkType.WitnessOverbid:
                    return <li key={i}>a témoigné pour {targetName} lors de l'enchère {saleName}</li>;
                case LinkType.CoWitnessOverbid:
                    return <li key={i}>a témoigné avec {targetName} lors de l'enchère {saleName}</li>;
                case LinkType.CoWitnessTake:
                    return <li key={i}>a témoigné avec {targetName} pour la prise de l'enchère {saleName}</li>;
                case LinkType.WitnessOpening:
                    return <li key={i}>a témoigné pour {targetName} pour l'ouverture de l'enchère {saleName}</li>;
                case LinkType.CoWitnessOpening:
                    return <li key={i}>a témoigné avec {targetName} pour l'ouverture' de l'enchère {saleName}</li>;
                case LinkType.WitnessTake:
                    return <li key={i}>a témoigné pour {targetName} pour la prise de l'enchère {saleName}</li>;
                case LinkType.CoOpen:
                    return <li key={i}>a ouvert avec {targetName} lors de l'enchère {saleName}</li>;
                default:
                    console.log(l.type);
            }

            return "";
    });

    return <div>
        <p>{node.name} - {node.office?.Name} ({node.office?.Category})</p>
        <ul>
            {allJobs}
        </ul>
        <ul>
            {allActions}
        </ul>
    </div>
}

function formatSale(saleId: number) {
    const sale = sales[saleId];
    return sale.Name + "(" + sale.Date + ")";
}

function formatTarget(nodeId: number) {
    return (<Link to={"/people/" + nodeId}>{nodeId} -- {nodes[nodeId].name}</Link>);
}

export default People;