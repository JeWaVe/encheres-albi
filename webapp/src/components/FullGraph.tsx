import React from "react";
import { nodes, links, IPeopleDesc, ILink, LinkType, GetLinkTypeKey } from "../graph";
import * as d3 from "d3";
import assert from 'assert';
import "./FullGraph.scss";
import FullGraphState from "./FullGraphState";

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

class FullGraph extends React.Component<{}, FullGraphState> {
    private ref!: SVGSVGElement;

    constructor(props: any) {
        super(props);
        this.state = new FullGraphState();
    }

    private hoveredCategory: string | undefined;
    private hoveredNode: d3.HierarchyPointNode<INode> | undefined;
    private hierarchyRoot: d3.HierarchyPointNode<INode> | undefined;

    private color = d3.scaleOrdinal(d3.schemeCategory10);
    private diameter = 960;
    private radius = this.diameter / 2;
    private innerRadius = this.radius - 120;
    private offset = 100;

    public componentDidMount(): void {
        this.hierarchyRoot = this.buildGraph(nodes);
        this.displayGraph();
    }

    public render() {
        const allCheckBoxes = [];
        const checkBoxesState = this.state.LinkTypeCheckBoxesStates;
        for(let id in checkBoxesState) {
            switch (id) {
                case "bid":
                    allCheckBoxes.push(this.renderLegendItem("Bid", "bid","Surenchérit", checkBoxesState[id]));
                    break;
                case "cobid":
                    allCheckBoxes.push(this.renderLegendItem("CoBid", "cobid", "Enchérissent ensemble", checkBoxesState[id]));
                    break;
                case "witness":
                    allCheckBoxes.push(this.renderLegendItem("Witness", "witness", "Témoigne", checkBoxesState[id]));
                    break;
                case "cowitness":
                    allCheckBoxes.push(this.renderLegendItem("CoWitness", "cowitness", "Témoignent ensemble", checkBoxesState[id]));
                    break;
                case "take":
                    allCheckBoxes.push(this.renderLegendItem("Take", "take", "Prend", checkBoxesState[id]));
                    break;
                case "cotake":
                    allCheckBoxes.push(this.renderLegendItem("CoTake", "cotake", "Prennent ensemble", checkBoxesState[id]));
                    break;
                default:
                    break;
            }
        }
        return (
            <div className="FullGraph">
                <div className="Legend">
                    <div className="Links">
                        Couleurs des liens :
                        <form>
                            {allCheckBoxes}
                        </form>
                    </div>
                    <div className="Nodes">
                        Couleur des noeuds :
                        <div className="NodeType"><div className="Square Source"></div>Source</div>
                        <div className="NodeType"><div className="Square Target"></div>Destination</div>
                    </div>
                </div>
                <div className="svg">
                    <svg className="container" ref={(ref: SVGSVGElement) => this.ref = ref}></svg>
                </div>
            </div>);
    }

    private renderLegendItem(className: string, id: string, name: string, checked: boolean) {
        return (
        <div className="LinkType" key={id}>
            <div className={className + " Square"}></div>
            <input type="checkbox" id={id} name={name} checked={checked} onChange={(event) => this.checkBoxChanged(event)}></input>
            <label htmlFor={id} id={id}>{name}</label>
        </div>
        );
    }

    private buildGraph(n: { [id: number]: IPeopleDesc; }): d3.HierarchyPointNode<INode> {
        let r = this.buildTree(n);
        const cluster = d3.cluster<INode>()
            .size([360, this.innerRadius]);
        let root = d3.hierarchy(r);
        return cluster(root);
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
            const { office, job } = this.buildOfficeAndJobName(n);
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
        }

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

    private buildOfficeAndJobName(n: IPeopleDesc) {
        const office = (n.offices.map(o => o.Name).join(', ') || "no office");
        const job = office + " " + (n.job.map(j => j.Name).join(', ') || "no job");
        return { office, job };
    }

