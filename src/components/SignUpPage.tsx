import React, { FormEvent, useState } from 'react';
import { Lock, Mail, User, UserRoundCheck, UserRoundPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SignUpPageProps {
  onSignIn: () => void;
}

type SignUpFormData = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreedToTerms: boolean;
};

const initialFormData: SignUpFormData = {
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreedToTerms: false,
};

export const SignUpPage: React.FC<SignUpPageProps> = ({ onSignIn }) => {
  const [formData, setFormData] = useState<SignUpFormData>(initialFormData);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof SignUpFormData, value: string | boolean) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.username.trim() ||
      !formData.email.trim() ||
      !formData.password.trim()
    ) {
      setMessage('필수 정보를 모두 입력해주세요.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (!formData.agreedToTerms) {
      setMessage('약관에 동의한 후 가입할 수 있습니다.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    const { data, error } = await supabase.auth.signUp({
      email: formData.email.trim(),
      password: formData.password,
      options: {
        data: {
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          username: formData.username.trim(),
        },
      },
    });

    if (error) {
      setMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    if (data.session && data.user) {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
      });

      if (profileError) {
        setMessage(profileError.message);
        setIsSubmitting(false);
        return;
      }
    }

    setFormData(initialFormData);
    setMessage(
      data.session
        ? '회원가입이 완료되었습니다. 바로 로그인되었습니다.'
        : '회원가입이 완료되었습니다. 이메일 인증을 확인해주세요.',
    );
    setIsSubmitting(false);
  };

  return (
    <main className="min-h-screen bg-[#ff6666] bg-[radial-gradient(circle_at_1px_1px,rgba(185,28,28,0.22)_1px,transparent_0)] bg-[length:34px_34px] px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <section className="mx-auto flex min-h-[78vh] w-full max-w-6xl items-center justify-center rounded-lg bg-white shadow-2xl">
        <div className="grid w-full grid-cols-1 overflow-hidden rounded-lg lg:grid-cols-[1fr_0.95fr]">
          <div className="hidden items-center justify-center px-8 py-12 lg:flex">
            <div className="relative h-[460px] w-full max-w-md">
              <div className="absolute left-12 top-24 h-48 w-36 rounded-t-[56px] bg-[#e5f4ff]" />
              <div className="absolute left-24 top-10 h-64 w-16 rounded bg-[#6bb7ff]" />
              <div className="absolute left-40 top-4 h-72 w-16 rounded bg-[#7cc1ff]" />
              <div className="absolute left-28 top-52 h-28 w-12 -rotate-12 rounded-full border-l-[10px] border-[#79caff]" />
              <div className="absolute left-36 top-40 h-36 w-24 rounded bg-[#5ca4ff] shadow-xl" />
              <div className="absolute left-40 top-48 h-24 w-16 rounded bg-[#bfe7ff]" />
              <div className="absolute left-8 top-[27rem] h-3 w-36 rounded-full bg-[#add8ff]" />

              <div className="absolute left-16 top-6 h-72 w-24">
                <div className="absolute left-0 top-[13.5rem] h-44 w-14 origin-top -rotate-3 rounded-b-full bg-[#3431c8]" />
                <div className="absolute left-14 top-[13.5rem] h-44 w-14 origin-top rotate-3 rounded-b-full bg-[#4240df]" />
                <div className="absolute left-7 top-28 h-36 w-20 rounded-b-[40px] rounded-t-[28px] bg-[#eaf7ff]" />
                <div className="absolute left-11 top-16 h-16 w-12 rounded-t-full bg-[#4110a0]" />
                <div className="absolute left-[7.5rem] top-[5.5rem] h-16 w-6 rounded-full bg-[#ff916d]" />
                <div className="absolute left-40 top-[6.75rem] h-5 w-5 rounded-full bg-[#ff916d]" />
                <div className="absolute left-40 top-[30.25rem] h-5 w-7 rounded-full bg-[#ff916d]" />
                <div className="absolute left-16 top-[69px] h-10 w-9 rounded-r-full bg-[#ffb088]" />
                <div className="absolute left-[6.5rem] top-[68px] h-10 w-5 rounded-r-lg bg-[#42108e]" />
              </div>

              <div className="absolute left-36 top-[17.5rem] h-16 w-32 rounded bg-[#1d3092] p-4 shadow-lg">
                <div className="mb-3 h-1.5 w-20 rounded-full bg-white/80" />
                <div className="h-1.5 w-28 rounded-full bg-white/55" />
              </div>
              <div className="absolute left-64 top-[32.5rem] h-24 w-28 rounded bg-[#16d7d1] p-4 shadow-lg">
                <div className="mb-3 h-1.5 w-20 rounded-full bg-white/80" />
                <div className="mb-3 h-1.5 w-16 rounded-full bg-white/60" />
                <div className="h-1.5 w-24 rounded-full bg-white/60" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center px-6 py-10 sm:px-10">
            <form onSubmit={handleSubmit} className="w-full max-w-md">
              <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-slate-900">
                회원가입
              </h1>

              <div className="space-y-4">
                <label className="relative block">
                  <UserRoundPlus className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-900" />
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(event) => updateField('firstName', event.target.value)}
                    placeholder="이름을 입력하세요"
                    className="h-12 w-full rounded border border-slate-400 bg-white pl-12 pr-4 text-sm outline-none transition focus:border-[#FF5252] focus:ring-2 focus:ring-[#FF5252]/20"
                  />
                </label>

                <label className="relative block">
                  <UserRoundCheck className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-900" />
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(event) => updateField('lastName', event.target.value)}
                    placeholder="성을 입력하세요"
                    className="h-12 w-full rounded border border-slate-400 bg-white pl-12 pr-4 text-sm outline-none transition focus:border-[#FF5252] focus:ring-2 focus:ring-[#FF5252]/20"
                  />
                </label>

                <label className="relative block">
                  <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-900" />
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(event) => updateField('username', event.target.value)}
                    placeholder="사용자 이름을 입력하세요"
                    className="h-12 w-full rounded border border-slate-400 bg-white pl-12 pr-4 text-sm outline-none transition focus:border-[#FF5252] focus:ring-2 focus:ring-[#FF5252]/20"
                  />
                </label>

                <label className="relative block">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-900" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(event) => updateField('email', event.target.value)}
                    placeholder="이메일을 입력하세요"
                    className="h-12 w-full rounded border border-slate-400 bg-white pl-12 pr-4 text-sm outline-none transition focus:border-[#FF5252] focus:ring-2 focus:ring-[#FF5252]/20"
                  />
                </label>

                <label className="relative block">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-900" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(event) => updateField('password', event.target.value)}
                    placeholder="비밀번호를 입력하세요"
                    className="h-12 w-full rounded border border-slate-400 bg-white pl-12 pr-4 text-sm outline-none transition focus:border-[#FF5252] focus:ring-2 focus:ring-[#FF5252]/20"
                  />
                </label>

                <label className="relative block">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-900" />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(event) => updateField('confirmPassword', event.target.value)}
                    placeholder="비밀번호를 다시 입력하세요"
                    className="h-12 w-full rounded border border-slate-400 bg-white pl-12 pr-4 text-sm outline-none transition focus:border-[#FF5252] focus:ring-2 focus:ring-[#FF5252]/20"
                  />
                </label>
              </div>

              <label className="mt-5 flex items-center gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.agreedToTerms}
                  onChange={(event) => updateField('agreedToTerms', event.target.checked)}
                  className="h-4 w-4 rounded border-slate-400 accent-[#FF5252]"
                />
                이용약관에 동의합니다
              </label>

              {message && (
                <p
                  className={`mt-3 text-sm font-medium ${
                    message.includes('완료') ? 'text-emerald-600' : 'text-[#FF5252]'
                  }`}
                >
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-4 rounded bg-[#ff7a7a] px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#FF5252] focus:outline-none focus:ring-2 focus:ring-[#FF5252]/30"
              >
                {isSubmitting ? '가입 중...' : '가입하기'}
              </button>

              <p className="mt-5 text-sm text-slate-700">
                이미 계정이 있으신가요?{' '}
                <button
                  type="button"
                  onClick={onSignIn}
                  className="font-medium text-sky-600 hover:text-sky-700 hover:underline"
                >
                  로그인
                </button>
              </p>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
};
