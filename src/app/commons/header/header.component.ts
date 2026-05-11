import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, Router, NavigationStart, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth/auth-service.service';
import { CommonModule } from '@angular/common';
import { NavigationService } from '../../services/navigation/navigation.service';

@Component({
    selector: 'app-header',
    imports: [RouterLink, RouterLinkActive, CommonModule],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  currentSource!: string;
  previousUrl!: string; // Store the immediate previous URL
  authenticated!: boolean

  isScrolled = false;

  indicatorLeft = 0;
  indicatorWidth = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public authService: AuthService,
    private navInterceptor: NavigationService
  ) {}

  // NAVBAR SHRINK
  @HostListener('window:scroll')
  onScroll() {
    this.isScrolled = window.scrollY > 20;
  }

  // MOVE INDICATOR ON HOVER
  moveIndicator(event: MouseEvent) {
    const el = event.currentTarget as HTMLElement;
    const targetEl = el.closest('.nav-link, .btn') as HTMLElement;

    if (!targetEl) return;

    const parent = targetEl.closest('.navbar-nav') as HTMLElement;

    const parentRect = parent.getBoundingClientRect();
    const rect = targetEl.getBoundingClientRect();

    this.indicatorLeft = rect.left - parentRect.left;
    this.indicatorWidth = rect.width;
  }

  // LOCK INDICATOR ON CLICK
  setActive(event: MouseEvent) {
    this.moveIndicator(event);
  }

  ngOnInit() {
    this.authService.isAuthenticated$.subscribe(auth => {
      this.authenticated = auth;
    });
  }

  logout(){
    this.authService.logout();
  }

  profile(){
    this.authService.navigateToPage("profile", "/");
  }
}
