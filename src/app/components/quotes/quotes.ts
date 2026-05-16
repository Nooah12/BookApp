import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QuoteService, Quote } from '../../services/quote';

@Component({
  selector: 'app-quotes',
  imports: [FormsModule],
  templateUrl: './quotes.html',
  styleUrl: './quotes.scss'
})
export class Quotes implements OnInit {
  quotes: Quote[] = [];
  form: Quote = { text: '', author: '' };
  showForm = false;
  editingId: number | null = null;
  private quoteService = inject(QuoteService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.quoteService.getAll().subscribe(q => {
      this.quotes = q;
      this.cdr.detectChanges();
    });
  }

  submit() {
    this.quoteService.create(this.form).subscribe(q => {
      this.quotes.push(q);
      this.cancelForm();
      this.cdr.detectChanges();
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
      this.cdr.detectChanges();
    });
  }

  delete(id: number) {
    if (confirm('Delete this quote?')) {
      this.quoteService.delete(id).subscribe(() => {
        this.quotes = this.quotes.filter(q => q.id !== id);
        this.cdr.detectChanges();
      });
    }
  }

  cancelForm() {
    this.form = { text: '', author: '' };
    this.showForm = false;
    this.editingId = null;
  }
}
