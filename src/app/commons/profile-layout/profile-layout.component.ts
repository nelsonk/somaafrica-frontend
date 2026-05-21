import { Component } from '@angular/core';
import { ProfileComponent } from '../../components/user/profile/profile.component';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-profile-layout',
    imports: [ProfileComponent, RouterOutlet],
    templateUrl: './profile-layout.component.html',
    styleUrl: './profile-layout.component.css'
})
export class ProfileLayoutComponent {

}
