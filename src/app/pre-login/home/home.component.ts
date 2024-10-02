import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  constructor(private router: Router, private title: Title){
    title.setTitle("SomaAfrica - Home")
  }

  navigateToPage(page: string){
    this.router.navigate([`/${page}`], { queryParams: { source: 'home' } });
  }

}
