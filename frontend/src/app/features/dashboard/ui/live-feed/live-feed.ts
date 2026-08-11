import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ActivityEvent } from '../../dashboard.models';

@Component({
  selector: 'app-live-feed',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './live-feed.html',
  styleUrl: './live-feed.css',
})
export class LiveFeed {

  readonly events = input.required<ActivityEvent[]>();

}
