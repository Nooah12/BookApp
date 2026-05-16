import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { BookService, Book } from '../../services/book';

@Component({
  selector: 'app-book-form',
  imports: [FormsModule, RouterLink],
  templateUrl: './book-form.html',
  styleUrl: './book-form.scss'
})
export class BookForm implements OnInit {
  book: Book = { title: '', author: '', publishedDate: '' };
  isEdit = false;
  private bookService = inject(BookService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.bookService.getAll().subscribe(books => {
        const found = books.find(b => b.id === +id);
        if (found) this.book = found;
      });
    }
  }

  submit() {
    if (this.isEdit) {
      this.bookService.update(this.book.id!, this.book).subscribe(() => this.router.navigate(['/books']));
    } else {
      this.bookService.create(this.book).subscribe(() => this.router.navigate(['/books']));
    }
  }
}
