namespace BookApi.Models;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public ICollection<Book> Books { get; set; } = [];
    public ICollection<Quote> Quotes { get; set; } = [];
}
