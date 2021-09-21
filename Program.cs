﻿using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Newtonsoft.Json;

namespace xavier
{
    class Node
    {
        public int id { get; set; }
        public string name { get; set; }
    }

    class Link
    {

        public const int LINK_WITNESS = 0;
        public const int LINK_WITNESS_TOGETHER = 1;
        public const int LINK_BID_TOGETHER = 2;
        public const int LINK_OVERBID = 3;
        public int source { get; set; }
        public int target { get; set; }
        public int label { get; set; }
        public int weight { get; set; }
    }


    class Graph
    {
        public Node[] nodes { get; set; }
        public Link[] links { get; set; }
    }

    class Sale
    {
        public String Name { get; set; }
        public int Date { get; set; }

        public List<Bid> Bids { get; set; }

        public override string ToString()
        {
            return this.Name + " year " + this.Date;
        }
    }

    class Bid
    {
        public string Name { get; set; }
        //public Sale Sale { get; set; }
        public List<int> Bidders { get; set; }
    }

    class Program
    {
        static void Main(string[] args)
        {
            string[] lines = File.ReadAllLines("raw_data.csv");

            var years = lines[0].Split(",").Skip(1).Select(s => int.Parse(s.Trim())).ToArray();
            var names = lines[1].Split(",").Skip(1).Select(s => s.Trim()).ToArray();
            if (years.Length != names.Length)
            {
                Console.Error.WriteLine("invalid input file");
                Environment.Exit(6);
            }
            var sales = years.Zip(names).Select(pair => new Sale
            {
                Date = pair.First,
                Name = pair.Second,
                Bids = new List<Bid>()
            }).ToArray();

            foreach (var line in lines.Skip(3))
            {
                var split = line.Split(',');
                var bidName = split[0];
                var cells = split
                    .Skip(1)
                    .Select(c => c.Trim()
                            .Split('#', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries)
                            .Select(s => int.Parse(s))
                            .ToArray())
                    .ToArray();
                if (cells.Length != sales.Length)
                {
                    Console.Error.WriteLine("invalid input file");
                    Environment.Exit(6);
                }

                for (int i = 0; i < cells.Length; ++i)
                {
                    var cell = cells[i];
                    var sale = sales[i];

                    sale.Bids.Add(new Bid
                    {
                        Name = bidName,
                        //Sale = sale,
                        Bidders = cell.ToList()
                    });
                }
            }

            File.WriteAllText("converted_data.json", JsonConvert.SerializeObject(sales));


            FullGraph(sales);
            OverBidGraph(sales);
        }

        private static void OverBidGraph(Sale[] sales)
        {
            var graph = new Graph();
            var nodes = new HashSet<int>();
            var links = new List<Link>();
            foreach (var sale in sales)
            {
                int bidIndex = 0;
                var openers = sale.Bids[0].Bidders;
                if (openers.Any())
                {
                    while (bidIndex < sale.Bids.Count - 6)
                    {
                        foreach (var o in openers)
                        {
                            nodes.Add(o);
                            foreach (var b in sale.Bids[bidIndex].Bidders)
                            {
                                nodes.Add(b);
                                links.Add(new Link
                                {
                                    source = b,
                                    target = o,
                                    label = Link.LINK_OVERBID,
                                    weight = 1
                                });
                            }
                        }

                        bidIndex += 2;
                    }
                }
            }

            graph.nodes = nodes.Select(n => new Node { id = n, name = n.ToString() }).ToArray();
            graph.links = links.ToArray();
            File.WriteAllText("overbid_graph.json", JsonConvert.SerializeObject(graph));
        }

        private static void FullGraph(Sale[] sales)
        {
            var graph = new Graph();
            var nodes = new HashSet<int>();

            var links = new List<Link>();
            foreach (var sale in sales)
            {
                int bidIndex = 0;
                var lastBidders = new int[0];
                while (bidIndex < sale.Bids.Count)
                {
                    var bidders = sale.Bids[bidIndex].Bidders;
                    var witnesses = sale.Bids[bidIndex + 1].Bidders;

                    foreach (var w1 in witnesses)
                    {
                        nodes.Add(w1);
                        foreach (var w2 in witnesses)
                        {
                            nodes.Add(w1);
                            if (w2 != w1)
                            {
                                links.Add(new Link
                                {
                                    label = Link.LINK_WITNESS_TOGETHER,
                                    source = w2,
                                    target = w1,
                                    weight = 1,
                                });
                            }
                        }
                    }

                    if (!bidders.Any())
                    {
                        bidIndex += 2;
                        continue;
                    }

                    foreach (var b1 in bidders)
                    {
                        nodes.Add(b1);
                        foreach (var b2 in bidders)
                        {
                            nodes.Add(b2);
                            if (b1 != b2)
                            {
                                links.Add(new Link
                                {
                                    source = b1,
                                    target = b2,
                                    label = Link.LINK_BID_TOGETHER,
                                    weight = 2,
                                });
                            }
                        }
                        foreach (var b3 in lastBidders)
                        {
                            nodes.Add(b3);
                            if (b1 != b3)
                            {
                                links.Add(new Link
                                {
                                    source = b1,
                                    target = b3,
                                    label = Link.LINK_OVERBID,
                                    weight = 0,
                                });
                            }
                        }
                        foreach (var w1 in witnesses)
                        {
                            if (w1 == b1)
                            {
                                Console.Error.WriteLine("someone witnessing self -- weird");
                            }
                            links.Add(new Link
                            {
                                source = w1,
                                target = b1,
                                label = Link.LINK_WITNESS,
                                weight = 1,
                            });
                        }
                    }

                    lastBidders = bidders.ToArray();

                    bidIndex += 2;
                }
            }

            graph.nodes = nodes.Select(n => new Node { id = n, name = n.ToString() }).ToArray();
            graph.links = links.ToArray();

            File.WriteAllText("full_graph.json", JsonConvert.SerializeObject(graph));
        }
    }
}
