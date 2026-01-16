import {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeApiError,
	INodePropertyOptions,
} from 'n8n-workflow';

interface CampaignListItem {
	campaign_info: {
		id: string | number;
		campaign_name: string;
	};
}

import {
	nodeDescription,
	throwApiErrorFromResponse,
} from './SalesTriggerAddLeadToCampaign.options';

// eslint-disable-next-line @n8n/community-nodes/icon-validation
export class SalesTriggerAddLeadToCampaign implements INodeType {
	description: INodeTypeDescription = nodeDescription;
	methods = {
		loadOptions: {
			async getCampaigns(this: ILoadOptionsFunctions) {
				this.logger.debug("xxxx")
				const res = await this.helpers.httpRequestWithAuthentication.call(this, 'salesTriggerApi', {
					method: 'GET',
					// url: 'https://outreach.salestrigger.io/api/beta/campaign/operations/list-campaigns',
					url: "http://0.0.0.0:15600/beta/campaign/operations/list-campaigns",
					qs: { only_api_campaigns: true },
				});

				const list = res as unknown as CampaignListItem[];
				this.logger.debug("dfdfdfdf")
				return list.map(
					({ campaign_info }): INodePropertyOptions => ({
						name: campaign_info.campaign_name,
						value: String(campaign_info.id),
					}),
				);
			},
		},
	};

	// Main execution call
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const campaignId = this.getNodeParameter('campaignId', i) as string;
				const leadHref = this.getNodeParameter('lead_linkedin_href', i) as string;

				// Collect custom_field_1..10 from message_* inputs
				const leadObject: Record<string, string> = {
					lead_href: leadHref,
				};

				for (let n = 1; n <= 10; n++) {
					const message = this.getNodeParameter(`message_${n}`, i, '') as string;
					if (message) {
						leadObject[`custom_field_${n}`] = message;
					}
				}

				const body = {
					source: {
						connection_type: 'API_N8N',
					},
					lead_object: leadObject,
				};

				const { body: respBody, statusCode } =
					await this.helpers.httpRequestWithAuthentication.call(this, 'salesTriggerApi', {
						method: 'POST',
						url: `https://outreach.salestrigger.io/api/beta/campaign/${campaignId}/api-add-lead`,
						body,
						json: true,
						returnFullResponse: true,
						ignoreHttpStatusErrors: true,
					});


				// Requirement: only 201 is considered successful
				if (statusCode !== 201) {
					throwApiErrorFromResponse(this, respBody, statusCode, i);
				}

				returnData.push({ json: { success: true, statusCode }, pairedItem: { item: i } });
			} catch (error) {
				// Only unexpected errors remain here (network, JS, etc.)
				if (this.continueOnFail()) {
					returnData.push({
						json: { success: false, error: error?.message ?? 'Unknown error' },
						pairedItem: { item: i },
					});
					continue;
				}
				// If it's already NodeApiError - just rethrow; otherwise wrap briefly
				if (error.name === 'NodeApiError') throw error;
				throw new NodeApiError(
					this.getNode(),
					{},
					{ message: error?.message ?? 'Error', itemIndex: i },
				);
			}
		}
		return [returnData];
	}
}
