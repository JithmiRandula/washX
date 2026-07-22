using Laundry.DAL.DbHelper;
using Laundry.DAL.Repositories;
using Laundry.API;
using Laundry.BLL.Services.Auth;
using Laundry.BLL.Services.Payments;
using Laundry.BLL.Services.Commerce;
using Laundry.BLL.Services.Chat;
using CloudinaryDotNet;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authentication.OAuth;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
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
builder.Services.AddScoped<CartRepository>();
builder.Services.AddScoped<CartService>();
builder.Services.AddScoped<BulkItemRepository>();
builder.Services.AddScoped<BulkItemService>();
builder.Services.AddScoped<OrderRepository>();
builder.Services.AddScoped<OrderService>();
builder.Services.AddScoped<NotificationRepository>();
builder.Services.AddScoped<ChatRepository>();
builder.Services.AddScoped<ChatService>();
builder.Services.AddScoped<ReviewRepository>();
builder.Services.AddScoped<ReviewService>();
builder.Services.AddScoped<AdminRepository>();
builder.Services.AddScoped<StatsRepository>();
builder.Services.AddScoped<BulkRequestRepository>();
builder.Services.AddScoped<BulkRequestService>();

builder.Services.Configure<CloudinarySettings>(builder.Configuration.GetSection("Cloudinary"));
builder.Services.AddSingleton(provider =>
{
    var settings = provider.GetRequiredService<IOptions<CloudinarySettings>>().Value;
    var account = new Account(settings.CloudName, settings.ApiKey, settings.ApiSecret);
    return new Cloudinary(account) { Api = { Secure = true } };
});

builder.Services.AddHttpLogging(_ => { });

// =======================
// 🔐 GOOGLE AUTH (ADDED)
// =======================

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    // The Google handler needs somewhere to persist the external identity between
    // the OAuth redirect and our callback action — that's this temporary cookie.
    options.DefaultSignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
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
    // Must match the "Authorized redirect URI" registered in Google Cloud Console exactly —
    // do not change this without also updating it there.
    options.CallbackPath = "/api/auth/google-callback";

    // Handle the whole callback right here instead of a separate MVC controller action.
    // The auth middleware (app.UseAuthentication()) intercepts any request to CallbackPath
    // before routing ever sees it, so a controller mapped to the same path is unreachable —
    // doing everything in OnTicketReceived sidesteps that entirely.
    options.Events = new OAuthEvents
    {
        OnTicketReceived = async context =>
        {
            const string frontendBase = "http://localhost:5173";
            context.HandleResponse();

            // Done with the temporary external-login cookie — this app is JWT-based from here on.
            await context.HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

            var claims = context.Principal?.Identities.First().Claims;
            var email = claims?.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;
            var name = claims?.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;

            if (string.IsNullOrWhiteSpace(email))
            {
                context.Response.Redirect($"{frontendBase}/login?error=google_auth_failed");
                return;
            }

            var userService = context.HttpContext.RequestServices.GetRequiredService<UserService>();
            var tokenService = context.HttpContext.RequestServices.GetRequiredService<TokenService>();

            var (user, isNewUser, providerId, _) = await userService.HandleGoogleLogin(name, email);
            var token = tokenService.CreateToken(user);

            var redirectUrl = $"{frontendBase}/auth/google/callback" +
                $"?token={Uri.EscapeDataString(token)}&role={Uri.EscapeDataString(user.Role)}&userId={user.UserId}";
            if (isNewUser) redirectUrl += "&needsPassword=true";
            if (providerId is int pid) redirectUrl += $"&providerId={pid}";

            context.Response.Redirect(redirectUrl);
        }
    };
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