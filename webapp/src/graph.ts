import g from "./data/full_graph.json";

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

export interface IPeople extends IPeopleDesc {
    id: number;
}

export interface ILink {
    source: number;
    target: number;
    label: number;
}

export interface IGraph {
    nodes: IPeople[],
    links: ILink[]
};

const graph: IGraph = g;

function make_map(gg: IGraph) {
    let result: { [id: number]: IPeopleDesc } = {};
    gg.nodes.forEach(n => {
        result[n.id] = {
            job: n.job,
            office: n.office,
            name: n.name
        };
    });

    return result;
}

const nodes = make_map(graph);

export { graph, nodes };