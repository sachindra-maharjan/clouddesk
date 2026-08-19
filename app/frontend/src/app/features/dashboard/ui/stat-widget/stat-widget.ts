import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-stat-widget',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stat-widget.html',
  styleUrl: './stat-widget.css',
})
export class StatWidget {

  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly hint = input<string>();
  readonly hintColor = input<'success' | 'signal' | 'slate'>('slate');
}
