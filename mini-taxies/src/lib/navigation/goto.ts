/**
 * هذا المشروع يعتمد على `navigationStore` وليس SvelteKit أو `svelte-routing`.
 * الدالة أدناه تعمل كبديل لـ `goto` للتنقّل دون تعديل هيكل الـ HTML في `App.svelte`.
 */

import { currentRoute, type Route } from '../stores/navigationStore';

export function goto(route: Route, _options?: { replace?: boolean }): void {
  currentRoute.set(route);
}
