using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using Newtonsoft.Json;

namespace xavier
{
    class Node
    {
        public int id { get; set; }
        public string name { get; set; }

        public List<String> job { get; set; }
        public List<String> offices { get; set; }

        public List<String> rank { get; set; }

        public override bool Equals(object obj)
        {
            Node o = obj as Node;
            return o != null && o.id == this.id;
        }

        public override int GetHashCode()
        {
            return this.id;
        }

        public override string ToString()
        {
            return this.name;
        }
    }

    class Link
    {

        public const int LINK_WITNESS = 0;
        public const int LINK_WITNESS_TOGETHER = 1;
        public const int LINK_BID_TOGETHER = 2;
        public const int LINK_OVERBID = 3;
        public const int LINK_WON_BID = 4;
        public int source { get; set; }
        public int target { get; set; }
        public int label { get; set; }
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

        static string[] OFFICES = new string[8] { "COS", "CS", "CRI", "TRES", "SERV", "RECV", "LTV", "LTJ" };
        static string[] RANKS = new string[] { "M", "BCL", "LCL", "NOB", "BG", "MGR" };

        static IEnumerable<Node> ReadNodes()
        {

            List<Node> result = new List<Node>();
            foreach (var line in File.ReadAllLines("./metiers.csv").Skip(1))
            {
                var splitted = line.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
                List<String> rank = new List<string>();
                List<String> job = new List<string>();
                List<String> offices = new List<string>();
                if (splitted.Length > 2)
                {
                    var tmp = splitted[2].Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();
                    job = tmp.Where(s => !OFFICES.Contains(s) && !RANKS.Contains(s)).ToList();
                    offices = tmp.Where(s => OFFICES.Contains(s)).ToList();
                    rank = tmp.Where(s => RANKS.Contains(s)).ToList();
                }
                result.Add(new Node
                {
                    id = int.Parse(splitted[0]),
                    name = Regex.Replace(splitted[1], @"\s+", " "),
                    job = job,
                    offices = offices,
                    rank = rank,
                });
            }

            return result;
        }

        static Dictionary<int, Node> Nodes;

        static void Main(string[] args)
        {
            Nodes = ReadNodes().ToDictionary((n) => n.id);

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
            WinnerGraph(sales);
            WitnessGraph(sales);
        }
        private static void WitnessGraph(Sale[] sales)
        {
            var graph = new Graph();
            var nodes = new HashSet<int>();
            var links = new List<Link>();
            foreach (var sale in sales)
            {
                for (int bid_index = 1; bid_index < sale.Bids.Count - 1; bid_index += 2)
                {
                    var witnesses = sale.Bids[bid_index].Bidders;

                    foreach (var w in witnesses)
                    {
                        foreach (var ww in witnesses)
                        {
                            if (ww != w)
                            {
                                nodes.Add(w);
                                links.Add(new Link
                                {
                                    label = Link.LINK_WITNESS_TOGETHER,
                                    source = w,
                                    target = ww
                                });
                            }
                        }
                    }
                }
            }

            graph.nodes = nodes.Select(n => Nodes[n]).ToArray();
            graph.links = links.ToArray();
            File.WriteAllText("html/witnesses.json", JsonConvert.SerializeObject(graph));
        }

        private static void WinnerGraph(Sale[] sales)
        {
            var graph = new Graph();
            var nodes = new HashSet<int>();
            var links = new List<Link>();
            foreach (var sale in sales)
            {
                var openers = sale.Bids[0].Bidders;
                var winner1 = sale.Bids[sale.Bids.Count - 6].Bidders;
                var winner2 = sale.Bids[sale.Bids.Count - 4].Bidders;
                foreach (var w1 in winner1)
                {
                    foreach (var o1 in openers)
                    {
                        if (o1 != w1)
                        {
                            nodes.Add(o1);
                            nodes.Add(w1);
                            links.Add(new Link
                            {
                                label = Link.LINK_OVERBID,
                                source = w1,
                                target = o1
                            });
                        }
                    }
                }
                foreach (var w2 in winner2)
                {
                    foreach (var o1 in openers)
                    {
                        if (w2 != o1)
                        {
                            nodes.Add(o1);
                            nodes.Add(w2);
                            links.Add(new Link
                            {
                                label = Link.LINK_OVERBID,
                                source = w2,
                                target = o1
                            });
                        }
                    }
                }
            }

            graph.nodes = nodes.Select(n => Nodes[n]).ToArray();
            graph.links = links.ToArray();
            File.WriteAllText("html/winners.json", JsonConvert.SerializeObject(graph));
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
                                    label = Link.LINK_OVERBID
                                });
                            }
                        }

                        bidIndex += 2;
                    }
                }
            }

            graph.nodes = nodes.Select(n => Nodes[n]).ToArray();
            graph.links = links.ToArray();
            File.WriteAllText("html/overbid_graph.json", JsonConvert.SerializeObject(graph));
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
                var openers = sale.Bids[0].Bidders;

                while (bidIndex < sale.Bids.Count - 6)
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
                                    target = w1
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
                                    label = Link.LINK_BID_TOGETHER
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
                                    label = Link.LINK_OVERBID
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
                                label = Link.LINK_WITNESS
                            });
                        }
                    }

                    lastBidders = bidders.ToArray();

                    bidIndex += 2;
                }

                var winners1 = sale.Bids[sale.Bids.Count - 6].Bidders;
                var witness1 = sale.Bids[sale.Bids.Count - 5].Bidders;
                var winners2 = sale.Bids[sale.Bids.Count - 4].Bidders;
                var witness2 = sale.Bids[sale.Bids.Count - 3].Bidders;

                foreach (var winner in winners1)
                {
                    foreach (var opener in openers)
                    {
                        nodes.Add(opener);
                        nodes.Add(winner);
                        links.Add(new Link
                        {
                            source = winner,
                            target = opener,
                            label = Link.LINK_WON_BID
                        });
                    }

                    foreach (var w in witness1)
                    {
                        nodes.Add(winner);
                        nodes.Add(w);
                        links.Add(new Link
                        {
                            source = w,
                            label = Link.LINK_WITNESS,
                            target = winner
                        });


                        foreach (var w2 in witness1)
                        {
                            if (w != w2)
                            {
                                links.Add(new Link
                                {
                                    label = Link.LINK_WITNESS_TOGETHER,
                                    source = w,
                                    target = w2
                                });
                            }
                        }
                    }
                }

                foreach (var winner in winners2)
                {
                    foreach (var opener in openers)
                    {
                        nodes.Add(opener);
                        nodes.Add(winner);
                        links.Add(new Link
                        {
                            source = winner,
                            target = opener,
                            label = Link.LINK_WON_BID
                        });
                    }

                    foreach (var w in witness2)
                    {
                        nodes.Add(winner);
                        nodes.Add(w);
                        links.Add(new Link
                        {
                            source = w,
                            label = Link.LINK_WITNESS,
                            target = winner
                        });


                        foreach (var w2 in witness2)
                        {
                            if (w != w2)
                            {
                                links.Add(new Link
                                {
                                    label = Link.LINK_WITNESS_TOGETHER,
                                    source = w,
                                    target = w2
                                });
                            }
                        }
                    }
                }
            }

            graph.nodes = nodes.Select(n => Nodes[n]).ToArray();
            graph.links = links.ToArray();

            File.WriteAllText("html/full_graph.json", JsonConvert.SerializeObject(graph));
        }
    }
}
