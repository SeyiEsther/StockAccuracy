using StockAccuracy.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();

// Swap MockStockService for SqlStockService once the database is ready.
builder.Services.AddScoped<IStockService, MockStockService>();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
    app.UseExceptionHandler("/Error");

app.UseStaticFiles();
app.UseRouting();
app.MapRazorPages();

app.Run();
