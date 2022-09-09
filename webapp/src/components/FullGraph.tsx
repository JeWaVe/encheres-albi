import React from "react";
import { nodes, links, IPeopleDesc, ILink, LinkType } from "../graph";
import * as d3 from "d3";
import assert from 'assert';
import "./FullGraph.scss";

interface INode {
    name: string;
    children: INode[];
    parent?: INode;
    guy?: IPeopleDesc;
    isSource?: boolean;
    isTarget?: boolean;
}

interface PartialLabelledPath extends Array<d3.HierarchyPointNode<INode>> {
    type?: number;
    source?: d3.HierarchyPointNode<INode>;
    target?: d3.HierarchyPointNode<INode>;
}

type LabelledPath = PartialLabelledPath & d3.BaseType;

class FullGraph extends React.Component {
    private ref!: SVGSVGElement;

    private color = d3.scaleOrdinal(d3.schemeCategory10);
    private diameter = 960;
    private radius = this.diameter / 2;
    private innerRadius = this.radius - 120;
    private offset = 100;

    public componentDidMount(): void {
        const root = this.buildGraph(nodes);
        this.displayGraph(root);
    }

    public render() {
        return (<div className="svg FullGraph">
            <svg className="container" ref={(ref: SVGSVGElement) => this.ref = ref}></svg>
        </div>);
    }

    private buildTree(n: { [id: number]: IPeopleDesc }): INode {
        let root: INode = { name: "root", children: [] };
        var map: { [key: string]: INode } = { "root": root };
        function contains(children: INode[], node: INode) {
            for (let i = 0; i < children.length; ++i) {
                if (children[i].name === node.name) {
                    return true;
                }
            }

            return false;
        }

        for (let id in nodes) {
            const n = nodes[id];
            const office = (n.office?.Name || "no office");
            const job = office + " " + (n.job.map(j => j.Name).join(', ') || "no job");
            const name = id + " : " + n.name;
            if (!map.hasOwnProperty(office)) {
                map[office] = { name: office, children: [], parent: map["root"] };
            }
            if (!map.hasOwnProperty(job)) {
                map[job] = { name: job, children: [], parent: map[office] };
            }
            if (!map.hasOwnProperty(name)) {
                map[name] = { name: name, guy: n, children: [], parent: map[job] };
            }
            if (!contains(root.children, map[office])) {
                map["root"].children.push(map[office]);
            }
            if (!contains(map[office].children, map[job])) {
                map[office].children.push(map[job]);
            }

            if (!contains(map[job].children, map[name])) {
                map[job].children.push(map[name]);
            }
        };

        for(const office of root.children) {
            for(const job of office.children) {
                let guys = job.children;
                guys.sort((a, b) => {
                    let aweight = (a.guy?.inlinks || 0) + (b.guy?.outlinks || 0);
                    let bweight = (b.guy?.inlinks || 0) + (b.guy?.outlinks || 0);
                    return aweight - bweight;
                });
            }
        }

        return root;
    }

    private buildGraph(n: { [id: number]: IPeopleDesc; }): d3.HierarchyPointNode<INode> {
        let r = this.buildTree(n);
        const cluster = d3.cluster<INode>()
            .size([360, this.innerRadius]);
        let root = d3.hierarchy(r);
        return cluster(root);
    }

