import { CommonModule } from '@angular/common';
import { Component, input, OnInit, output} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardData, CardItem } from '../../models/card.interface';
import { FormsModule } from '@angular/forms';


@Component({
    selector: 'app-reusable-card',
    imports: [RouterLink, CommonModule, FormsModule],
    templateUrl: './reusable-card.component.html',
    styleUrl: './reusable-card.component.css'
})

export class ReusableCardComponent implements OnInit {
  cardData = input.required<CardData>();
  cardItem = output<CardItem>();

  searchTerm = '';
  desLength!: number;
  search_by: string = 'Search by Title, Description';

  ngOnInit(): void {
      this.desLength = this.cardData().length ?? 100;

      if (this.cardData().items[0].search) {
        const searchExtras = this.cardData().items[0].search;

        searchExtras?.forEach((s) => {
          this.search_by += `, ${s.key}`
        });
      }
  }

  get filteredItems(): CardItem[] {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      return this.cardData().items;
    }

    return this.cardData().items.filter(item =>
      item.title?.toLowerCase().includes(term) ||
      item.desc?.toLowerCase().includes(term) ||
      item.search?.map((s) => {
        if (Array.isArray(s.value)) {
        return s.value.some(e => e.toLowerCase().includes(term));
      }

      return s.value.toLowerCase().includes(term);
      }).some(s => s === true)
    );
  }

  itemClicked(item: CardItem) {
    if (item.link) return;

    this.cardItem.emit(item);
  }

}
