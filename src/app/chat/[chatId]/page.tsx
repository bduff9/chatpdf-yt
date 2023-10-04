import ChatComponent from '@/components/ChatComponent';
import ChatSideBar from '@/components/ChatSideBar';
import PDFViewer from '@/components/PDFViewer';
import { db } from '@/lib/db';
import { chats } from '@/lib/db/schema';
import { auth } from '@clerk/nextjs';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { FC } from 'react';

type Props = {
	params: {
		chatId: string;
	};
};

const ChatPage: FC<Props> = async ({ params: { chatId } }) => {
	const { userId } = auth();

	if (!userId) {
		return redirect('/sign-in');
	}

	const _chats = await db.select().from(chats).where(eq(chats.userId, userId));

	if (!_chats) {
		return redirect('/');
	}

	const currentChat = _chats.find((chat) => chat.id === +chatId);

	if (!currentChat) {
		return redirect('/');
	}

	return (
		<div className="flex max-h-screen overflow-scroll">
			<div className="flex w-full max-h-screen overflow-scroll">
				<div className="flex-[1] max-w-xs">
					<ChatSideBar chatId={+chatId} chats={_chats} />
				</div>
				<div className="max-h-screen p-4 overflow-scroll flex-[5]">
					<PDFViewer pdf_url={currentChat.pdfUrl} />
				</div>
				<div className="flex-[3] border-l-4 border-l-slate-200">
					<ChatComponent chatId={+chatId} />
				</div>
			</div>
		</div>
	);
};

export default ChatPage;
