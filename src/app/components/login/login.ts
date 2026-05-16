import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  username = '';
  password = '';
  private auth = inject(AuthService);
  private router = inject(Router);

  login() {
    this.auth.login(this.username, this.password).subscribe({
      next: () => this.router.navigate(['/books']),
      error: () => alert('Invalid username or password')
    });
  }
}

