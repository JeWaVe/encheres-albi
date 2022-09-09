import n from "./data/nodes.json";
import s from "./data/converted_data.json";

export interface IJob {
    Code: string;
    Name: string;
    Color: string;
    Category: string;
}

export interface IOffice {
    Rank: number;
    Code: string;
    Name: string;
    Color: string;
    Category: string;
}

export interface IPeopleDesc {
    id: number;
    name: string;
    job: (never | IJob)[];
    office: null | IOffice;
    outlinks?: number;
    inlinks?: number;
    wins?: number[];
}

export interface IBid {
    Name: string;
    Bidders: number[];
}

export interface ISale {
    Date: number;
    Name: string;
    Bids: IBid[];
}

let nodes: {[id: number] : IPeopleDesc } = n;

function makeSales() {
    let result: {[id: number] : ISale } = {};
    let id = 0;
    s.forEach(s => {
        result[id++] = s;
    });
    return result;
}

function populateNodesWithLinks() {
    for(const link of links) {
        let source = nodes[link.source];
        if(source !== undefined) {
            if(source.outlinks === undefined) {
                source.outlinks = 0;
            }
            source.outlinks += 1;
        }
        let dest = nodes[link.dest];
        if(dest !== undefined) {
            if(dest.inlinks === undefined) {
                dest.inlinks = 0;
            }
            dest.inlinks += 1;
        }
    }
}

const sales: { [id: number] : ISale } = makeSales();

export const LinkType: {[key: string]: number; } = {
    "CoOpen": 0,
    "WitnessOpening": 1,
    "CoWitnessOpening": 2,
    "Overbid": 3,
    "WitnessOverbid": 4,
    "CoWitnessOverbid": 5,
    "TakeOver": 6,
    "CoTakeOver": 7,
    "WitnessTake": 8,
    "CoWitnessTake": 9
}

export interface ILink {
    source: number;
    dest: number;
    type: number; // LinkType
    saleId: number;
}

function make_co_links(
        saleId: number, 
        result: ILink[], 
        linkType: number, // LinkType
        sources: number[], 
        dests: number[] = sources, 
    ) {
    sources.forEach(s => {
        dests.forEach(d => {
            if (s !== d) {
                result.push({
                    dest: d,
                    source: s, 
                    saleId: saleId,
                    type: linkType
                });
            }
        });
    });
}

function removeEmptyNodes() {
    for(const key in nodes) {
        const node = nodes[key];
        if((node.outlinks === undefined || node.outlinks === 0) && (node.inlinks === undefined || node.inlinks === 0)) {
            delete nodes[key];
        }
    }
}

const links: ILink[] = (function make_links() : ILink[] {
    var result: ILink[] = [];
    for(const sid in sales) {
        const saleId = parseInt(sid, 10);
        var sale = sales[saleId];
        let lastBidders: number[] = [];
        let winners: number[] = [];
        let winWitnesses: number[] = [];
        let instrument: number[] = [];
        let instrumentWitnesses: number[] = [];
        sale.Bids.forEach(b => {
            switch(b.Name.trim()) {
                case "O":
                    break;
                case "T O":
                    {
                        const openers = lastBidders;
                        const witnesses = b.Bidders;
                        make_co_links(saleId, result, LinkType.WitnessOpening, witnesses, openers);
                        make_co_links(saleId, result, LinkType.CoWitnessOpening, witnesses);
                    }
                    break;
                case "E 1":
                case "E 2":
                case "E 3":
                case "E 4":
                case "E 5":
                case "E 6":
                case "E 7":
                case "E 8":
                case "E 9":
                case "E 10":
                case "E11":
                case "E N":
                    {
                        const bidders = b.Bidders;
                        make_co_links(saleId, result, LinkType.CoWitnessOverbid, bidders);
                        make_co_links(saleId, result, LinkType.Overbid, bidders, lastBidders);
                        lastBidders = bidders;
                    }
                    break;
                case "T 1":
                case "T 2":
                case "T 3":
                case "T 4":
                case "T 5":
                case "T 6":
                case "T 7":
                case "T 8":
                case "T 9":
                case "T 10":
                case "T11":
                case "T N":
                    {
                        const witnesses = b.Bidders;
                        make_co_links(saleId, result, LinkType.CoWitnessOverbid, witnesses);
                        make_co_links(saleId, result, LinkType.WitnessOverbid, witnesses, lastBidders);
                    }
                    break;
                case "P 1 (remise de ferme)":
                    winners = b.Bidders;
                    break;
                case "P 2 (instrument)":
                    instrument = b.Bidders;
                    break;
                case "T P1":
                    winWitnesses = b.Bidders;
                    break;
                case "T P2":
                    instrumentWitnesses = b.Bidders;
                    break;
                case "P 3 (cancellation)":
                case "T P3":
                    break;
                default:
                    throw new Error("invalid sale");
            }
        });
        
        // check that with Xavier - should we drop win witnesses in case of instrument
        if(instrument.length > 0) {
            winners = instrument;
            winWitnesses = instrumentWitnesses;
        }
        winners.forEach(w => {
            let guy = nodes[w];
            if(guy.wins === undefined) {
                guy.wins = [];
            }
            guy.wins.push(saleId);
        });
        make_co_links(saleId, result, LinkType.CoWitnessTake, winWitnesses);
        make_co_links(saleId, result, LinkType.TakeOver, winners, lastBidders);
        make_co_links(saleId, result, LinkType.CoTakeOver, winners);
        make_co_links(saleId, result, LinkType.WitnessTake, winWitnesses, winners);
    }

    return result;
})();

populateNodesWithLinks();
removeEmptyNodes();

export { sales, nodes, links };