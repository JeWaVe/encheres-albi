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
                Color = "#000cff",
                Category = "Administration royale"
            },
            new Office {
                Rank = 2, 
                Code = "COS",
                Name = "Consul", 
                Color = "#000cff",
                Category = "Administration municipale"
            },
            new Office {
                Rank = 3,
                Code = "TRES",
                Name = "Trésorier",
                Color = "#000cff",
                Category = "Administration municipale"
            },
            new Office {
                Rank = 4,
                Code = "NOTC",
                Name = "Notaire des consuls",
                Color = "#ffffff",
                Category = "Administration municipale"
            },
            new Office {
                Rank = 5,
                Code = "CS",
                Name = "Conseiller",
                Color = "#ffffff",
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
                Color = "#ffffff ",
                Category = "Administration municipale"
            },
            new Office {
                Rank = 8,
                Code = "SERV",
                Name = "Sergent",
                Category = "Administration municipale",
                Color = "#b900ff",
            },
            new Office {
                Rank = 9,
                Code = "RECV",
                Name = "Receveur",
                Category = "Administration municipale",
                Color = "#000cff"
            },
            new Office {
                Rank = 10,
                Code = "CAP",
                Name = "Capitaine",
                Category = "Administration municipale",
                Color = "#ffffff"
            }
        };

    };
}
