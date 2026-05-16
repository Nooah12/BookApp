import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BookService, Book } from '../../services/book';

@Component({
  selector: 'app-books',
  imports: [RouterLink],
  templateUrl: './books.html',
  styleUrl: './books.scss'
})
export class Books implements OnInit {
  books: Book[] = [];
  private bookService = inject(BookService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.bookService.getAll().subscribe(books => {
      this.books = books;
      this.cdr.detectChanges();
    });
  }

  delete(id: number) {
    if (confirm('Delete this book?')) {
      this.bookService.delete(id).subscribe(() => {
        this.books = this.books.filter(b => b.id !== id);
        this.cdr.detectChanges();
      });
    }
  }
}
