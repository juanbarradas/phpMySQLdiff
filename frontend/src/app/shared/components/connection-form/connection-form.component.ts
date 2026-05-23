import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { Button } from 'primeng/button';
import { InputNumber } from 'primeng/inputnumber';
import { Tag } from 'primeng/tag';
import { DbConnection, ConnectionTestResult } from '../../../core/models/schema.model';

@Component({
  selector: 'app-connection-form',
  standalone: true,
  imports: [CommonModule, FormsModule, InputText, Password, Button, InputNumber, Tag],
  templateUrl: './connection-form.component.html',
  styleUrl: './connection-form.component.scss'
})
export class ConnectionFormComponent implements OnInit {
  @Input() label = 'Database';
  @Input() icon  = 'pi-database';
  @Input() colorClass = 'origin';

  @Output() connectionChanged = new EventEmitter<DbConnection>();
  @Output() testResult        = new EventEmitter<ConnectionTestResult | null>();
  @Output() testRequested     = new EventEmitter<DbConnection>();
  @Output() formReady         = new EventEmitter<ConnectionFormComponent>();

  conn: DbConnection = { host: 'localhost', port: 3306, dbname: '', user: 'root', password: '' };

  testStatus: 'idle' | 'testing' | 'ok' | 'error' = 'idle';
  testMessage = '';
  testVersion = '';

  ngOnInit() {
    this.connectionChanged.emit(this.conn);
    this.formReady.emit(this);
  }

  onFieldChange() {
    this.testStatus = 'idle';
    this.testResult.emit(null);
    this.connectionChanged.emit(this.conn);
  }

  triggerTest() {
    this.testStatus = 'testing';
    this.testRequested.emit({ ...this.conn });
  }

  setTestResult(result: ConnectionTestResult) {
    this.testStatus  = result.success ? 'ok' : 'error';
    this.testMessage = result.message;
    this.testVersion = result.version ?? '';
    this.testResult.emit(result);
  }
}
