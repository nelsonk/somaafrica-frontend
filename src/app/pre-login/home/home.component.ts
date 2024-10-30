import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { ReusableCardComponent } from '../../commons/reusable-card/reusable-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, ReusableCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  cardData = {
    title: 'Recommended just for you!',
    description: '',
    items: [
      { image: 'img/logo.png', title: 'Coaching & Quizzes', desc: 'Looking for coaching or Quizzes, we have a teacher near you & the best prepared Quizzes', link: '/register' },
      { image: 'img/logo.png', title: 'Online Admissions', desc: 'Applying into any school has never been easier & you even get to track progress till admission', link: '/login' },
      { image: 'img/logo.png', title: 'Learning Materials', desc: 'Explore thousands of written and video materials from the best schools and teachers', link: '#' },
      { image: 'img/logo.png', title: 'Learning Materials', desc: 'Explore thousands of written and video materials from the best schools and teachers', link: '/' }
    ]
  };

  constructor(private router: Router, private title: Title){
    this.title.setTitle("SomaAfrica - Home")
  }

  navigateToPage(page: string){
    this.router.navigate([`/${page}`], { queryParams: { source: 'home' } });
  }

}
