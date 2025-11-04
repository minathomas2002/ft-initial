import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DashboardView } from "./features/dashboard/pages/dashboard-view/dashboard-view";
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,ToastModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('benaa');
}
