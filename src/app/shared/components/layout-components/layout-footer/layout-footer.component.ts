import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from 'src/app/shared/pipes';
@Component({
  selector: 'app-layout-footer',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './layout-footer.component.html',
  styleUrl: './layout-footer.component.scss'
})
export class LayoutFooterComponent {

}
