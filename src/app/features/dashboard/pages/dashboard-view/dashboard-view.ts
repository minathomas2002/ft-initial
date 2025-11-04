import { Component, inject } from '@angular/core';
import { HelloWorld } from '../../components/hello-world/hello-world';
import { HelloWorldService } from '../../services/hello-world';
import { HelloWorldGreeter } from '../../class/hello-world';

@Component({
  selector: 'app-dashboard-view',
  imports: [HelloWorld],
  templateUrl: './dashboard-view.html',
  styleUrl: './dashboard-view.scss',
  providers:[HelloWorldService]
})
export class DashboardView {
  private helloWorldService = inject(HelloWorldService);
  protected helloWorld = new HelloWorldGreeter('John');
}
