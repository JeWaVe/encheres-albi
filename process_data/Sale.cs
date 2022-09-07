using System;
using System.Collections.Generic;

namespace albi
{
    public class Sale
    {
        public String Name { get; set; }
        public int Date { get; set; }

        public List<Bid> Bids { get; set; }

        public override string ToString()
        {
            return this.Name + " year " + this.Date;
        }
    }
}
