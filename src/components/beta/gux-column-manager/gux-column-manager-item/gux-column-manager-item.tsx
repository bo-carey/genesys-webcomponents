import {
  Component,
  JSX,
  h,
  Element,
  State,
  Method,
  Host,
  Listen,
  Event,
  EventEmitter,
  Prop
} from '@stencil/core';

import { getIndexInParent } from '../gux-column-manager.service';
import { InternalOrderChange } from '../gux-column-manager.type';

import { getNewIndex } from './gux-column-manager-item.service';

/**
 * @slot - slot for gux-form-field-checkbox
 */
@Component({
  styleUrl: 'gux-column-manager-item.less',
  tag: 'gux-column-manager-item',
  shadow: { delegatesFocus: true }
})
export class GuxColumnManagerItem {
  @Element()
  root: HTMLElement;

  @Prop()
  orderId: string;

  @State()
  highlightActive: boolean;

  @State()
  highlight: string;

  @State()
  text: string;

  @State()
  over: 'off' | 'up' | 'down' = 'off';

  @State()
  dragging: boolean = false;

  @State()
  reordering: boolean = false;

  @Event()
  private internalorderchange: EventEmitter<InternalOrderChange>;

  @Event()
  private internalkeyboardreorderstart: EventEmitter<void>;

  @Event()
  private internalkeyboardreordermove: EventEmitter<1 | -1>;

  @Event()
  private internalkeyboarddoreorder: EventEmitter<void>;

  @Event()
  private internalkeyboardreorderfinish: EventEmitter<void>;

  // eslint-disable-next-line @typescript-eslint/require-await
  @Method('guxSetHighlight')
  async guxSetHighlight(
    highlight: string = '',
    highlightActive: boolean = false
  ): Promise<void> {
    this.highlight = highlight;
    this.highlightActive = highlightActive;
  }

  @Listen('blur')
  onBlur() {
    this.setReorderMode(false);
  }

  @Listen('dragstart')
  onDragStart(event: DragEvent) {
    this.dragging = true;
    const oldIndex = getIndexInParent(this.root);
    event.dataTransfer.setData('oldIndex', String(oldIndex));
    event.dataTransfer.effectAllowed = 'move';
  }

  @Listen('dragenter')
  onDragEnter(event: DragEvent) {
    event.dataTransfer.dropEffect = 'move';
    this.over = this.mouseOnTopHalf(event) ? 'up' : 'down';
  }

  @Listen('dragover', { passive: false })
  onDragOver(event: DragEvent) {
    event.preventDefault();

    this.over = this.mouseOnTopHalf(event) ? 'up' : 'down';
  }

  @Listen('dragleave')
  onDragLeave() {
    this.over = 'off';
  }

  @Listen('dragend')
  onDragEnd() {
    this.dragging = false;
  }

  @Listen('drop')
  onDrop(event: DragEvent) {
    const oldIndex = Number(event.dataTransfer.getData('oldIndex'));
    const dropIndex = getIndexInParent(this.root);

    event.stopPropagation(); // stops the browser from redirecting.
    event.stopImmediatePropagation();
    this.over = 'off';

    const newIndex = getNewIndex(
      oldIndex,
      dropIndex,
      this.mouseOnTopHalf(event)
    );

    this.internalorderchange.emit({ oldIndex, newIndex });

    return false;
  }

  private mouseOnTopHalf(event: MouseEvent): boolean {
    const rect = this.root.getBoundingClientRect();

    return event.clientY - rect.top <= (rect.bottom - rect.top) / 2;
  }

  private onSlotChange(): void {
    this.text = this.root.querySelector(
      'gux-form-field-checkbox label'
    ).textContent;
  }

  private setReorderMode(
    reordering: boolean,
    doReorder: boolean = false
  ): void {
    if (this.reordering !== reordering) {
      this.reordering = reordering;

      if (reordering) {
        this.internalkeyboardreorderstart.emit();
      } else {
        if (doReorder) {
          this.internalkeyboarddoreorder.emit();
        }
        this.internalkeyboardreorderfinish.emit();
      }
    }
  }

  private toggleReorderMode(): void {
    this.setReorderMode(!this.reordering, true);
  }

  private keyboardReorder(event: KeyboardEvent): void {
    if (this.reordering) {
      switch (event.key) {
        case 'ArrowUp': {
          event.preventDefault();
          this.internalkeyboardreordermove.emit(-1);
          break;
        }
        case 'ArrowDown': {
          event.preventDefault();
          this.internalkeyboardreordermove.emit(1);
          break;
        }
      }
    }
  }

  render(): JSX.Element {
    return (
      <Host draggable="true">
        <div
          class={{
            'gux-container': true,
            [`gux-over-${this.over}`]: true,
            'gux-dragging': this.dragging
          }}
        >
          <button
            class={{
              'gux-reorder': true,
              'gux-reordering': this.reordering
            }}
            type="button"
            onClick={() => this.toggleReorderMode()}
            onKeyDown={event => this.keyboardReorder(event)}
          >
            <gux-icon icon-name="grab-vertical" decorative></gux-icon>
          </button>
          <div class="gux-select">
            <slot onSlotchange={() => this.onSlotChange()}></slot>
            <gux-text-highlight
              class={{ 'gux-active': this.highlightActive }}
              highlight={this.highlight}
              text={this.text}
              strategy="contains"
            ></gux-text-highlight>
          </div>
        </div>
      </Host>
    ) as JSX.Element;
  }
}
