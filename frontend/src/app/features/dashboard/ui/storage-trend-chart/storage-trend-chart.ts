import { ChangeDetectionStrategy, Component, effect, ElementRef, input, viewChild } from '@angular/core';

import { Chart, registerables } from 'chart.js';
import { StorageTrendPoint } from '../../dashboard.models';


Chart.register(...registerables);

@Component({
  selector: 'app-storage-trend-chart',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './storage-trend-chart.html',
  styleUrl: './storage-trend-chart.css',
})
export class StorageTrendChart {
  readonly points = input.required<StorageTrendPoint[]>();

  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private chart: Chart | null = null;

  constructor() {
    effect(() => {
      const points = this.points();
      const labels = points.map(p => p.date);
      const data = points.map(p => p.cumulativeBytes / 1024 / 1024 / 1024);

      if (this.chart) {
        this.chart.data.labels = labels;
        this.chart.data.datasets[0].data = data;
        this.chart.update();
        return;
      }

      this.chart = new Chart(this.canvasRef().nativeElement, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              data,
              borderColor: '#2F5C8A',
              backgroundColor: 'rgba(47,92,138,0.08)',
              fill: true,
              tension: 0.35,
              pointRadius: 0,
              borderWidth: 2,
            },
          ],
        },
        options: {
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false } },
            y: { grid: { color: '#E4E6E2' }, ticks: { callback: (value) => `${value} GB` } },
          },
        },
      });
    });
  }



}
