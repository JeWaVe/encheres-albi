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
    name: string;
    job: (never | IJob)[];
    office: null | IOffice;
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

const nodes: {[id: number] : IPeopleDesc } = n;

function make_sales() {
    let result: {[id: number] : ISale } = {};
    let id = 0;
    s.forEach(s => {
        result[id++] = s;
    });
    return result;
}

const sales: { [id: number] : ISale } = make_sales();

export enum LinkType {
    CoOpen,
    WitnessOpening,
    CoWitnessOpening,
    Overbid,
    WitnessOverbid,
    CoWitnessOverbid,
    TakeOver,
    CoTakeOver,
    WitnessTake,
    CoWitnessTake,
    // InstrumentOver,
    // CoInstrumentOver,
    // WitnessInstrument,
    // CoWitnessInstrument,
    // CancellationOver,
    // CoCancellationOver,
    // WitnessCancellation,
    // CoWitnessCancellation,
}

export interface ILink {
    source: number;
    dest: number;
    type: LinkType;
    saleId: number;
}

function make_co_links(
        saleId: number, 
        result: ILink[], 
        linkType: LinkType,
        sources: number[], 
        dests: number[] = sources, 
    ) {
    sources.forEach(s => {
        dests.forEach(d => {
            if (sources == dests || s != d) {
                result.push({
                    dest: d,
                    source: s, 
                    saleId: saleId,
                    type: linkType
                })
            }
        });
    });
}

const links: ILink[] = (function make_links() : ILink[] {
    var result: ILink[] = [];
    for(const sid in sales) {
        const saleId = parseInt(sid, 10);
        var sale = sales[saleId];
        sale.Bids.forEach(b => {
            let lastBidders: number[] = [];
            switch(b.Name) {
                case "O":
                    {                    
                        const openers = b.Bidders;
                        make_co_links(saleId, result, LinkType.CoOpen, openers);
                        lastBidders = b.Bidders;
                    }
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
                case "E 11":
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
                case "T 11":
                case "T N":
                    {
                        const witnesses = b.Bidders;
                        make_co_links(saleId, result, LinkType.CoWitnessOverbid, witnesses);
                        make_co_links(saleId, result, LinkType.WitnessOverbid, witnesses, lastBidders);
                    }
                    break;
                case "P 1 (remise de ferme)":
                    {
                        const takers = b.Bidders;
                        make_co_links(saleId, result, LinkType.CoTakeOver, takers);
                        make_co_links(saleId, result, LinkType.TakeOver, lastBidders);
                        lastBidders = takers;
                    }
                    break;
                case "T P1":
                    {
                        const witnesses = b.Bidders;
                        make_co_links(saleId, result, LinkType.WitnessTake, witnesses, lastBidders);
                        make_co_links(saleId, result, LinkType.CoWitnessTake, witnesses);
                    }
                    break;
                default:
                    break;
            };
        });
    }
    return result;
})();



export { sales, nodes, links};