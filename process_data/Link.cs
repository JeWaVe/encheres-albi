namespace albi
{
    public class Link
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
}
