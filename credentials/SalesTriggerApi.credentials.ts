import type { Icon, ICredentialType, INodeProperties } from 'n8n-workflow';
import { IAuthenticate, ICredentialTestRequest } from 'n8n-workflow/dist/esm/interfaces';

export class SalesTriggerApi implements ICredentialType {
	name = 'salesTriggerApi';
	displayName = 'SalesTrigger API';
	icon: Icon = { light: 'file:salestrigger_l.svg', dark: 'file:salestrigger_d.svg', };
	documentationUrl = 'https://farakhov0ruslan.github.io/salestrigger-integration-docs.github.io';
	properties: INodeProperties[] = [
		{
			displayName: 'API Token',
			name: 'apiToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
		},
	];

	// General authentication for httpRequestWithAuthentication
	authenticate: IAuthenticate = {
		type: 'generic',
		properties: {
			headers: {
				'X-AUTH-TYPE': 'API_TOKEN',
				'X-AUTH-TOKEN': '={{$credentials.apiToken}}',
				'Content-Type': 'application/json',
			},
		},
	};


	// Credential test
	test: ICredentialTestRequest = {
		request: {
			method: 'GET',
			baseURL: 'https://outreach.salestrigger.io/api',
			url: '/beta/session/session',
		},
	};
}
