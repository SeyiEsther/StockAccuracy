using System.Text.Json;
using Microsoft.AspNetCore.Mvc.RazorPages;
using StockAccuracy.Models;
using StockAccuracy.Services;

namespace StockAccuracy.Pages;

public class IndexModel : PageModel
{
    private readonly IStockService _stockService;

    public IndexModel(IStockService stockService)
    {
        _stockService = stockService;
    }

    // Serialised to JSON and embedded in the page for client-side use.
    public string StockDataJson  { get; private set; } = "[]";
    public string LastUpdated    { get; private set; } = "—";
    public List<string> SLocList { get; private set; } = new();

    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };

    public async Task OnGetAsync()
    {
        var result = await _stockService.GetComparisonAsync();

        StockDataJson = JsonSerializer.Serialize(result.Rows, JsonOpts);
        LastUpdated   = result.LastUpdated.ToString("dd MMM yyyy HH:mm");
        SLocList      = result.Rows.Select(r => r.SLoc).Distinct().OrderBy(s => s).ToList();
    }
}
