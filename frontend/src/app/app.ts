import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Toast],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  title = 'phpMySQLDiff';
}
