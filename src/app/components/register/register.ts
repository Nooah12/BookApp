import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  username = '';
  password = '';
  private auth = inject(AuthService);
  private router = inject(Router);

  register() {
    this.auth.register(this.username, this.password).subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => alert('Registration failed')
    });
  }
}