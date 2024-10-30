import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './commons/header/header.component';
import { FloatingButtonComponent } from "./commons/floating-button/floating-button.component";
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule, FaIconLibrary} from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FloatingButtonComponent, CommonModule, FontAwesomeModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  title = 'somaafrica-frontend';
  showHeader = true;

  constructor(private router: Router){}

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const currentUrl = this.router.url.split("?")[0]
      const hiddenUrls = ["/login", "/register"]

      this.showHeader = !hiddenUrls.includes(currentUrl)
    })
  }

}
