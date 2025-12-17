import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-setting-card',
  imports: [],
  templateUrl: './setting-card.html',
  styleUrl: './setting-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingCard {

  title = input.required<string>();
  description = input.required<string>();
  linkText = input.required<string>();
  icon = input.required<string>();

  onClick = output();
}
