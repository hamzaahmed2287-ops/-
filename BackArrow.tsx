'use client';
import { useRouter } from 'next/navigation';

export default function BackArrow() {
  const router = useRouter();
  return (
    <button onClick={() => router.back()} style={{
      backgroundColor: '#FFFFFF', border: '1px solid #DAD8D2', borderRadius: '50%',
      width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', marginBottom: '20px', fontWeight: 'bold', fontSize: '1.2rem', color: '#20232B'
    }}>
      ←
    </button>
  );
}