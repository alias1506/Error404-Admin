import Swal from "sweetalert2";

export const SwalToast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  background: '#18181b',
  color: '#ffffff',
  customClass: {
    popup: 'border border-zinc-700 rounded-xl text-sm shadow-2xl !z-[999999]',
    timerProgressBar: 'bg-zinc-500',
    container: '!z-[999999]',
  },
  willOpen: (popup) => {
    const container = popup.parentElement as HTMLElement;
    if (container) {
      container.style.zIndex = '999999';
    }
  },
  didOpen: (t) => {
    t.onmouseenter = Swal.stopTimer;
    t.onmouseleave = Swal.resumeTimer;
  }
});
