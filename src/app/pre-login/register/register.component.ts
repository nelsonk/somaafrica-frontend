import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit{
  registerForm!: FormGroup

  constructor(private router: Router, title: Title, private fb: FormBuilder) {
    title.setTitle("SomaAfrica - Register");
  }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      username: ['', ],
      email: ['', Validators.email],
      password1: ['', [Validators.minLength(8), Validators.required]],
      password2: ['', [Validators.minLength(8), Validators.required]]
    });
  }

  navigateToPage(page: string){
    this.router.navigate([`/${page}`], {queryParams: {source: "register"}});
  }

  onSubmit(){}

}
