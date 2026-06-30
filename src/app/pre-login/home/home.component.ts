import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { ReusableCardComponent } from '../../commons/reusable-card/reusable-card.component';
import { NavigationService } from '../../services/navigation/navigation.service';
import { CardData, HOME_CARD_DATA } from '../../models/card.interface';

@Component({
    selector: 'app-home',
    imports: [RouterLink, ReusableCardComponent],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css'
})
export class HomeComponent {
  cardData: CardData = HOME_CARD_DATA;

  constructor(
    private router: Router,
    private title: Title,
    private navInterceptor: NavigationService)
  {
    this.title.setTitle("SomaAfrica - Home");
  }

}
