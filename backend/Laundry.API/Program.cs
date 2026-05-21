using Laundry.DAL.DbHelper;
using Laundry.DAL.Repositories;
using Laundry.BLL.Services.Auth;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;

var builder = WebApplication.CreateBuilder(args);

// =======================
// SERVICES
// =======================

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// DB + DI
builder.Services.AddSingleton<SqlHelper>();
builder.Services.AddScoped<UserRepository>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<TokenService>();

builder.Services.AddHttpLogging(_ => { });

// =======================
// 🔐 GOOGLE AUTH (ADDED)
// =======================

builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = GoogleDefaults.AuthenticationScheme;
})
.AddCookie()
.AddGoogle(options =>
{
    options.ClientId = builder.Configuration["Google:ClientId"];
    options.ClientSecret = builder.Configuration["Google:ClientSecret"];
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
            policy.WithOrigins("http://localhost:5173")
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