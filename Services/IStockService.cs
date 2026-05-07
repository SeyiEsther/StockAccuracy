using StockAccuracy.Models;

namespace StockAccuracy.Services;

public interface IStockService
{
    Task<StockResult> GetComparisonAsync();
}
