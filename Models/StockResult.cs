namespace StockAccuracy.Models;

public class StockResult
{
    public List<StockRow> Rows       { get; set; } = new();
    public DateTime       LastUpdated { get; set; }
}
