<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import L from 'leaflet';
  import 'leaflet/dist/leaflet.css';

  export let height = "300px";
  export let lat = 33.3152; // Baghdad
  export let lng = 44.3661;
  export let zoom = 12;
  export let interactive = true;
  export let showPin = true;

  let mapElement: HTMLDivElement;
  let map: L.Map;
  let marker: L.Marker;
  const dispatch = createEventDispatcher();

  onMount(() => {
    // Standard Leaflet Icon fix for Svelte/Vite
    const DefaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41]
    });
    L.Marker.prototype.options.icon = DefaultIcon;

    map = L.map(mapElement).setView([lat, lng], zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    if (showPin) {
      marker = L.marker([lat, lng], { draggable: interactive }).addTo(map);
      
      if (interactive) {
          map.on('click', (e) => {
              const { lat, lng } = e.latlng;
              marker.setLatLng([lat, lng]);
              dispatch('locationSelected', { lat, lng });
          });

          marker.on('dragend', () => {
              const position = marker.getLatLng();
              dispatch('locationSelected', { lat: position.lat, lng: position.lng });
          });
      }
    }

    return () => {
      map.remove();
    };
  });
</script>

<div bind:this={mapElement} style="height: {height};" class="rounded-[24px] shadow-inner border-2 border-primary/10 overflow-hidden mt-4"></div>

<style>
  :global(.leaflet-control-attribution) {
    display: none !important;
  }
</style>
