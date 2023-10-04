import { SignIn } from '@clerk/nextjs';
import { FC } from 'react';

const SignInPage: FC = () => {
	return (
		<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
			<SignIn />
		</div>
	);
};

export default SignInPage;
