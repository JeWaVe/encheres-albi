using System;

namespace albi {
    public class NodeAttribute {
        
        public String Code { get; set; }
        public String Name { get; set; }
        public String Color { get; set; }
        public String Category { get; set; }

        public override bool Equals(object obj)
        {
            var o = obj as NodeAttribute;
            if (o == null) {
                return false;
            }

            return o == this || o.Code == this.Code;
        }
        
        public override int GetHashCode()
        {
            return Code.GetHashCode();
        }
    }

}