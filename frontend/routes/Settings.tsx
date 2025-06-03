import APIKeyManager from '@/components/APIKeyForm';

export default function Settings() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full max-w-3xl pt-10 pb-44 mx-auto">
      <APIKeyManager />
    </div>
  );
}
