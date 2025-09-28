using GorkService.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000") // Frontend URL
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Add HTTP client for OpenRouter
builder.Services.AddHttpClient<IOpenRouterService, OpenRouterService>();

// Register OpenRouter service
builder.Services.AddScoped<IOpenRouterService, OpenRouterService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Use CORS
app.UseCors("AllowFrontend");

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

// Configure to run on port 3006
app.Urls.Add("http://localhost:3007");

Console.WriteLine("🤖 Gork Service iniciado en http://localhost:3007");
Console.WriteLine("📡 Endpoints disponibles:");
Console.WriteLine("   POST /api/gork/chat - Enviar mensaje al chatbot");
Console.WriteLine("   GET  /api/gork/health - Verificar estado del servicio");
Console.WriteLine("   GET  /api/gork/models - Obtener modelos disponibles");

app.Run();
