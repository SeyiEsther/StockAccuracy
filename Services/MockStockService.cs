using StockAccuracy.Models;

namespace StockAccuracy.Services;

// ─────────────────────────────────────────────────────────────────────────────
// Temporary mock service — returns hardcoded data so the dashboard works
// before the SQL backend is ready.
//
// TO SWITCH TO REAL DATA:
//   1. Create SqlStockService.cs implementing IStockService
//   2. Inject IConfiguration to get the connection string from appsettings.json
//   3. Query the StockComparison SQL view and map rows to StockRow
//   4. In Program.cs change: AddScoped<IStockService, MockStockService>()
//                       to:  AddScoped<IStockService, SqlStockService>()
// ─────────────────────────────────────────────────────────────────────────────

public class MockStockService : IStockService
{
    // Raw snapshot pairs — (materialNumber, description, sLoc, yesterdayQty, todayQty, bun, mrpController)
    private static readonly (string mat, string desc, string sLoc, decimal yest, decimal today, string bun, string mrp)[] RawData =
    [
        ("200003",  "WASHER/N125/8,4",            "4002", 1200, 980,   "EA", "A06"),
        ("200145",  "BOLT M6x20 HEX HEAD",         "4002", 500,  500,   "EA", "A06"),
        ("200892",  "CABLE GLAND PG16",             "4003", 340,  410,   "EA", "B02"),
        ("201034",  "DIN RAIL 35MM 2M",             "4003", 80,   80,    "EA", "B02"),
        ("201250",  "TERMINAL BLOCK 4MM",           "1001", 2000, 1640,  "EA", "C01"),
        ("201489",  "CONTACTOR 230V 9A",            "1001", 45,   45,    "EA", "C01"),
        ("201532",  "CIRCUIT BREAKER 6A 1P",        "1001", 120,  98,    "EA", "C01"),
        ("201788",  "CABLE DUCT 25x25",             "3001", 60,   74,    "EA", "A06"),
        ("202001",  "EARTH STUD M6",                "4002", 300,  300,   "EA", "A06"),
        ("202210",  "ENCLOSURE RIT AX 600x600",     "3001", 18,   6,     "EA", "D05"),
        ("202345",  "PUSH BUTTON GREEN 22MM",       "4003", 90,   113,   "EA", "B02"),
        ("202567",  "INDICATOR LAMP RED 230V",      "4003", 55,   55,    "EA", "B02"),
        ("202891",  "FUSE 6A CYLINDRICAL",          "1001", 450,  510,   "EA", "C01"),
        ("203112",  "PSU 24VDC 10A DIN",            "1001", 22,   22,    "EA", "C01"),
        ("203344",  "CABLE H07V-K 1.5MM BLK 100M", "3001", 14,   14,    "RL", "D05"),
        ("203500",  "GLAND PLATE 600x200",          "3001", 30,   0,     "EA", "D05"),
        ("203678",  "SCREW M4x10 POZI",             "4002", 5000, 4980,  "EA", "A06"),
        ("203890",  "HEX NUT M4 ZINC",              "4002", 3000, 2980,  "EA", "A06"),
        ("204102",  "RELAY 24VDC SPCO",             "1001", 0,    40,    "EA", "C01"),
        ("204230",  "SOCKET BASE 8-PIN DIN",        "1001", 0,    38,    "EA", "C01"),
        ("204455",  "LABEL HOLDER 15MM DIN",        "4003", 200,  200,   "EA", "B02"),
        ("204601",  "MOUNTING PLATE GALV 600x600",  "3001", 12,   12,    "EA", "D05"),
        ("204780",  "SHRINK TUBE 3MM BLACK 100M",   "4002", 8,    8,     "RL", "A06"),
        ("204920",  "CABLE TIE 100MM NATURAL",      "4002", 2500, 2500,  "EA", "A06"),
        ("205100",  "WIRING DUCT COVER 25MM",       "4003", 120,  88,    "EA", "B02"),
    ];

    public Task<StockResult> GetComparisonAsync()
    {
        var rows = RawData.Select(r =>
        {
            bool isNew     = r.yest == 0 && r.today > 0;
            bool isMissing = r.yest > 0  && r.today == 0;

            decimal  delta     = r.today - r.yest;
            decimal? pctChange = isNew || isMissing
                ? (isMissing ? -100m : null)
                : (r.yest != 0 ? Math.Round(delta / r.yest * 100, 2) : 0m);

            return new StockRow
            {
                MaterialNumber = r.mat,
                Description    = r.desc,
                SLoc           = r.sLoc,
                YesterdayQty   = r.yest,
                TodayQty       = r.today,
                Delta          = delta,
                PctChange      = pctChange,
                Bun            = r.bun,
                MrpController  = r.mrp,
                IsNew          = isNew,
                IsMissing      = isMissing,
            };
        }).ToList();

        return Task.FromResult(new StockResult
        {
            Rows        = rows,
            LastUpdated = new DateTime(2026, 5, 7, 6, 12, 0),
        });
    }
}
