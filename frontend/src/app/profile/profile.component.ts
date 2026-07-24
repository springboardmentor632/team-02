import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router,RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  constructor(private router: Router) {}
  fullName = 'Rahul Sharma';
  email = 'rahul.sharma@gmail.com';
  phone = '+91 98765 43210';
  role = 'Citizen';
  state = 'Delhi';

  saving = false;
  saved = false;

  onSave(): void {
    this.saving = true;
    this.saved = false;
    // TODO: real backend call — PUT /users/profile
    setTimeout(() => {
      this.saving = false;
      this.saved = true;
    }, 800);
  }
  onLogout(): void {
  const confirmLogout = confirm('Are you sure you want to logout?');
  if (confirmLogout) {
    this.router.navigate(['/login']);
  }
}
}