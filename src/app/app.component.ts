import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, NavigationError, Event, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './commons/header/header.component';
import { FloatingButtonComponent } from "./commons/floating-button/floating-button.component";
import { NotifyComponent } from './commons/notify/notify.component';
import { ConfirmComponent } from './commons/confirm/confirm.component';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule} from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FloatingButtonComponent, ConfirmComponent, NotifyComponent, CommonModule, FontAwesomeModule],
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
      const shownUrls = ["home"]

      this.showHeader = shownUrls.includes(currentUrl)
    });

    // Log navigation errors globally
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationError) {
        console.error('Global Navigation Error:', event.error, 'Url:', event.url);
      }
    });
  }

}
