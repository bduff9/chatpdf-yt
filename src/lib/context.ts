import { Pinecone } from '@pinecone-database/pinecone';
// import { convertToAscii } from "./utils";
import { getEmbeddings } from './embeddings';

export const getMatchesFromEmbeddings = async (
	embeddings: number[],
	fileKey: string
) => {
	const pinecone = new Pinecone();
	const index = pinecone.Index('chatpdf-yt');

	try {
		// const namespace = convertToAscii(fileKey);
		const queryResult = await index.query({
			topK: 5,
			vector: embeddings,
			includeMetadata: true,
		});

		return queryResult.matches ?? [];
	} catch (error) {
		console.error('Error querying embeddings', error);
		throw error;
	}
};

export const getContext = async (query: string, fileKey: string) => {
	const queryEmbeddings = await getEmbeddings(query);
	const matches = await getMatchesFromEmbeddings(queryEmbeddings, fileKey);
	const qualifyingDocs = matches.filter(
		(match) => match.score && match.score > 0.7
	);

	type Metadata = {
		text: string;
		pageNumber: number;
	};

	let docs = qualifyingDocs.map((match) => (match.metadata as Metadata).text);

	return docs.join('\n').substring(0, 3000);
};
