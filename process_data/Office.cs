using System;
using System.Collections.Generic;

namespace albi
{
    public class Office : NodeAttribute, IComparable<Office> {
        public ushort Rank {get; set; }

        public override String ToString() {
            return Name;
        }

        public int CompareTo(Office o) {
            return Rank.CompareTo(o.Rank);
        }

        public static HashSet<Office> ALL = new HashSet<Office> {
            new Office {
                Rank = 1000,
                Code = "EMPTY",
                Name = "EMPTY",
                Color = "#000000",
                Category = "EMPTY"
            },
            new Office {
                Rank = 0,
                Code = "LTV", 
                Name = "Lieutenant du Viguier", 
                Color = "#000cff",
                Category = "Administration royale"
            },
            new Office {
                Rank = 1, 
                Code = "LTJ",
                Name = "Lieutenant du juge", 
                Color = "#00d8ff",
                Category = "Administration royale"
            },
            new Office {
                Rank = 2, 
                Code = "COS",
                Name = "Consul", 
                Color = "#ff0c00",
                Category = "Administration municipale"
            },
            new Office {
                Rank = 3,
                Code = "TRES",
                Name = "Trésorier",
                Color = "#ff9700",
                Category = "Administration municipale"
            },
            new Office {
                Rank = 4,
                Code = "NOTC",
                Name = "Notaire des consuls",
                Color = "#ff008b",
                Category = "Administration municipale"
            },
            new Office {
                Rank = 5,
                Code = "CS",
                Name = "Conseiller",
                Color = "",
                Category = "Administration municipale"
            },
            new Office {
                Rank = 6,
                Code = "CRI",
                Name = "Crieur public",
                Color = "#fffb00",
                Category = "Administration municipale"
            },
            new Office {
                Rank = 7,
                Code = "SERVD",
                Name = "Serviteur",
                Color = "#7f8c8d ",
                Category = "Administration municipale"
            },
            new Office {
                Rank = 8,
                Code = "SERV",
                Name = "",
                Category = "Indéterminé",
                Color = "#b900ff",
            }
        };

    };
}
