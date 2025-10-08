import { useForm } from 'react-hook-form';
import { AuthService } from '../services/auth';

export function Login() {
	const { register, handleSubmit } = useForm();
	const onSubmit = async (data) => {
		const res = await AuthService.login(data);
		localStorage.setItem('token', res.token);
		window.location.href = '/';
	};
	return (
		<form className="max-w-sm space-y-3" onSubmit={handleSubmit(onSubmit)}>
			<input className="border p-2 w-full" placeholder="Email" {...register('email')} />
			<input className="border p-2 w-full" placeholder="Mật khẩu" type="password" {...register('password')} />
			<button className="bg-blue-600 text-white px-4 py-2">Đăng nhập</button>
		</form>
	);
}
