import {
	Pinecone,
	// Vector,
	// utils as PineconeUtils,
	PineconeRecord,
	RecordMetadata,
} from '@pinecone-database/pinecone';
import { downloadFromS3 } from './s3.server';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import {
	Document,
	RecursiveCharacterTextSplitter,
} from '@pinecone-database/doc-splitter';
import { getEmbeddings } from './embeddings';
import md5 from 'md5';
// import { convertToAscii } from './utils';

let pinecone: Pinecone | null = null;

export const getPineconeClient = async () => {
	if (!pinecone) {
		pinecone = new Pinecone();
	}

	return pinecone;
};

type PDFPage = {
	pageContent: string;
	metadata: {
		loc: { pageNumber: number };
	};
};

export async function loadS3IntoPinecone(file_key: string) {
	console.log('downloading s3 into filesystem');
	const file_name = await downloadFromS3(file_key);

	if (!file_name) {
		throw new Error('could not download fom s3');
	}

	const loader = new PDFLoader(file_name);
	const pages = (await loader.load()) as PDFPage[];

	const documents = await Promise.all(pages.map(prepareDocument));

	const vectors = await Promise.all(documents.flat().map(embedDocument));

	const client = await getPineconeClient();
	const pineconeIndex = client.Index('chatpdf-yt');

	console.log('inserting vectors into pinecone');

	// const namespace = convertToAscii(file_key);

	//FIXME: namespaces do not work for free tier
	// PineconeUtils.chunkedUpsert(pineconeIndex, vectors, namespace, 10);
	pineconeIndex.upsert(vectors);

	return documents[0];
}

async function embedDocument(doc: Document) {
	try {
		const embeddings = await getEmbeddings(doc.pageContent);
		const hash = md5(doc.pageContent);

		return {
			id: hash,
			values: embeddings,
			metadata: {
				text: doc.metadata.text,
				pageNumber: doc.metadata.pageNumber,
			},
		} as PineconeRecord<RecordMetadata>;
	} catch (error) {
		console.error('error embedding documents', error);
		throw error;
	}
}

export const truncateStringByBytes = (str: string, bytes: number) => {
	const encoder = new TextEncoder();

	return new TextDecoder('utf-8').decode(encoder.encode(str).slice(0, bytes));
};

async function prepareDocument(page: PDFPage) {
	let { pageContent, metadata } = page;

	pageContent = pageContent.replace(/\n/g, '');

	const splitter = new RecursiveCharacterTextSplitter();
	const docs = await splitter.splitDocuments([
		new Document({
			pageContent,
			metadata: {
				pageNumber: metadata.loc.pageNumber,
				text: truncateStringByBytes(pageContent, 36000),
			},
		}),
	]);

	console.log('docs', docs);

	return docs;
}
