import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { QuoteService, Quote } from '../../services/quote';

@Component({
  selector: 'app-quotes',
  imports: [FormsModule, NgFor, NgIf],
  templateUrl: './quotes.html',
  styleUrl: './quotes.scss'
})
export class Quotes implements OnInit {
  quotes: Quote[] = [];
  form: Quote = { text: '', author: '' };
  showForm = false;
  editingId: number | null = null;
  private quoteService = inject(QuoteService);

  ngOnInit() {
    this.quoteService.getAll().subscribe(q => this.quotes = q);
  }

  submit() {
    this.quoteService.create(this.form).subscribe(q => {
      this.quotes.push(q);
      this.cancelForm();
    });
  }

  startEdit(quote: Quote) {
    this.editingId = quote.id!;
    this.form = { ...quote };
    this.showForm = false;
  }

  saveEdit(id: number) {
    this.quoteService.update(id, this.form).subscribe(updated => {
      this.quotes = this.quotes.map(q => q.id === id ? updated : q);
      this.cancelForm();
    });
  }

  delete(id: number) {
    if (confirm('Delete this quote?')) {
      this.quoteService.delete(id).subscribe(() => {
        this.quotes = this.quotes.filter(q => q.id !== id);
      });
    }
  }

  cancelForm() {
    this.form = { text: '', author: '' };
    this.showForm = false;
    this.editingId = null;
  }
}
