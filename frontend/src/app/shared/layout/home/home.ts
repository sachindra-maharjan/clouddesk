import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  template: `
    <main class="min-h-screen bg-ink text-white flex items-center justify-center px-6">
      <div class="text-center max-w-md">
        <p class="font-mono text-signal text-sm tracking-widest">SCAFFOLD READY</p>
        <h1 class="font-display text-3xl font-semibold mt-3">CloudDesk</h1>
        <p class="text-slate-light text-sm mt-3">
          Frontend and backend are wired. Features are added one at a time,
          starting with authentication.
        </p>
      </div>
    </main>
  `,
})
export class Home { }
