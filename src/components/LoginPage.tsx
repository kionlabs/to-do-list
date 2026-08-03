import React, { FormEvent, useState } from 'react';
import { Lock, User } from 'lucide-react';

interface LoginPageProps {
  onLogin: (email: string, password: string, rememberMe: boolean) => Promise<string | null>;
  onCreateAccount: () => void;
}

type LoginFormData = {
  email: string;
  password: string;
  rememberMe: boolean;
};

const initialLoginForm: LoginFormData = {
  email: '',
  password: '',
  rememberMe: false,
};

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onCreateAccount }) => {
  const [formData, setFormData] = useState<LoginFormData>(initialLoginForm);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof LoginFormData, value: string | boolean) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.email.trim() || !formData.password.trim()) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    const loginError = await onLogin(
      formData.email.trim(),
      formData.password,
      formData.rememberMe,
    );
    if (loginError) {
      setError(loginError);
    }
    setIsSubmitting(false);
  };

  return (
    <main className="min-h-screen bg-[#ff6666] bg-[radial-gradient(circle_at_1px_1px,rgba(185,28,28,0.2)_1px,transparent_0)] bg-[length:34px_34px] px-4 py-8 text-slate-900 sm:px-8">
      <section className="mx-auto flex min-h-[76vh] w-full max-w-7xl items-center rounded-xl bg-white px-6 py-10 shadow-2xl sm:px-10 lg:px-14">
        <div className="grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <form onSubmit={handleSubmit} className="w-full max-w-xl">
            <h1 className="mb-8 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              로그인
            </h1>

            <div className="space-y-6">
              <label className="relative block">
                <User className="pointer-events-none absolute left-5 top-1/2 h-7 w-7 -translate-y-1/2 fill-slate-900 text-slate-900" />
                <input
                  type="text"
                  value={formData.email}
                  onChange={(event) => updateField('email', event.target.value)}
                  placeholder="이메일을 입력하세요"
                  className="h-16 w-full rounded-lg border border-slate-500 bg-white pl-20 pr-5 text-xl text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#FF5252] focus:ring-2 focus:ring-[#FF5252]/20"
                />
              </label>

              <label className="relative block">
                <Lock className="pointer-events-none absolute left-5 top-1/2 h-7 w-7 -translate-y-1/2 fill-slate-900 text-slate-900" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(event) => updateField('password', event.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  className="h-16 w-full rounded-lg border border-slate-500 bg-white pl-20 pr-5 text-xl text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#FF5252] focus:ring-2 focus:ring-[#FF5252]/20"
                />
              </label>
            </div>

            <label className="mt-7 flex items-center gap-7 text-xl font-medium text-slate-800">
              <input
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(event) => updateField('rememberMe', event.target.checked)}
                className="h-5 w-5 rounded border-slate-500 accent-[#FF5252]"
              />
              로그인 상태 유지
            </label>

            {error && <p className="mt-4 text-sm font-semibold text-[#FF5252]">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-8 rounded-md bg-[#ff858b] px-12 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-[#FF5252] focus:outline-none focus:ring-2 focus:ring-[#FF5252]/30"
            >
              {isSubmitting ? '로그인 중...' : '로그인'}
            </button>

            <div className="mt-20 space-y-4 text-xl text-slate-800">
              <div className="flex flex-wrap items-center gap-4">
                <span>다른 계정으로 로그인</span>
                <button
                  type="button"
                  aria-label="Facebook으로 로그인"
                  className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#4267B2] text-2xl font-bold text-white"
                >
                  f
                </button>
                <button
                  type="button"
                  aria-label="Google로 로그인"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-2xl font-bold shadow-sm ring-1 ring-slate-200"
                >
                  <span className="text-[#4285F4]">G</span>
                </button>
                <button
                  type="button"
                  aria-label="X로 로그인"
                  className="flex h-8 w-8 items-center justify-center rounded-sm bg-black text-xl font-bold text-white"
                >
                  X
                </button>
              </div>
              <p>
                계정이 없으신가요?{' '}
                <button
                  type="button"
                  onClick={onCreateAccount}
                  className="font-medium text-sky-600 hover:text-sky-700 hover:underline"
                >
                  회원가입
                </button>
              </p>
            </div>
          </form>

          <div className="hidden justify-center lg:flex">
            <div className="relative h-[520px] w-full max-w-2xl">
              <div className="absolute bottom-0 left-14 h-[430px] w-[520px] rounded-[48%] bg-slate-100" />
              <div className="absolute bottom-10 left-40 h-[460px] w-64 rounded-2xl bg-[#497fd8] shadow-xl" />
              <div className="absolute bottom-10 left-36 h-[460px] w-64 rounded-xl bg-[#6aa3f1]" />
              <div className="absolute bottom-28 left-52 h-80 w-40 bg-white" />
              <div className="absolute bottom-[4.25rem] left-80 h-11 w-11 rounded-full bg-[#4f82d9]" />
              <div className="absolute left-[15.5rem] top-14 h-1.5 w-[4.5rem] rounded-full bg-[#437cd2]" />
              <div className="absolute left-[19.5rem] top-14 h-1.5 w-1.5 rounded-full bg-[#437cd2]" />
              <div className="absolute left-72 top-28 flex h-16 w-16 items-center justify-center rounded-full bg-[#a8d99f] text-5xl font-bold text-white">
                ✓
              </div>
              <div className="absolute bottom-36 left-60 h-24 w-36 rounded-md bg-[#65a2f1]" />
              <div className="absolute bottom-60 left-60 h-4 w-36 rounded-t-md bg-[#3265b8]" />
              <div className="absolute bottom-48 left-[16.5rem] h-3 w-20 rounded bg-[#a7cfff]" />
              <div className="absolute bottom-[10.75rem] left-[16.5rem] h-3 w-24 rounded bg-[#7fb8f5]" />
              <div className="absolute bottom-[9.5rem] left-[16.5rem] h-3 w-24 rounded bg-[#7fb8f5]" />
              <div className="absolute bottom-[10.25rem] left-[15.75rem] h-5 w-5 rounded bg-[#a7cfff]" />

              <div className="absolute bottom-8 right-[4.5rem] h-44 w-56 rounded-[58%_42%_42%_58%] bg-[#a36af0]" />
              <div className="absolute bottom-24 right-14 h-64 w-40 rounded-full bg-[#ff7797]" />
              <div className="absolute bottom-4 right-[8.5rem] h-64 w-16 rounded-b-full bg-[#184a91]" />
              <div className="absolute bottom-4 right-20 h-64 w-16 rounded-b-full bg-[#214f9b]" />
              <div className="absolute right-[6.5rem] top-40 h-40 w-20 rounded-b-[36px] rounded-t-[28px] bg-[#4a4f9f]" />
              <div className="absolute right-28 top-24 h-20 w-16 rounded-full bg-[#ffb16d]" />
              <div className="absolute right-32 top-[4.5rem] h-14 w-16 rounded-full bg-[#173b76]" />
              <div className="absolute right-[5.5rem] top-[8.5rem] h-20 w-9 rotate-12 rounded-full bg-[#ffb16d]" />
              <div className="absolute right-16 top-[10.5rem] h-9 w-7 rounded bg-[#203e95]" />
              <div className="absolute bottom-0 right-[9.75rem] h-5 w-16 rounded-full bg-[#193270]" />
              <div className="absolute bottom-0 right-12 h-5 w-16 rounded-full bg-[#193270]" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
