import { loginWithGoogle } from '../lib/firebase';
import { LogIn } from 'lucide-react';

export default function Login() {
  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">ระบบจัดลำดับกระทู้ถาม</h1>
        <p className="text-slate-500 mb-8 font-medium">วุฒิสภา (Senate Question Ranking)</p>
        
        <button
          onClick={loginWithGoogle}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md font-medium transition-colors shadow-sm"
        >
          <LogIn className="w-5 h-5" />
          เข้าสู่ระบบด้วย Google
        </button>
      </div>
    </div>
  );
}
