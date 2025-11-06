# Filter Drawer Component

A reusable filter drawer component that extends the base drawer with built-in clear all functionality.

## Usage

The `FilterDrawerComponent` provides a standardized way to create filter drawers across the application. It automatically handles the clear all functionality by integrating with any service that extends `AbstractServiceFilter`.

### Basic Usage

```html
<app-filter-drawer
  [(drawerVisible)]="drawerVisible"
  [filterService]="yourFilterService"
  (onShow)="onShow()"
  (onHide)="onHide()"
  (onApplyFilter)="onApplyFilter()"
>
  <!-- Your filter content goes here -->
  <div class="mb-[16px]">
    <app-base-label title="Your Filter" />
    <!-- Filter controls -->
  </div>
</app-filter-drawer>
```

### Component Properties

- `drawerVisible`: Two-way binding for controlling drawer visibility
- `filterService`: Required input that must extend `AbstractServiceFilter<IFilterBase<unknown>>`
- `onShow`: Output event when drawer opens
- `onHide`: Output event when drawer closes  
- `onApplyFilter`: Output event when save button is clicked

### Requirements

Your filter service must extend `AbstractServiceFilter` and implement:
- `showClearAll(): boolean` - Returns true when filters are active
- `clearAllFilters(): void` - Clears all active filters

### Example Integration

```typescript
@Component({
  selector: 'app-your-filter-drawer',
  imports: [FilterDrawerComponent],
  template: `
    <app-filter-drawer
      [(drawerVisible)]="drawerVisible"
      [filterService]="yourFilterService"
      (onShow)="onShow()"
      (onHide)="onHide()"
      (onApplyFilter)="onApplyFilter()"
    >
      <!-- Your filter content -->
    </app-filter-drawer>
  `
})
export class YourFilterDrawerComponent {
  drawerVisible = model<boolean>(false);
  yourFilterService = inject(YourFilterService);

  onShow() {
    // Handle drawer open
  }

  onHide() {
    // Handle drawer close
  }

  onApplyFilter() {
    // Handle filter application
  }
}
```

## Benefits

1. **Consistency**: Standardized filter drawer behavior across the application
2. **Reusability**: Single component for all filter drawers
3. **Maintainability**: Centralized clear all functionality
4. **Type Safety**: Enforces proper filter service interface
