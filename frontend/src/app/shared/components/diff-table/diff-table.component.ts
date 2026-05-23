import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { Accordion, AccordionPanel, AccordionHeader, AccordionContent } from 'primeng/accordion';
import { TableDiff, SimpleObjectDiff, DiffStatus } from '../../../core/models/schema.model';

type AnyDiff = TableDiff | SimpleObjectDiff;

@Component({
  selector: 'app-diff-table',
  standalone: true,
  imports: [CommonModule, TableModule, Accordion, AccordionPanel, AccordionHeader, AccordionContent],
  templateUrl: './diff-table.component.html',
  styleUrl: './diff-table.component.scss'
})
export class DiffTableComponent {
  @Input() items: AnyDiff[] = [];
  @Input() type: 'table' | 'simple' = 'simple';
  @Input() emptyMessage = 'No se encontraron diferencias';

  get filtered() {
    return this.items.filter(i => i.status !== 'equal');
  }

  severity(status: DiffStatus): string {
    return { added: 'success', removed: 'danger', modified: 'warn', equal: 'secondary' }[status] ?? 'secondary';
  }

  label(status: DiffStatus): string {
    return { added: 'Añadido', removed: 'Eliminado', modified: 'Modificado', equal: 'Igual' }[status] ?? status;
  }

  isTable(item: AnyDiff): item is TableDiff {
    return 'changes' in item;
  }

  changeIcon(action: string): string {
    return { added: 'pi-plus-circle', removed: 'pi-minus-circle', modified: 'pi-pencil' }[action] ?? 'pi-circle';
  }

  changeColor(action: string): string {
    return { added: 'var(--added-color)', removed: 'var(--removed-color)', modified: 'var(--modified-color)' }[action] ?? '';
  }
}
