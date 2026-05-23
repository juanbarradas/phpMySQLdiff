import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import hljs from 'highlight.js/lib/core';
import sql from 'highlight.js/lib/languages/sql';

hljs.registerLanguage('sql', sql);

@Component({
  selector: 'app-sql-viewer',
  standalone: true,
  imports: [CommonModule, ButtonModule, TooltipModule],
  template: `
    <div class="sql-viewer">
      <div class="sql-toolbar">
        <span class="sql-label"><i class="pi pi-code"></i> Script SQL de Migración</span>
        <div class="toolbar-actions">
          <p-button icon="pi pi-copy" label="Copiar" size="small" severity="secondary"
                    (onClick)="copy()" [pTooltip]="copyTooltip" tooltipPosition="top" />
          <p-button icon="pi pi-download" label="Descargar .sql" size="small" severity="secondary"
                    (onClick)="download()" pTooltip="Descargar como archivo .sql" tooltipPosition="top" />
          @if (showExecuteButton) {
            <p-button icon="pi pi-play" label="Ejecutar en Destino" size="small" severity="danger"
                      [loading]="executing" (onClick)="executeRequested.emit()"
                      pTooltip="Ejecutar script en base de datos destino" tooltipPosition="top" />
          }
        </div>
      </div>
      <div class="sql-scroll">
        <pre><code #codeEl class="language-sql">{{ code }}</code></pre>
      </div>
    </div>
  `,
  styleUrl: './sql-viewer.component.scss'
})
export class SqlViewerComponent implements OnChanges, AfterViewInit {
  @Input() code = '';
  @Input() showExecuteButton = false;
  @Input() executing = false;
  @Output() executeRequested = new EventEmitter<void>();

  @ViewChild('codeEl') codeEl!: ElementRef<HTMLElement>;
  copyTooltip = 'Copiar al portapapeles';

  ngAfterViewInit() { this.highlight(); }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['code'] && this.codeEl) {
      setTimeout(() => this.highlight(), 0);
    }
  }

  private highlight() {
    if (!this.codeEl) return;
    const el = this.codeEl.nativeElement;
    el.removeAttribute('data-highlighted');
    hljs.highlightElement(el);
  }

  copy() {
    navigator.clipboard.writeText(this.code).then(() => {
      this.copyTooltip = '¡Copiado!';
      setTimeout(() => this.copyTooltip = 'Copiar al portapapeles', 2000);
    });
  }

  download() {
    const blob = new Blob([this.code], { type: 'text/plain' });
    const a    = document.createElement('a');
    a.href     = URL.createObjectURL(blob);
    a.download = `migration_${new Date().toISOString().slice(0,10)}.sql`;
    a.click();
    URL.revokeObjectURL(a.href);
  }
}
