import { CommonModule } from '@angular/common';
import { Component, Input} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardItem } from '../../models/card.interface';


@Component({
    selector: 'app-reusable-card',
    imports: [RouterLink, CommonModule],
    templateUrl: './reusable-card.component.html',
    styleUrl: './reusable-card.component.css'
})

export class ReusableCardComponent {
  @Input() title: string = "";
  @Input() description: string = "";
  @Input() length: number = 100;
  @Input() items: CardItem[] = [];

}