    private displayGraph() {
        assert(this.hierarchyRoot);
        let svg = d3.select(this.ref)
            .attr("width", this.diameter + 400)
            .attr("height", this.diameter + 400);

        let diagram = svg
            .append("g")
            .attr("transform", "translate(" + (this.radius + this.offset) + "," + (this.radius + this.offset) + ")");
     
        svg.append("defs").append("marker")
            .attr("id", "arrow") // Marker id
            .attr("viewBox", "0 -5 10 10") // Marker viewbox
            .attr("refX", 10) // Position of the arrowhead on the path
            .attr("refY", 0)
            .attr("markerWidth", 6) // Width of the arrow
            .attr("markerHeight", 6) // Height of the arrow
            .attr("orient", "auto") // Orient the arrowhead automatically
            .append("path")
            .attr("d", "M0,-5L10,0L0,5") // Shape of the arrowhead
            .attr("fill", "#000"); // Arrow color (black)

        let link = diagram.append("g").selectAll(".Link");
        let node = diagram.append("g").selectAll(".Node");

        const line = d3.lineRadial<d3.HierarchyPointNode<INode>>()
            .curve(d3.curveBundle.beta(0.85))
            .radius(d => d.y)
            .angle(d => d.x / 180 * Math.PI);

        const nodeElements = node
            .data(this.hierarchyRoot.leaves())
            .enter().append("text")
            .attr("class", "Node")
            .attr("dy", "0.31em")
            .attr("transform", function (d) { return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 38) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); })
            .attr("text-anchor", function (d) { return d.x < 180 ? "start" : "end"; });
        nodeElements
            .append("a").attr("xlink:href", function(d) { return "/people/" + d.data.guy?.id; })
            .text(function (d) { return d.data.name.substring(0, Math.min(d.data.name.length, 30)); });

        // link must be assigned to something to be displayed properly (why the hell???)
        // eslint-disable-next-line
        const linkElements = link
            .data(this.buildPath(this.hierarchyRoot.leaves(), links))
            .enter().append("path")
            .each(d => { d.source = d[0]; d.target = d[d.length - 1]; })
            .attr("class", "Link")
            .attr("d", line)
            .attr("marker-end", "url(#arrow)"); 

        nodeElements.on("mouseover", (event: any, d: d3.HierarchyPointNode<INode>)  => {
            this.hoveredNode = d;
            this.refreshDetails(nodeElements, linkElements);
        }); 

        nodeElements.on("mouseout", (event: any, d: d3.HierarchyPointNode<INode>)  => {
            this.hoveredNode = undefined;
            this.restoreDefault(nodeElements, linkElements);
        });
        
        this.displayCategories(linkElements, nodeElements);

    }

    private displayCategories(
            links: d3.Selection<SVGPathElement, LabelledPath, SVGGElement, unknown>,
            nodes: d3.Selection<SVGTextElement, d3.HierarchyPointNode<INode>, SVGGElement, unknown>) {
        let id = 0;
        assert(this.hierarchyRoot);
        let svg = d3.select(this.ref);
        assert(this.hierarchyRoot.children);
        for (let i = 0; i < this.hierarchyRoot.children.length; ++i) {
            const office = this.hierarchyRoot.children[i];
            const arc = this.getArc(this.innerRadius, this.innerRadius + 10)(office);
            const officeElements = svg.append("path")
                .attr("id", "path" + id)
                .attr("d", arc)
                .attr("data-category", office.data.name)
                .attr("stroke", this.color(office.data.name))
                .attr("fill", this.color(office.data.name))
                .attr("transform", "translate(" + (this.radius + this.offset) + "," + (this.radius + + this.offset) + ")");
            officeElements.append("title").text(office.data.name);
            officeElements.on("mouseover", () => {
                this.hoveredCategory = officeElements.attr("data-category");
                this.refreshDetails(nodes, links);
            });
            officeElements.on("mouseout",() => {
                this.hoveredCategory = undefined;
                this.restoreDefault(nodes, links);
            });

            svg.append("text")
                .attr("dy", 8)
                .append("textPath")
                .attr("class", "category")
                .attr("xlink:href", "#path" + id++)
                .text(office.data.name)
                .classed("IgnorePointer", true);

            assert(office.children);

            for (let j = 0; j < office.children.length; ++j) {
                const job = office.children[j];
                const jobName = job.data.name.substring(office.data.name.length + 1);
                const arc = this.getArc(this.innerRadius + 10, this.innerRadius + 20)(job);
                const jobElement = svg.append("path")
                    .attr("id", "path" + id)
                    .attr("d", arc)
                    .attr("data-category", job.data.name)
                    .attr("stroke", this.color(job.data.name))
                    .attr("fill", this.color(job.data.name))
                    .attr("transform", "translate(" + (this.radius + this.offset) + "," + (this.radius + this.offset) + ")");
                jobElement.append("title").text(jobName);
                jobElement.on("mouseover", () => {
                    this.hoveredCategory = jobElement.attr("data-category");
                    this.refreshDetails(nodes, links);
                });
                jobElement.on("mouseout",() => {
                    this.hoveredCategory = undefined;
                    this.restoreDefault(nodes, links);
                });

                svg.append("text")
                    .attr("dy", 8)
                    .append("textPath")
                    .attr("class", "category")
                    .attr("xlink:href", "#path" + id++)
                    .text(jobName)
                    .classed("IgnorePointer", true);
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

    private refreshDetails(
        nodeElements: d3.Selection<SVGTextElement, d3.HierarchyPointNode<INode>, any, unknown>,
        linkElements: d3.Selection<SVGPathElement, LabelledPath, any, unknown>) {
        this.restoreDefault(nodeElements, linkElements);
        const hoveredNode = this.hoveredNode;
        let _that = this;
        
        // color links
        linkElements.each(function (path: LabelledPath) {
            let l = d3.select(this);
            l.classed("hidden", true);
            assert(path.target);
            assert(path.source);
            assert(path.type !== undefined);
            if(hoveredNode !== undefined) {
                _that.displayNodeLink(path, l);
            } 
            else if (_that.hoveredCategory !== undefined) {
                _that.displayCategoryLink(path, l);
            } else {
                if(_that.checkBoxAllowDisplayLink(path)) {
                    l.classed("hidden", false);
                }
            }
        });

        // color nodes
        if (hoveredNode !== undefined) {
            nodeElements
                .classed("target", n => n.data.isTarget === true)
                .classed("source", n => n.data.isSource === true);
        }
        nodeElements
            .classed("shadowed", n => n.data.isTarget === false && n.data.isSource === false);
    }

    private displayCategoryLink(path: LabelledPath, l: d3.Selection<SVGPathElement, unknown, null, undefined>) {
        assert(this.hoveredCategory);
        assert(this.hierarchyRoot);
        assert(path.target);
        assert(path.source);
        assert(path.type !== undefined);
        assert(path.source.data.guy);
        assert(path.target.data.guy);
        const linkType = GetLinkTypeKey(path.type);
        const catNode = this.findCatNode(this.hierarchyRoot, this.hoveredCategory);
        if (catNode !== undefined) {
            if (this.checkBoxAllowDisplayLink(path)
                && (this.hoveredCategory === this.buildOfficeAndJobName(path.target.data.guy).office
                || this.hoveredCategory === this.buildOfficeAndJobName(path.target.data.guy).office
                || this.buildOfficeAndJobName(path.source.data.guy).job === this.hoveredCategory
                || this.buildOfficeAndJobName(path.source.data.guy).office === this.hoveredCategory)) {   
                path.target.data.isTarget = true;
                path.source.data.isSource = true;
                l.classed(linkType, true);
                l.classed("hidden", false);
            }
        }
    }

    private displayNodeLink(path: LabelledPath, l: d3.Selection<SVGPathElement, unknown, null, undefined>) {
        assert(path.source);
        assert(path.target);
        assert(path.type !== undefined);
        assert(path.source.data.guy);
        assert(path.target.data.guy);
        assert(this.hoveredNode);
        assert(this.hoveredNode.data.guy);
        const linkType = GetLinkTypeKey(path.type);
        if (this.checkBoxAllowDisplayLink(path) &&
            path.source.data.guy.id === this.hoveredNode.data.guy.id) {
            l.classed("hidden", false)
             .classed(linkType, true);
            path.source.data.isSource = true;
            path.target.data.isTarget = true;
        }
    }

    private restoreDefault(nodeElements: d3.Selection<SVGTextElement, d3.HierarchyPointNode<INode>, SVGGElement, unknown>,
        // restore to initial state
        linkElements: d3.Selection<SVGPathElement, LabelledPath, SVGGElement, unknown>) 
    {
        nodeElements.each(function (n) { n.data.isTarget = n.data.isSource = false; });
        linkElements.each(function (_: LabelledPath) {
            let l = d3.select(this);
            l.classed("hidden", false);

            for (let key in LinkType) {
                l.classed(key, false);
            }
        });

        nodeElements
            .classed("target", n => n.data.isTarget = false)
            .classed("source", n => n.data.isSource = false)
            .classed("shadowed", false);
    }

    private checkBoxChanged(event: React.ChangeEvent<HTMLInputElement>) {
        var linkElements = d3.selectAll<SVGPathElement, LabelledPath>(".Link");
        var nodeElements = d3.selectAll<SVGTextElement, d3.HierarchyPointNode<INode>>(".Node");
        this.state.LinkTypeCheckBoxesStates[event.currentTarget.id] = event.currentTarget.checked;
        this.setState(this.state);
        assert(this.hierarchyRoot);
        this.refreshDetails(nodeElements, linkElements);
    }

    private checkBoxAllowDisplayLink(path: LabelledPath) {
        assert(path.type !== undefined);
        const className = GetLinkTypeKey(path.type);
        return this.state.LinkTypeCheckBoxesStates[this.state.classNamesToCheckboxId[className]];
    }
}

export default FullGraph;