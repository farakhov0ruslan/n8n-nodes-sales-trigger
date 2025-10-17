// eslint-disable-line n8n-nodes-base/node-filename-against-convention
import type {
	INodeTypeDescription,
	IExecuteFunctions,
	ILoadOptionsFunctions,
	JsonObject,
} from 'n8n-workflow';

import { NodeApiError } from 'n8n-workflow';

export const nodeDescription: INodeTypeDescription = {
	displayName: 'SalesTrigger: Add Lead to Campaign',
	name: 'salesTriggerAddLeadToCampaign',
	icon: 'file:salestrigger.svg',
	group: ['transform'],
	version: 1,
	subtitle: 'Add lead with optional messages to selected campaign',
	description: 'Adds a lead to a SalesTrigger campaign via API',
	defaults: {
		name: 'Add Lead to Campaign',
	},
	inputs: ['main'],
	outputs: ['main'],
	credentials: [
		{
			name: 'salesTriggerApi',
			required: true,
		},
	],
	properties: [
		// 1) Выбор кампании (динамически)
		{
			displayName: 'Campaign Name or ID',
			name: 'campaignId',
			type: 'options',
			typeOptions: {
				loadOptionsMethod: 'getCampaigns',
			},
			required: true,
			default: '',
			description:
				'Choose a campaign to add the lead into. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		},

		// 2) Lead URL
		{
			displayName: 'Lead LinkedIn URL',
			name: 'lead_linkedin_href',
			type: 'string',
			required: true,
			default: '',
			placeholder: 'https://www.linkedin.com/in/{public-ID}/',
		},

		// 3) Сообщения 1..10
		...Array.from({ length: 10 }, (_, i) => {
			const n = i + 1;
			return {
				displayName: `Message ${n}`,
				name: `message_${n}`,
				type: 'string' as const,
				required: n === 1, // первое обязательное, остальные опциональны
				default: n === 1 ? 'Hi!' : '',
				description: `${n} message that will be sent to the lead`,
			};
		}),
	],
};

function isRecord(v: unknown): v is Record<string, unknown> {
	return typeof v === 'object' && v !== null;
}

function getString(o: Record<string, unknown>, key: string): string | undefined {
	const val = o[key];
	return typeof val === 'string' ? val : undefined;
}

function getFirstExtraMessage(o: Record<string, unknown>): string | undefined {
	const extra = o['extra'];
	if (Array.isArray(extra) && extra.length > 0) {
		const first = extra[0];
		if (isRecord(first) && typeof first['message'] === 'string') {
			return first['message'] as string;
		}
	}
	return undefined;
}

/**
 * Собираем и бросаем NodeApiError по коду/телу ответа (кейс: не-201).
 */
export function throwApiErrorFromResponse(
	ctx: IExecuteFunctions | ILoadOptionsFunctions,
	respBody: unknown,
	statusCode: number | string,
	itemIndex?: number,
): never {
	const body = normalizeBody(respBody);
	const detail =
		getString(body, 'detail') ?? getString(body, 'message') ?? getString(body, 'error') ?? 'Error';
	const extraFirst = getFirstExtraMessage(body) ?? 'no extra details';

	const message = `[${statusCode}] ${detail} — ${extraFirst}`;

	const asJsonObject = body as unknown as JsonObject;

	throw new NodeApiError(ctx.getNode(), asJsonObject, {
		message,
		httpCode: String(statusCode),
		itemIndex,
	});
}

/** Безопасно нормализуем тело ответа в объект */
function normalizeBody(input: unknown): Record<string, unknown> {
	if (!input) return {};
	if (isRecord(input)) return input as Record<string, unknown>;
	if (typeof input === 'string') {
		const s = input.trim();
		if (s.startsWith('{') && s.endsWith('}')) {
			try {
				return JSON.parse(s) as Record<string, unknown>;
			} catch {
				/* noop */
			}
		}
		return { message: s };
	}
	return { message: String(input) };
}
