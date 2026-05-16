using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BookApi.Data;
using BookApi.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlite(builder.Configuration.GetConnectionString("Default")));

var jwtKey = builder.Configuration["Jwt:Key"]!;
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt => opt.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    });

builder.Services.AddAuthorization();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(opt =>
{
    opt.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer"
    });
    opt.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            []
        }
    });
});


builder.Services.AddCors(opt => opt.AddDefaultPolicy(p =>
    p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

var app = builder.Build();

using (var scope = app.Services.CreateScope())
    scope.ServiceProvider.GetRequiredService<AppDbContext>().Database.EnsureCreated();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

// --- AUTH ---
app.MapPost("/api/auth/register", async (AppDbContext db, RegisterDto dto) =>
{
    if (await db.Users.AnyAsync(u => u.Username == dto.Username))
        return Results.BadRequest("Username already taken.");

    var user = new User
    {
        Username = dto.Username,
        PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
    };
    db.Users.Add(user);
    await db.SaveChangesAsync();
    return Results.Ok("Registered successfully.");
});

app.MapPost("/api/auth/login", async (AppDbContext db, IConfiguration config, LoginDto dto) =>
{
    var user = await db.Users.FirstOrDefaultAsync(u => u.Username == dto.Username);
    if (user is null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
        return Results.Unauthorized();

    var claims = new[] {
        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new Claim(ClaimTypes.Name, user.Username)
    };
    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]!));
    var token = new JwtSecurityToken(
        issuer: config["Jwt:Issuer"],
        audience: config["Jwt:Audience"],
        claims: claims,
        expires: DateTime.UtcNow.AddDays(7),
        signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
    );
    return Results.Ok(new { token = new JwtSecurityTokenHandler().WriteToken(token) });
});

// --- BOOKS ---
app.MapGet("/api/books", [Authorize] async (AppDbContext db, ClaimsPrincipal user) =>
{
    var userId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
    return await db.Books.Where(b => b.UserId == userId).ToListAsync();
});

app.MapPost("/api/books", [Authorize] async (AppDbContext db, ClaimsPrincipal user, BookDto dto) =>
{
    var userId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
    var book = new Book { Title = dto.Title, Author = dto.Author, PublishedDate = dto.PublishedDate, UserId = userId };
    db.Books.Add(book);
    await db.SaveChangesAsync();
    return Results.Created($"/api/books/{book.Id}", book);
});

app.MapPut("/api/books/{id}", [Authorize] async (AppDbContext db, ClaimsPrincipal user, int id, BookDto dto) =>
{
    var userId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
    var book = await db.Books.FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);
    if (book is null) return Results.NotFound();
    book.Title = dto.Title;
    book.Author = dto.Author;
    book.PublishedDate = dto.PublishedDate;
    await db.SaveChangesAsync();
    return Results.Ok(book);
});

app.MapDelete("/api/books/{id}", [Authorize] async (AppDbContext db, ClaimsPrincipal user, int id) =>
{
    var userId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
    var book = await db.Books.FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);
    if (book is null) return Results.NotFound();
    db.Books.Remove(book);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

// --- QUOTES ---
app.MapGet("/api/quotes", [Authorize] async (AppDbContext db, ClaimsPrincipal user) =>
{
    var userId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
    return await db.Quotes.Where(q => q.UserId == userId).ToListAsync();
});

app.MapPost("/api/quotes", [Authorize] async (AppDbContext db, ClaimsPrincipal user, QuoteDto dto) =>
{
    var userId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
    var quote = new Quote { Text = dto.Text, Author = dto.Author, UserId = userId };
    db.Quotes.Add(quote);
    await db.SaveChangesAsync();
    return Results.Created($"/api/quotes/{quote.Id}", quote);
});

app.MapPut("/api/quotes/{id}", [Authorize] async (AppDbContext db, ClaimsPrincipal user, int id, QuoteDto dto) =>
{
    var userId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
    var quote = await db.Quotes.FirstOrDefaultAsync(q => q.Id == id && q.UserId == userId);
    if (quote is null) return Results.NotFound();
    quote.Text = dto.Text;
    quote.Author = dto.Author;
    await db.SaveChangesAsync();
    return Results.Ok(quote);
});

app.MapDelete("/api/quotes/{id}", [Authorize] async (AppDbContext db, ClaimsPrincipal user, int id) =>
{
    var userId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
    var quote = await db.Quotes.FirstOrDefaultAsync(q => q.Id == id && q.UserId == userId);
    if (quote is null) return Results.NotFound();
    db.Quotes.Remove(quote);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.Run();

record RegisterDto(string Username, string Password);
record LoginDto(string Username, string Password);
record BookDto(string Title, string Author, DateOnly PublishedDate);
record QuoteDto(string Text, string Author);
