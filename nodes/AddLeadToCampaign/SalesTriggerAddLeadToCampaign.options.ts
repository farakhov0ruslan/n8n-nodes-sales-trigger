// eslint-disable-line n8n-nodes-base/node-filename-against-convention
import type {
	INodeTypeDescription,
	IExecuteFunctions,
	ILoadOptionsFunctions,
	JsonObject,
} from 'n8n-workflow';

import { NodeApiError } from 'n8n-workflow';

export const nodeDescription: INodeTypeDescription = {
	displayName: 'SalesTrigger',
	name: 'salesTrigger',
	icon: 'file:salestrigger.svg',
	group: ['transform'],
	documentationUrl: 'https://farakhov0ruslan.github.io/salestrigger-integration-docs.github.io/',
	version: 1,
	subtitle: '={{$parameter.operation}}',
	description: 'Interact with SalesTrigger API',
	defaults: {
		name: 'SalesTrigger',
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
		// -------------------------
		// Operation (общая для ноды)
		// -------------------------
		{
			displayName: 'Operation',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			default: 'addLead',
			options: [
				{
					name: 'Add Lead to API Campaign',
					value: 'addLead',
					action: 'Add lead to api campaign',
					description: 'Add a LinkedIn lead to a selected API campaign',
				},
				// {
				// 	name: 'Empty Action (Placeholder)',
				// 	value: 'emptyAction',
				// 	action: 'Do nothing',
				// 	description: 'Placeholder for a future operation (UI only for now)',
				// },
			],
		},

		// -------------------------
		// Параметры addLead
		// -------------------------
		{
			displayName: 'Campaign Name or ID',
			name: 'campaignId',
			type: 'options',
			typeOptions: { loadOptionsMethod: 'getCampaigns' },
			required: true,
			default: '',
			displayOptions: { show: { operation: ['addLead'] } },
			description:
				'Choose a campaign to add the lead into. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		},
		{
			displayName: 'Lead LinkedIn URL',
			name: 'lead_linkedin_href',
			type: 'string',
			required: true,
			default: '',
			displayOptions: { show: { operation: ['addLead'] } },
			placeholder: 'https://www.linkedin.com/in/<PUBLIC-ID>/',
		},
		// Message 1..10
		...Array.from({ length: 10 }, (_, i) => {
			const n = i + 1;
			return {
				displayName: `Message ${n}`,
				name: `message_${n}`,
				type: 'string' as const,
				required: n === 1,
				default: n === 1 ? 'Hi!' : '',
				displayOptions: { show: { operation: ['addLead'] } },
				description: `Mapped to custom_field_${n}`,
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
