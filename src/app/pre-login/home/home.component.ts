import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  constructor(private router: Router, private title: Title){
    this.title.setTitle("SomaAfrica - Home")
  }

  navigateToPage(page: string){
    this.router.navigate([`/${page}`], { queryParams: { source: 'home' } });
  }

}
