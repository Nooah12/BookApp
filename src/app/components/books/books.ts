import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor } from '@angular/common';
import { BookService, Book } from '../../services/book';

@Component({
  selector: 'app-books',
  imports: [RouterLink, NgFor],
  templateUrl: './books.html',
  styleUrl: './books.scss'
})
export class Books implements OnInit {
  books: Book[] = [];
  private bookService = inject(BookService);

  ngOnInit() {
    this.bookService.getAll().subscribe(books => this.books = books);
  }

  delete(id: number) {
    if (confirm('Delete this book?')) {
      this.bookService.delete(id).subscribe(() => {
        this.books = this.books.filter(b => b.id !== id);
      });
    }
  }
}
