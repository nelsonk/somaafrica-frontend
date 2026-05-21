import { Component } from '@angular/core';
import { NavigationService } from '../../services/navigation/navigation.service';
import { RouterLink } from "@angular/router";

@Component({
    selector: 'app-footer',
    imports: [RouterLink],
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.css'
})
export class FooterComponent {
  currentYear: number;

  constructor(private navInterceptor: NavigationService){
    this.currentYear = new Date().getFullYear();
  }

}
