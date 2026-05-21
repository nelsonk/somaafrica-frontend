import { Directive, Input, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Directive({
  selector: '[appTrackSource]',
  standalone: true
})
export class TrackSourceDirective {

  @Input('appTrackSource') link!: string | any[];
  @Input() queryParams: any = {};

  constructor(private router: Router) {}

  @HostListener('click', ['$event'])
  onClick(event: Event) {
    event.preventDefault();

    // ✅ Get current URL at click time (this is your true "source")
    const source = this.router.url.split('?')[0];

    const currentParams = this.router.parseUrl(this.router.url).queryParams;

    const params = {
      ...currentParams,
      ...this.queryParams,
      source
    };

    // const params = {
    //   ...this.queryParams,
    //   source
    // };

    const commands = Array.isArray(this.link) ? this.link : [this.link];

    this.router.navigate(commands, { queryParams: params });
  }
}