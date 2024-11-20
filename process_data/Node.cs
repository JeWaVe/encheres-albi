using System.Collections.Generic;

namespace albi
{
    public class Node
    {
        public int id { get; set; }
        public string name { get; set; }

        public List<Job> job { get; set; }

        public List<Office> offices { get; set; }

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
}
