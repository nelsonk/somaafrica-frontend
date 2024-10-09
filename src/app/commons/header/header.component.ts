import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationStart, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  currentSource!: string;
  previousUrl!: string; // Store the immediate previous URL

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    // Initialize previous URL to the current URL at app startup
    this.previousUrl = this.router.url.split('?')[0];

    // Listen to NavigationStart events for every route change
    this.router.events.pipe(
      filter(event => event instanceof NavigationStart) // Filter NavigationStart events
    ).subscribe((event: NavigationStart) => {
      // Set the previous URL before navigation
      this.previousUrl = event.url.split('?')[0]; // Update the previous URL for next navigation
      this.updateSource(); // Update the current source based on previous URL
    });
  }

  updateSource() {
    // Update the current source to the last visited URL (previous URL)
    this.currentSource = this.previousUrl || 'defaultSource';
    console.log("Updated Source: ", this.currentSource);
  }

  getUpdatedQueryParams(): any {
    // Force the source to be updated immediately before generating query params
    this.updateSource(); // Ensure source is updated before query params are set

    const params = { ...this.route.snapshot.queryParams }; // Copy current query params
    // Set source as the current cleaned-up previous URL
    params['source'] = this.currentSource;
    return params;
  }
}
