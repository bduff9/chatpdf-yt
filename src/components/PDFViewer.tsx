import { FC } from 'react';

type Props = { pdf_url: string };

const PDFViewer: FC<Props> = ({ pdf_url }) => {
	return (
		<iframe
			src={`https://docs.google.com/gview?url=${pdf_url}&embedded=true`}
			className="w-full h-full"
		/>
	);
};

export default PDFViewer;
