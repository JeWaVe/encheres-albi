import { nodes, sales, IJob, IPeopleDesc, IOffice } from "../graph";
import React from 'react';

class Stats extends React.Component {
    allWinners: IPeopleDesc[] = [];

    public render() {
        this.extract();
        const winnersELements = this.allWinners.map(w => this.Guy(w));
        return <div><div>
            ATTENTION : ce n'est pas du tout fini !!
            </div><div>
            Les gagnants d'enchères sont :
            <ul>
                {winnersELements}
            </ul>
        </div></div>;

    }

    public Guy(p: IPeopleDesc) {
        const allJobs = p.job.map((j: IJob, i: number) => <span>{j.Name} : {j.Category}</span>);
        const allOffices = p.offices.map((j: IOffice, i: number) => <span>{j.Name} : {j.Category}</span>);
        return <li>
            {p.name} - {allOffices} - {allJobs}
        </li>;
    }

    public extract() {
        for (const sid in sales) {
            const sale = sales[sid];
            var winners = sale.Bids[26].Bidders
            for(let i = 0; i < winners.length; ++i) {
                this.allWinners.push(nodes[winners[i]]);
            }
        }
    }
}

export default Stats;