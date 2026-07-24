import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <main class="min-h-screen bg-ink text-white flex items-center justify-center px-6">
      <div class="text-center max-w-md">
        <p class="font-mono text-signal text-sm tracking-widest">ERROR 404</p>
        <h1 class="font-display text-3xl font-semibold mt-3">This desk is empty</h1>
        <p class="text-slate-light text-sm mt-3">
          Nothing lives at this address. Check the link, or head back home.
        </p>
        <a
          routerLink="/"
          class="inline-block mt-6 bg-signal text-ink font-medium rounded-lg px-5 py-2.5 text-sm hover:opacity-90"
        >
          Back to CloudDesk
        </a>
      </div>
    </main>
  `,
})
export class NotFound {}