    private displayGraph(root: d3.HierarchyPointNode<INode>) {
        let svg = d3.select(this.ref)
            .attr("width", this.diameter + 400)
            .attr("height", this.diameter + 400);

        let diagram = svg
            .append("g")
            .attr("transform", "translate(" + (this.radius + this.offset) + "," + (this.radius + this.offset) + ")");


        let link = diagram.append("g").selectAll(".link");
        let node = diagram.append("g").selectAll(".node");

        const line = d3.lineRadial<d3.HierarchyPointNode<INode>>()
            .curve(d3.curveBundle.beta(0.85))
            .radius(d => d.y)
            .angle(d => d.x / 180 * Math.PI);

        const nodeElements = node
            .data(root.leaves())
            .enter().append("text")
            .attr("class", "chord_node")
            .attr("dy", "0.31em")
            .attr("transform", function (d) { return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 38) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); })
            .attr("text-anchor", function (d) { return d.x < 180 ? "start" : "end"; })
            .text(function (d) { return d.data.name.substring(0, Math.min(d.data.name.length, 30)); });

        // link must be assigned to something to be displayed properly (why the hell???)
        // eslint-disable-next-line
        const linkElements = link
            .data(this.buildPath(root.leaves(), links))
            .enter().append("path")
            .each(d => { d.source = d[0]; d.target = d[d.length - 1]; })
            .attr("class", "link")
            .attr("d", line);

        nodeElements.on("mouseover", (event: any, d: d3.HierarchyPointNode<INode>) => this.nodeHovered(d, nodeElements, linkElements));
        nodeElements.on("mouseout", (event: any, d: d3.HierarchyPointNode<INode>) => this.nodeMouseOut(nodeElements, linkElements));
        this.displayCategories(root, linkElements);
    }

    private displayCategories(root: d3.HierarchyPointNode<INode>, link: d3.Selection<SVGPathElement, LabelledPath, SVGGElement, unknown>) {
        let id = 0;
        let svg = d3.select(this.ref);
        assert(root.children);
        for (let i = 0; i < root.children.length; ++i) {
            const office = root.children[i];
            const arc = this.getArc(this.innerRadius, this.innerRadius + 10)(office);
            const officeElements = svg.append("path")
                .attr("id", "path" + id)
                .attr("d", arc)
                .attr("data-category", office.data.name)
                .attr("stroke", this.color(office.data.name))
                .attr("fill", this.color(office.data.name))
                .attr("transform", "translate(" + (this.radius + this.offset) + "," + (this.radius + + this.offset) + ")");

            officeElements.on("mouseover", () => this.categoryHovered(root, officeElements, link));
            officeElements.on("mouseout", () => this.categoryOut(link));

            svg.append("text")
                .attr("dy", 8)
                .append("textPath")
                .attr("class", "category")
                .attr("xlink:href", "#path" + id++)
                .text(office.data.name);

            assert(office.children);

            for (let j = 0; j < office.children.length; ++j) {
                const job = office.children[j];
                const arc = this.getArc(this.innerRadius + 10, this.innerRadius + 20)(job);
                const jobElement = svg.append("path")
                    .attr("id", "path" + id)
                    .attr("d", arc)
                    .attr("data-category", job.data.name)
                    .attr("stroke", this.color(job.data.name))
                    .attr("fill", this.color(job.data.name))
                    .attr("transform", "translate(" + (this.radius + this.offset) + "," + (this.radius + this.offset) + ")");

                jobElement.on("mouseover", () => this.categoryHovered(root, jobElement, link));
                jobElement.on("mouseout", () => this.categoryOut(link));

                svg.append("text")
                    .attr("dy", 8)
                    .append("textPath")
                    .attr("class", "category")
                    .attr("xlink:href", "#path" + id++)
                    .text(office.data.name.substring((office.data.name + " ").length));
            }
        }
    }

    private buildPath(leaves: d3.HierarchyPointNode<INode>[], links: ILink[]) {
        var map: { [key: number]: d3.HierarchyPointNode<INode> } = {}, result: LabelledPath[] = [];

        // Compute a map from name to node.
        leaves.forEach(l => {
            if (l.data.guy) {
                map[l.data.guy?.id] = l;
            }
        });

        // For each import, construct a link from the source to target node.
        links.forEach(l => {
            let path: LabelledPath = map[l.source].path(map[l.dest]) as unknown as LabelledPath;
            path.type = l.type;
            if (path.length > 1) {
                result.push(path);
            }
        });

        return result;
    }

    private degToRad(d: number): number {
        return d / 180 * Math.PI;
    }

    private getArc(ir: number, or: number) {
        return d3.arc<d3.HierarchyPointNode<INode>>()
            .innerRadius(ir)
            .outerRadius(or)
            .startAngle(d => this.findStartAngle(d.leaves()))
            .endAngle(d => this.findEndAngle(d.leaves()));
    }

    private findStartAngle(children: d3.HierarchyPointNode<INode>[]): number {
        var min = children[0].x;
        children.forEach(function (d) {
            if (d.x < min)
                min = d.x;
        });
        return this.degToRad(min - 1);
    }

    private findEndAngle(children: d3.HierarchyPointNode<INode>[]): number {
        var max = children[0].x;
        children.forEach(function (d) {
            if (d.x > max)
                max = d.x;
        });
        return this.degToRad(max + 1);
    }


    private categoryHovered(root: d3.HierarchyPointNode<INode>, elem: d3.Selection<SVGPathElement, unknown, null, undefined>, link: d3.Selection<SVGPathElement, LabelledPath, SVGGElement, unknown>) {
        let catnode = this.findCatNode(root, elem.attr("data-category"));
        if (catnode === undefined) {
            return;
        }

        let leaves = catnode.leaves();
        for (let key in LinkType) {
            link.classed(key, l => {
                return l !== undefined
                    && l.type === LinkType[key]
                    && leaves.find(n => n.data.guy?.id === l.source?.data?.guy?.id) !== undefined;
            });
        }

        link.classed("hidden", l => l !== undefined && !leaves.find(n => n.data.guy?.id === l.source?.data.guy?.id))
    }

    private categoryOut(link: d3.Selection<SVGPathElement, LabelledPath, SVGGElement, unknown>) {
        for (let key in LinkType) {
            link.classed(key, false);
        }
        link.classed("hidden", false);
    }


    private findCatNode(node: d3.HierarchyPointNode<INode>, name: string): d3.HierarchyPointNode<INode> | undefined {
        if (node.data.name === name) {
            return node;
        }
        if (!node.children || node.children.length === 0) {
            return undefined;
        }
        for (let i = 0; i < node.children.length; ++i) {
            let result = this.findCatNode(node.children[i], name);
            if (result != null) {
                return result;
            }
        }
    }

    private nodeHovered(node: d3.HierarchyPointNode<INode>, nodeElements: d3.Selection<SVGTextElement, d3.HierarchyPointNode<INode>, SVGGElement, unknown>,
                        linkElements: d3.Selection<SVGPathElement, LabelledPath, SVGGElement, unknown>) {
        nodeElements.each(function (n) { n.data.isTarget = n.data.isSource = false; });

        for(let key in LinkType) {
            linkElements
                .classed(key, l => {
                    if (l.type === LinkType[key] && l.source?.data.guy?.id === node.data.guy?.id) {
                        assert(l.target);
                        return l.target.data.isTarget = true;
                    }
                    return false;
                })
                .classed(key, l => {
                    if (l.type === LinkType[key] && l.target?.data.guy?.id === node.data.guy?.id) {
                        assert(l.source);
                        return l.source.data.isSource = true;
                    }
                    return false;
                }).raise();
        }

        linkElements.classed("hidden", l => {
            return l.source?.data.guy?.id != node.data.guy?.id && l.target?.data.guy?.id != node.data.guy?.id;
        });

        nodeElements
            .classed("target", n => n.data.isTarget === true)
            .classed("source", n => n.data.isSource === true);
    }

    private nodeMouseOut(nodeElements: d3.Selection<SVGTextElement, d3.HierarchyPointNode<INode>, SVGGElement, unknown>,
        linkElements: d3.Selection<SVGPathElement, LabelledPath, SVGGElement, unknown>) {
            for(let key in LinkType) {
                linkElements.classed(key, false);
            }

            linkElements.classed("hidden", false);
            nodeElements.classed("target", false).classed("source", false);
    }
   
}

export default FullGraph;