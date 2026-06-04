using Laundry.DAL.DbHelper;
using Laundry.DAL.Repositories;
using Laundry.BLL.Services.Auth;
using Laundry.BLL.Services.Payments;
using Laundry.BLL.Services.Commerce;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// =======================
// SERVICES
// =======================

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddAuthorization();

// DB + DI
builder.Services.AddSingleton<SqlHelper>();
builder.Services.AddScoped<UserRepository>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<ServiceRepository>();
builder.Services.AddScoped<LaundryService>();
builder.Services.AddScoped<ProviderRepository>();
builder.Services.AddScoped<ProviderService>();
builder.Services.AddSingleton<PayHereService>();
builder.Services.AddScoped<ServiceItemRepository>();
builder.Services.AddScoped<ServiceItemService>();

builder.Services.AddHttpLogging(_ => { });

// =======================
// 🔐 GOOGLE AUTH (ADDED)
// =======================

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    var jwtKey = builder.Configuration["Jwt:Key"];
    if (string.IsNullOrWhiteSpace(jwtKey))
        throw new InvalidOperationException("JWT key is missing (Jwt:Key)");

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidateAudience = true,
        ValidAudience = builder.Configuration["Jwt:Audience"],
        ValidateLifetime = true,
        ClockSkew = TimeSpan.FromMinutes(2)
    };
})
.AddCookie()
.AddGoogle(options =>
{
    options.ClientId = builder.Configuration["Google:ClientId"]
        ?? throw new InvalidOperationException("Google ClientId is missing (Google:ClientId)");
    options.ClientSecret = builder.Configuration["Google:ClientSecret"]
        ?? throw new InvalidOperationException("Google ClientSecret is missing (Google:ClientSecret)");
    options.CallbackPath = "/api/auth/google-callback";
});

// =======================
// CORS (IMPORTANT FOR REACT)
// =======================

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173", "http://localhost:5174")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();

// =======================
// PIPELINE
// =======================

// Swagger
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// HTTPS (only production OR when needed)
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// Logging (optional)
if (app.Environment.IsDevelopment())
{
    app.UseHttpLogging();
}

// =======================
// IMPORTANT ORDER
// =======================

app.UseCors("AllowReactApp");

// 🔥 ADD THIS (VERY IMPORTANT)
app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();