import { CommonModule, NgFor } from '@angular/common';
import { Component, Input} from '@angular/core';
import { RouterLink } from '@angular/router';


interface cardItem {
  image: string;
  title: string;
  desc: string;
  link: string;
}

@Component({
  selector: 'app-reusable-card',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './reusable-card.component.html',
  styleUrl: './reusable-card.component.css'
})

export class ReusableCardComponent {
  @Input() title: string = "";
  @Input() description: string = "";
  @Input() items: cardItem[] = [];

}
