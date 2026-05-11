// navigation-interceptor.service.ts
import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';

@Injectable({
  providedIn: 'root'
})

/* Intercepts and adds source path to url, just add it in constructor */
export class NavigationService {

  private isInternalNavigation = false;

  constructor(private router: Router) {
    this.init();
  }

  private init() {
    this.router.events.subscribe((event) => {

      if (event instanceof NavigationStart) {

        // Prevent infinite loop
        if (this.isInternalNavigation) {
          this.isInternalNavigation = false;
          return;
        }

        const urlTree = this.router.parseUrl(event.url);

        // If source already exists → do nothing
        if (urlTree.queryParams['source']) return;

        const currentUrl = this.router.url.split('?')[0];

        // Rebuild URL with source
        const newUrl = this.router.createUrlTree(
          [urlTree.root.children['primary']?.segments.map(s => s.path).join('/') || ''],
          {
            queryParams: {
              ...urlTree.queryParams,
              source: currentUrl
            }
          }
        );

        this.isInternalNavigation = true;

        // Cancel original navigation and redirect
        this.router.navigateByUrl(newUrl);
      }
    });
  }
}
