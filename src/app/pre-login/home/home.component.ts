import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { ReusableCardComponent } from '../../commons/reusable-card/reusable-card.component';
import { NavigationService } from '../../services/navigation/navigation.service';

@Component({
    selector: 'app-home',
    imports: [RouterLink, ReusableCardComponent],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css'
})
export class HomeComponent {
  cardData = {
    title: 'Apply. Learn. Teach. Track. Connect. Rise Beyond!',
    description: 'Recommended just for you, click now to find out more',
    length: 100,
    items: [
      { image: 'img/logo.png', title: 'Coaching & Quizzes', desc: 'Looking for coaching or Quizzes, we have a teacher near you & the best prepared Quizzes', link: '/register' },
      { image: 'img/girl_pointing.png', title: 'Online Admissions', desc: 'Applying into any school has never been easier & you even get to track progress till admission', link: '/login' },
      { image: 'img/mtn_app_challenge.jpg', title: 'Learning Materials', desc: 'Explore thousands of written and video materials from the best schools and teachers', link: '#' },
      { image: 'img/boy_with_book.jpg', title: 'Auto grading & Reports', desc: "Let the system auto grade, generate reports and send them to the parents", link: '/' }
    ]
  };

  constructor(private router: Router, private title: Title, private navInterceptor: NavigationService){
    this.title.setTitle("SomaAfrica - Home")
  }

}
