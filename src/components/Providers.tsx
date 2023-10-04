'use client';
import { FC, ReactNode } from 'react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import dynamic from 'next/dynamic';

type Props = {
	children: ReactNode;
};

const queryClient = new QueryClient();

const Toaster = dynamic(
	async () => {
		const { Toaster } = await import('react-hot-toast');
		return Toaster;
	},
	{
		ssr: false,
	}
);

const Providers: FC<Props> = ({ children }) => {
	return (
		<QueryClientProvider client={queryClient}>
			{children}
			<Toaster />
		</QueryClientProvider>
	);
};

export default Providers;
