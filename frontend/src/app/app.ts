import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MessageService } from './core/messages/message.service';

// Root layout: header, last API error and the current screen.
@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly messages = inject(MessageService);
}
