import Swal from 'sweetalert2';

export const showSuccessAlert = (title: string, message?: string) => {
  return Swal.fire({
    icon: 'success',
    title: title,
    text: message,
    confirmButtonColor: '#2563eb',
    confirmButtonText: 'OK',
    allowOutsideClick: false,
  });
};

export const showErrorAlert = (title: string, message?: string) => {
  return Swal.fire({
    icon: 'error',
    title: title,
    text: message,
    confirmButtonColor: '#dc2626',
    confirmButtonText: 'OK',
  });
};

export const showConfirmAlert = (title: string, message: string, confirmText = 'Ya, Hapus') => {
  return Swal.fire({
    icon: 'warning',
    title: title,
    text: message,
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',
    confirmButtonText: confirmText,
    cancelButtonText: 'Batal',
  });
};

export const showInfoAlert = (title: string, message?: string) => {
  return Swal.fire({
    icon: 'info',
    title: title,
    text: message,
    confirmButtonColor: '#2563eb',
    confirmButtonText: 'OK',
  });
};

export const showLoadingAlert = (title: string) => {
  Swal.fire({
    title: title,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

export const closeLoadingAlert = () => {
  Swal.close();
};
