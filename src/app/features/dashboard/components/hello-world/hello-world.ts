import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-hello-world',
  imports: [],
  templateUrl: './hello-world.html',
  styleUrl: './hello-world.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HelloWorld {

}
