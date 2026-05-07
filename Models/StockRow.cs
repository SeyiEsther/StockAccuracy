namespace StockAccuracy.Models;

public class StockRow
{
    public string MaterialNumber { get; set; } = "";
    public string Description    { get; set; } = "";
    public string SLoc           { get; set; } = "";
    public decimal YesterdayQty  { get; set; }
    public decimal TodayQty      { get; set; }
    public decimal Delta         { get; set; }
    public decimal? PctChange    { get; set; }  // null for NEW items (no yesterday to divide by)
    public string Bun            { get; set; } = "";
    public string MrpController  { get; set; } = "";
    public bool IsNew            { get; set; }
    public bool IsMissing        { get; set; }
}
