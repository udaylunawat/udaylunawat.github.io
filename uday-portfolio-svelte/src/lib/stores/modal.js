import { writable } from 'svelte/store';

export const modal = writable({
  open: false,
  type: null,
  id: null,
  title: '',
  content: '',
  meta: null   // 👈 NEW
});

export function openModal(type, id, title, content, meta = null) {
  modal.set({
    open: true,
    type,
    id,
    title,
    content,
    meta
  });

  document.body.style.overflow = 'hidden';
}

export function closeModal() {
  modal.set({
    open: false,
    type: null,
    id: null,
    title: '',
    content: '',
    logos: []
  });

  document.body.style.overflow = '';
}