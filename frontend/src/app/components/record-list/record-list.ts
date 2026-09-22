import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RecordService } from '../../services/record';

@Component({
  selector: 'app-record-list',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './record-list.html',
})
export class RecordListComponent implements OnInit {
  constructor(public recordService: RecordService) {}

  ngOnInit() {
    this.recordService.refresh();
  }
}
