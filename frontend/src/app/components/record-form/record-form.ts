import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RecordService } from '../../services/record';

@Component({
  selector: 'app-record-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './record-form.html',
})
export class RecordFormComponent {
  title = '';
  description = '';
  submitting = signal(false);
  error = signal<string | null>(null);

  constructor(private recordService: RecordService) {}

  submit() {
    if (!this.title.trim()) {
      this.error.set('Title is required');
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    this.recordService.create(this.title, this.description).subscribe({
      next: () => {
        this.title = '';
        this.description = '';
        this.submitting.set(false);
        this.recordService.refresh();
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err.message || 'Failed to create record');
      },
    });
  }
}
