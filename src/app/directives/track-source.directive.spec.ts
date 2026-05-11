import { TrackSourceDirective } from './track-source.directive';
import { Router } from '@angular/router';

describe('TrackSourceDirective', () => {
  it('should create an instance', () => {
    const routerMock = {} as Router;
    const directive = new TrackSourceDirective(routerMock);
    expect(directive).toBeTruthy();
  });
});