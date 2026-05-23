import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { ProgressBar } from 'primeng/progressbar';
import { Divider } from 'primeng/divider';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Dialog } from 'primeng/dialog';
import { ApiService } from '../../core/services/api.service';
import { ConnectionFormComponent } from '../../shared/components/connection-form/connection-form.component';
import { SqlViewerComponent } from '../../shared/components/sql-viewer/sql-viewer.component';
import { DiffTableComponent } from '../../shared/components/diff-table/diff-table.component';
import {
  DbConnection, CompareResult, SectionSummary,
  TableDiff, SimpleObjectDiff, ConnectionTestResult
} from '../../core/models/schema.model';

@Component({
  selector: 'app-compare',
  standalone: true,
  imports: [
    CommonModule, FormsModule, Button, Checkbox, Tabs, TabList, Tab, TabPanels, TabPanel,
    ProgressBar, Divider, ConfirmDialog, Dialog,
    ConnectionFormComponent, SqlViewerComponent, DiffTableComponent
  ],
  templateUrl: './compare.component.html',
  styleUrl: './compare.component.scss'
})
export class CompareComponent {
  originConn: DbConnection = { host: 'localhost', port: 3306, dbname: '', user: 'root', password: '' };
  destConn:   DbConnection = { host: 'localhost', port: 3306, dbname: '', user: 'root', password: '' };

  originFormRef!: ConnectionFormComponent;
  destFormRef!:   ConnectionFormComponent;

  originOk  = false;
  destOk    = false;
  comparing = false;
  executingScript = false;
  ignoreFks = true;
  activeTab = 'tables';
  showScriptDialog = false;
  result: CompareResult | null = null;

  constructor(
    private api: ApiService,
    private msg: MessageService,
    private confirm: ConfirmationService
  ) {}

  get canCompare() { return !!this.originConn.dbname && !!this.destConn.dbname && !this.comparing; }

  onOriginChanged(c: DbConnection)           { this.originConn = c; }
  onDestChanged(c: DbConnection)             { this.destConn   = c; }
  onOriginTestResult(r: ConnectionTestResult | null) { this.originOk = !!r?.success; }
  onDestTestResult(r: ConnectionTestResult | null)   { this.destOk   = !!r?.success; }

  onOriginFormReady(ref: ConnectionFormComponent) { this.originFormRef = ref; }
  onDestFormReady(ref: ConnectionFormComponent)   { this.destFormRef = ref; }

  onTestRequested(side: 'origin' | 'dest', conn: DbConnection) {
    this.api.testConnection(conn).subscribe({
      next: res => {
        if (side === 'origin') this.originFormRef?.setTestResult(res);
        else                   this.destFormRef?.setTestResult(res);
        if (res.success) this.msg.add({ severity: 'success', summary: 'Conectado', detail: `${conn.dbname} @ MySQL ${res.version}`, life: 3000 });
        else             this.msg.add({ severity: 'error',   summary: 'Falló la conexión', detail: res.message, life: 5000 });
      },
      error: () => {
        const err = { success: false, version: null, message: 'Error de red' };
        if (side === 'origin') this.originFormRef?.setTestResult(err);
        else                   this.destFormRef?.setTestResult(err);
      }
    });
  }

  onIgnoreFksChanged() {
    if (this.result) {
      this.compare();
    }
  }

  compare() {
    if (!this.canCompare) return;
    this.comparing = true;
    this.result    = null;
    this.activeTab = 'tables';

    this.api.compare(this.originConn, this.destConn, this.ignoreFks).subscribe({
      next: res => {
        this.result    = res;
        this.comparing = false;
        const n = res.summary.total_changes;
        this.msg.add({
          severity: n === 0 ? 'success' : 'info',
          summary:  n === 0 ? 'Las bases de datos son idénticas' : `${n} diferencia(s) encontrada(s)`,
          life: 4000
        });
      },
      error: err => {
        this.comparing = false;
        this.msg.add({ severity: 'error', summary: 'Falló la comparación', detail: err.error?.error ?? 'Error desconocido', life: 6000 });
      }
    });
  }

  downloadScript() {
    if (!this.result) return;
    const blob = new Blob([this.result.script], { type: 'text/plain' });
    const a    = document.createElement('a');
    a.href     = URL.createObjectURL(blob);
    a.download = `migration_${this.destConn.dbname}_${new Date().toISOString().slice(0,10)}.sql`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  copyScript() {
    if (!this.result) return;
    navigator.clipboard.writeText(this.result.script).then(() => {
      this.msg.add({ severity: 'success', summary: 'Copiado', detail: 'Script de migración copiado al portapapeles', life: 2000 });
    });
  }

  confirmAndExecuteScript() {
    if (!this.result || this.executingScript) return;

    this.confirm.confirm({
      message: `¡CUIDADO! Estás a punto de ejecutar el script de migración en la base de datos destino (${this.destConn.dbname}). Esto puede modificar la estructura, eliminar datos y/o alterar tablas de forma irreversible. ¿Estás consciente del riesgo de pérdida de datos o cambio estructural y deseas continuar?`,
      header: 'Confirmar Ejecución de Script SQL',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { severity: 'danger', label: 'Sí, Ejecutar Script' },
      rejectButtonProps: { severity: 'secondary', label: 'Cancelar' },
      accept: () => this.runScriptOnDestination()
    });
  }

  private runScriptOnDestination() {
    this.executingScript = true;
    this.api.executeScript(this.destConn, this.result!.script).subscribe({
      next: (res) => {
        this.executingScript = false;
        this.msg.add({
          severity: 'success',
          summary: 'Ejecución exitosa',
          detail: `Se ejecutaron ${res.executed_statements} sentencias en la base de datos destino con éxito.`,
          life: 6000
        });
        this.compare();
      },
      error: (err) => {
        this.executingScript = false;
        this.msg.add({
          severity: 'error',
          summary: 'Fallo en la ejecución',
          detail: err.error?.error ?? 'Ocurrió un error inesperado al ejecutar el script.',
          life: 8000
        });
      }
    });
  }

  asTableDiffs(obj: Record<string, any>): TableDiff[] {
    return Object.values(obj);
  }
  asSimpleDiffs(obj: Record<string, any>): SimpleObjectDiff[] {
    return Object.values(obj);
  }

  getSec(section: string): SectionSummary {
    return this.result!.summary[section] as SectionSummary;
  }

  summaryClass(n: number, type: 'added' | 'removed' | 'modified'): string {
    if (n === 0) return 'metric-zero';
    return `metric-${type}`;
  }
}
