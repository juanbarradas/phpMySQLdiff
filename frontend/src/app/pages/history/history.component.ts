import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Tag } from 'primeng/tag';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { Tooltip } from 'primeng/tooltip';
import { ApiService } from '../../core/services/api.service';
import { SqlViewerComponent } from '../../shared/components/sql-viewer/sql-viewer.component';
import { DiffTableComponent } from '../../shared/components/diff-table/diff-table.component';
import { HistoryItem, HistoryDetail, TableDiff, SimpleObjectDiff } from '../../core/models/schema.model';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    CommonModule, TableModule, Button, Dialog, ConfirmDialog,
    Tabs, TabList, Tab, TabPanels, TabPanel, Tooltip,
    SqlViewerComponent, DiffTableComponent
  ],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss'
})
export class HistoryComponent {
  @ViewChild('detailDialog') detailDialog!: Dialog;

  items: HistoryItem[] = [];
  total = 0;
  loading = true;

  detailVisible = false;
  detail: HistoryDetail | null = null;
  detailLoading = false;

  constructor(
    private api: ApiService,
    private msg: MessageService,
    private confirm: ConfirmationService,
    private cdr: ChangeDetectorRef
  ) {}

  // ngOnInit removed because onLazyLoad triggers the initial load automatically.

  load(offset: number) {
    this.loading = true;
    this.api.getHistory(20, offset).subscribe({
      next: r => { 
        this.items = r.items; 
        this.total = r.total; 
        this.loading = false; 
        this.cdr.detectChanges();
      },
      error: () => { 
        this.loading = false; 
        this.msg.add({ severity: 'error', summary: 'Error al cargar el historial' }); 
        this.cdr.detectChanges();
      }
    });
  }

  viewDetail(item: HistoryItem) {
    this.detailVisible = true;
    this.detail        = null;
    this.detailLoading = true;

    // Asegurar que la ventana se abra maximizada
    setTimeout(() => {
      if (this.detailDialog && !(this.detailDialog as any).maximized) {
        this.detailDialog.maximize();
      }
    });

    this.api.getHistoryEntry(item.id).subscribe({
      next: d => { this.detail = d; this.detailLoading = false; },
      error: () => { this.detailLoading = false; this.msg.add({ severity: 'error', summary: 'No se pudo cargar el detalle' }); }
    });
  }

  confirmDelete(item: HistoryItem) {
    this.confirm.confirm({
      message: `¿Eliminar comparación #${item.id} (${item.origin_db} vs ${item.dest_db})?`,
      header: 'Eliminar entrada del historial',
      icon: 'pi pi-trash',
      acceptButtonProps: { severity: 'danger', label: 'Eliminar' },
      rejectButtonProps: { severity: 'secondary', label: 'Cancelar' },
      accept: () => this.deleteEntry(item.id)
    });
  }

  private deleteEntry(id: number) {
    this.api.deleteHistoryEntry(id).subscribe({
      next: () => {
        this.items = this.items.filter(i => i.id !== id);
        this.msg.add({ severity: 'success', summary: 'Eliminado', life: 3000 });
      },
      error: () => this.msg.add({ severity: 'error', summary: 'Falló la eliminación' })
    });
  }

  downloadItemScript(item: HistoryItem) {
    this.api.getHistoryEntry(item.id).subscribe({
      next: d => {
        const blob = new Blob([d.script], { type: 'text/plain' });
        const a    = document.createElement('a');
        a.href     = URL.createObjectURL(blob);
        a.download = `migration_${d.origin_db}_to_${d.dest_db}_${d.created_at.replace(/[: ]/g, '_')}.sql`;
        a.click();
        URL.revokeObjectURL(a.href);
        this.msg.add({ severity: 'success', summary: 'Descargado', detail: 'Script de migración descargado', life: 2000 });
      },
      error: () => this.msg.add({ severity: 'error', summary: 'No se pudo cargar el script' })
    });
  }

  asTableDiffs(obj: Record<string, any>): TableDiff[] {
    return obj ? Object.values(obj) : [];
  }
  asSimpleDiffs(obj: Record<string, any>): SimpleObjectDiff[] {
    return obj ? Object.values(obj) : [];
  }

  onLazyLoad(event: any) { 
    setTimeout(() => this.load(event.first ?? 0), 0); 
  }
}
