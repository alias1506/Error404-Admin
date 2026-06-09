import Swal from "sweetalert2";

export const CustomSwal = Swal.mixin({
  background: "#18181b",
  color: "#ffffff",
  customClass: {
    popup: 'rounded-3xl border border-white/10 shadow-2xl bg-[#18181b]',
    title: 'text-xl font-bold text-white',
    htmlContainer: 'text-gray-400',
    confirmButton: 'bg-error-500 hover:bg-error-600 text-white px-6 py-2.5 rounded-xl font-medium transition-colors mr-3 shadow-lg shadow-error-500/20',
    cancelButton: 'bg-white/5 hover:bg-white/10 text-gray-300 px-6 py-2.5 rounded-xl font-medium transition-colors'
  },
  buttonsStyling: false
});
