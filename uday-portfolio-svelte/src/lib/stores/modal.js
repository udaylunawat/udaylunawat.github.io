import { writable } from 'svelte/store';

export const modal = writable({
  open: false,
  type: null,     // 'project' | 'experience'
  id: null,
  title: '',
  content: ''
});

export function openModal(type, id, title = '', content = '') {
  modal.set({
    open: true,
    type,
    id,
    title,
    content
  });

  document.body.style.overflow = 'hidden';
}

export function closeModal() {
  modal.set({
    open: false,
    type: null,
    id: null,
    title: '',
    content: ''
  });

  document.body.style.overflow = '';
}