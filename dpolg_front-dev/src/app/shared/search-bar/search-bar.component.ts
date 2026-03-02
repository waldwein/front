import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
})
export class SearchBarComponent implements OnInit {
  @Output() searchChange = new EventEmitter<string>();

  constructor() {}
  ngOnInit() {}

  search(event: any) {
    const value = String(event?.detail?.value ?? event?.target?.value ?? '').trim();
    this.searchChange.emit(value);
  }
} 
