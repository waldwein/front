import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
})
export class InputComponent implements OnInit {
  constructor() {}
  @Input() placeholder: any;
  @Input() type: any;
  @Input() label: any;
  @Input() value: any;
  @Input() errorText: any;

  @Output() inputed = new EventEmitter();

  ngOnInit() {}

  onInput(event: any){
    this.inputed.emit(event.target.value)
  }
}