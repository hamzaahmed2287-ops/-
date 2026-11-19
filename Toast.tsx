'use client';

interface ToastProps {
  message: string;
}

export default function Toast({ message }: ToastProps) {
  return (
    <div style={{
      position: 'fixed',
      bottom: '30px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#20232B',
      color: '#F5F2EC',
      padding: '12px 24px',
      borderRadius: '25px',
      fontWeight: '800',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 1000,
      fontSize: '0.95rem'
    }}>
      {message}
    </div>
  );
}