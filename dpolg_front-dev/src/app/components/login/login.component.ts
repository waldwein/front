import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { PlanService } from 'src/app/services/plan.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  @Output() loginSuccess = new EventEmitter<void>();
  email = '';
  password = '';

  constructor(private planService: PlanService) {}

  ngOnInit() {}

  onSubmit() {
    if (!this.email || !this.password) {
      console.warn('Login blocked: missing email or password');
      return;
    }

    console.info('Login attempt', { email: this.email });
    this.planService.submitForLogin(this.email, this.password).subscribe({
      next: (response) => {
        if (response) {
          console.info('Login success', { email: this.email });
          this.notifyLoginSuccess();
        } else {
          console.warn('Login failed: invalid credentials');
        }
      },
      error: (error) => {
        console.error('Login failed:', error);
      },
    });
  }

  notifyLoginSuccess() {
    this.loginSuccess.emit();
  }
}
