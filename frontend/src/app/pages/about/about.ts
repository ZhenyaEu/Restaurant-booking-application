import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../shared/components/button/button';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink, ButtonComponent],
  templateUrl: './about.html',
  styleUrl: './about.scss'
})
export class About {}
