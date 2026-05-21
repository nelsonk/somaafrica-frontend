import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterOutlet } from '@angular/router';

import { ProfileLayoutComponent } from './profile-layout.component';


@Component({
  selector: 'app-profile',
  standalone: true,
  template: ''
})
class MockProfileComponent {}

describe('ProfileLayoutComponent', () => {
  let component: ProfileLayoutComponent;
  let fixture: ComponentFixture<ProfileLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileLayoutComponent],
      providers: [provideRouter([])]
    })
    .overrideComponent(ProfileLayoutComponent, {
      set: {
        imports: [RouterOutlet, MockProfileComponent] // ✅ include mock here
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
